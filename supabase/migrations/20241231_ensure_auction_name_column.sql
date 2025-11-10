-- Ensure auction_name column exists in vehicles table
-- This migration explicitly adds the column if it doesn't exist to fix schema cache issues

DO $$ 
BEGIN
  -- Check if auction_name column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'vehicles' 
      AND column_name = 'auction_name'
  ) THEN
    ALTER TABLE vehicles ADD COLUMN auction_name TEXT;
    
    -- Add comment for documentation
    COMMENT ON COLUMN vehicles.auction_name IS 'Name of the auction where the vehicle was purchased (e.g., iaai, Manheim, CarMax, Adesa, Western)';
  END IF;
END $$;

-- Refresh the schema cache by querying the column
DO $$
BEGIN
  PERFORM auction_name FROM vehicles LIMIT 1;
EXCEPTION
  WHEN OTHERS THEN
    -- Column doesn't exist, this will be caught by the check above
    NULL;
END $$;



