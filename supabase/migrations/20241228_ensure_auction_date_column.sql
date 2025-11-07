-- Ensure auction_date column exists in vehicles table
-- This fixes the "Could not find the 'auction_date' column" error

DO $$ 
BEGIN
  -- Check if auction_date column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'vehicles' 
    AND column_name = 'auction_date'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN auction_date DATE;
    RAISE NOTICE 'Added auction_date column to vehicles table';
  ELSE
    RAISE NOTICE 'auction_date column already exists in vehicles table';
  END IF;
END $$;

