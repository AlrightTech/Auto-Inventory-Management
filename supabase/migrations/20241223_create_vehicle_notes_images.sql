-- Create vehicle_notes table
CREATE TABLE IF NOT EXISTS vehicle_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicle_images table
CREATE TABLE IF NOT EXISTS vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_notes_vehicle_id ON vehicle_notes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON vehicle_images(vehicle_id);

-- Add auction fields to vehicles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'auction_name') THEN
    ALTER TABLE vehicles ADD COLUMN auction_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'auction_date') THEN
    ALTER TABLE vehicles ADD COLUMN auction_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'purchase_date') THEN
    ALTER TABLE vehicles ADD COLUMN purchase_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vehicles' AND column_name = 'arb_status') THEN
    ALTER TABLE vehicles ADD COLUMN arb_status TEXT CHECK (arb_status IN ('Absent', 'Present', 'In Transit', 'Failed'));
  END IF;
END $$;

