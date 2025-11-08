-- Add image_url column to vehicles table for primary vehicle image
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'image_url') THEN
    ALTER TABLE vehicles ADD COLUMN image_url TEXT;
  END IF;
END $$;

