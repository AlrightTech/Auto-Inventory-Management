-- COMPLETE VEHICLE CREATION FIX - STEP BY STEP
-- This script will create the complete vehicles table and fix all constraints
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the vehicles table completely if it exists
DROP TABLE IF EXISTS vehicles CASCADE;

-- Step 2: Create the complete vehicles table with all fields
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Vehicle Information
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT UNIQUE,
  trim TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  
  -- Vehicle Status and Details
  status TEXT DEFAULT 'Pending',
  odometer INTEGER,
  title_status TEXT DEFAULT 'Absent',
  psi_status TEXT,
  dealshield_arbitration_status TEXT,
  
  -- Financial Information
  bought_price DECIMAL(10,2),
  buy_fee DECIMAL(10,2),
  sale_invoice DECIMAL(10,2),
  total_vehicle_cost DECIMAL(10,2),
  other_charges DECIMAL(10,2),
  
  -- Sale Information
  sale_date DATE,
  lane INTEGER,
  run INTEGER,
  channel TEXT,
  
  -- Location Information
  facilitating_location TEXT,
  vehicle_location TEXT,
  pickup_location_address1 TEXT,
  pickup_location_city TEXT,
  pickup_location_state TEXT,
  pickup_location_zip TEXT,
  pickup_location_phone TEXT,
  
  -- Seller and Buyer Information
  seller_name TEXT,
  buyer_dealership TEXT,
  buyer_contact_name TEXT,
  buyer_aa_id TEXT,
  buyer_reference TEXT,
  sale_invoice_status TEXT,
  
  -- System Fields
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add constraints after table creation
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN ('Present', 'Absent'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_sale_invoice_status_check 
CHECK (sale_invoice_status IN ('PAID', 'UNPAID'));

-- Step 4: Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
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

-- Step 6: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Test the complete setup
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a test user ID
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Test insert with 'In Progress' status
        INSERT INTO vehicles (make, model, year, status, title_status, created_by)
        VALUES ('Test', 'Model', 2023, 'In Progress', 'Present', test_user_id);
        
        -- Clean up test record
        DELETE FROM vehicles WHERE make = 'Test' AND model = 'Model';
        
        RAISE NOTICE 'Test insert successful - vehicles table is working correctly!';
    ELSE
        RAISE NOTICE 'No users found in profiles table - skipping test insert';
    END IF;
END $$;

-- Step 8: Verify the table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
ORDER BY ordinal_position;

-- Step 9: Verify constraints
SELECT 
    conname as constraint_name,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'vehicles'::regclass 
AND contype = 'c'
ORDER BY conname;

SELECT 'Vehicle creation system setup complete!' as message;
