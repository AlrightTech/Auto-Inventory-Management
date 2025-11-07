-- Update title_status constraint to allow all options used in the frontend
-- This fixes the "Failed to update vehicle" error when selecting title status

-- Drop the existing constraint if it exists
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_title_status_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS title_status_check;

-- Add new constraint with all valid title status options
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN (
  'Absent', 
  'In Transit', 
  'Received', 
  'Available not Received', 
  'Present', 
  'Released', 
  'Validated', 
  'Sent but not Validated'
));

-- Update any existing records that might have invalid values
UPDATE vehicles 
SET title_status = 'Absent' 
WHERE title_status NOT IN (
  'Absent', 
  'In Transit', 
  'Received', 
  'Available not Received', 
  'Present', 
  'Released', 
  'Validated', 
  'Sent but not Validated'
);

