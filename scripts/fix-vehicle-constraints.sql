-- Fix vehicles table constraint to match TypeScript interface
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;

-- Add the correct constraint that matches the TypeScript interface
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'));

-- Also fix title_status constraint
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_title_status_check;

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN ('Present', 'Absent'));

-- Test the constraints
SELECT 'Constraints updated successfully!' as message;
