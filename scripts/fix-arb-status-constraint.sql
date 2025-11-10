-- Quick Fix: Update ARB Status Constraint
-- Run this in your Supabase SQL Editor to immediately fix the ARB status validation error
-- This allows all four values that the frontend uses: 'Absent', 'Present', 'In Transit', 'Failed'

-- Step 1: Drop the existing constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_arb_status_check;

-- Step 2: Ensure the column exists (add it if it doesn't)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'arb_status') THEN
    ALTER TABLE vehicles ADD COLUMN arb_status TEXT;
  END IF;
END $$;

-- Step 3: Check what invalid values exist (for debugging)
SELECT DISTINCT arb_status, COUNT(*) as count
FROM vehicles
WHERE arb_status IS NOT NULL 
  AND arb_status NOT IN ('Absent', 'Present', 'In Transit', 'Failed')
GROUP BY arb_status;

-- Step 4: Clean up any invalid arb_status values
-- Set invalid values to NULL (you can change NULL to 'Absent' if you prefer a default)
UPDATE vehicles 
SET arb_status = NULL 
WHERE arb_status IS NOT NULL 
  AND arb_status NOT IN ('Absent', 'Present', 'In Transit', 'Failed');

-- Step 5: Recreate the constraint with all allowed values
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_arb_status_check 
CHECK (arb_status IS NULL OR arb_status IN ('Absent', 'Present', 'In Transit', 'Failed'));

-- Step 6: Verify the constraint was created correctly
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND conname = 'vehicles_arb_status_check';

-- Success message
SELECT 'ARB status constraint fixed successfully! All values (Absent, Present, In Transit, Failed) are now allowed.' as message;

