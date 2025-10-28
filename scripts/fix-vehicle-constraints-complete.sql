-- Complete Fix for Vehicle Creation Issues
-- Run this in your Supabase SQL Editor

-- First, let's see what constraints currently exist
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c';

-- Drop all existing constraints on vehicles table
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_title_status_check;

-- Recreate the constraints with the correct values
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN ('Present', 'Absent'));

-- Verify the constraints were created
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c';

-- Test with a sample insert to make sure it works
INSERT INTO vehicles (make, model, year, status, title_status, created_by)
VALUES ('Test', 'Model', 2023, 'In Progress', 'Present', (SELECT id FROM profiles LIMIT 1))
ON CONFLICT DO NOTHING;

-- Clean up the test record
DELETE FROM vehicles WHERE make = 'Test' AND model = 'Model';

SELECT 'Vehicle constraints fixed successfully!' as message;
