-- Remove assessment_file_url and assessment_file_name columns from vehicle_assessments table
-- This migration removes the file columns that are no longer needed

-- Drop the columns if they exist
ALTER TABLE vehicle_assessments 
  DROP COLUMN IF EXISTS assessment_file_url,
  DROP COLUMN IF EXISTS assessment_file_name;

-- Verify columns were removed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_assessments' 
    AND column_name = 'assessment_file_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicle_assessments' 
    AND column_name = 'assessment_file_name'
  ) THEN
    RAISE NOTICE '✅ assessment_file_url and assessment_file_name columns removed successfully!';
  ELSE
    RAISE NOTICE '⚠️ Some columns may still exist. Please check manually.';
  END IF;
END $$;

