-- Fix ARB status constraint to allow all frontend values
-- This migration fixes the vehicles_arb_status_check constraint to match the frontend options

-- Step 1: Drop the existing constraint if it exists
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_arb_status_check;

-- Step 2: Add the column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'arb_status') THEN
    ALTER TABLE vehicles ADD COLUMN arb_status TEXT;
  END IF;
END $$;

-- Step 3: Clean up any invalid arb_status values
-- Set invalid values to NULL (or 'Absent' as default)
UPDATE vehicles 
SET arb_status = NULL 
WHERE arb_status IS NOT NULL 
  AND arb_status NOT IN ('Absent', 'Present', 'In Transit', 'Failed');

-- Step 4: Recreate the constraint with all allowed values
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_arb_status_check 
CHECK (arb_status IS NULL OR arb_status IN ('Absent', 'Present', 'In Transit', 'Failed'));

