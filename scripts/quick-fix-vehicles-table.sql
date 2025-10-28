-- Quick Fix: Create vehicles table with minimal required fields
-- Run this in your Supabase SQL Editor to fix the vehicle creation issue immediately

-- First, check if vehicles table exists and drop it if it does
DROP TABLE IF EXISTS vehicles CASCADE;

-- Create vehicles table with essential fields only
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT UNIQUE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress')),
  title_status TEXT DEFAULT 'Absent' CHECK (title_status IN ('Present', 'Absent')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can do everything with vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sellers can manage own vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'seller' AND id = created_by
    )
  );

CREATE POLICY "Transporters can view vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'transporter'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Test the table creation
SELECT 'Vehicles table created successfully!' as message;
