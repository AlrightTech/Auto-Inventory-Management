-- COMPLETE VEHICLE CREATION FIX
-- This script will fix the vehicle creation issue permanently
-- Run this in your Supabase SQL Editor

-- Step 1: Check current constraints
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c'
ORDER BY conname;

-- Step 2: Drop ALL existing constraints on vehicles table
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_title_status_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_sale_invoice_status_check;

-- Step 3: Recreate constraints with correct values
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN ('Present', 'Absent'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_sale_invoice_status_check 
CHECK (sale_invoice_status IN ('PAID', 'UNPAID'));

-- Step 4: Verify constraints were created correctly
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c'
ORDER BY conname;

-- Step 5: Test the constraints with sample data
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    -- Test insert with 'In Progress' status
    INSERT INTO vehicles (make, model, year, status, title_status, created_by)
    VALUES ('Test', 'Model', 2023, 'In Progress', 'Present', test_user_id);
    
    -- Clean up test record
    DELETE FROM vehicles WHERE make = 'Test' AND model = 'Model';
    
    RAISE NOTICE 'Test insert successful - constraints are working correctly!';
END $$;

-- Step 6: Final verification
SELECT 'Vehicle creation constraints fixed successfully!' as message;
