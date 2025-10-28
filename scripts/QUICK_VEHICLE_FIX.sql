-- QUICK FIX: Update existing vehicles table
-- This script adds missing columns and fixes constraints
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns to existing vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS trim TEXT,
ADD COLUMN IF NOT EXISTS exterior_color TEXT,
ADD COLUMN IF NOT EXISTS interior_color TEXT,
ADD COLUMN IF NOT EXISTS psi_status TEXT,
ADD COLUMN IF NOT EXISTS dealshield_arbitration_status TEXT,
ADD COLUMN IF NOT EXISTS buy_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sale_invoice DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS total_vehicle_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS other_charges DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS sale_date DATE,
ADD COLUMN IF NOT EXISTS lane INTEGER,
ADD COLUMN IF NOT EXISTS run INTEGER,
ADD COLUMN IF NOT EXISTS channel TEXT,
ADD COLUMN IF NOT EXISTS facilitating_location TEXT,
ADD COLUMN IF NOT EXISTS vehicle_location TEXT,
ADD COLUMN IF NOT EXISTS pickup_location_address1 TEXT,
ADD COLUMN IF NOT EXISTS pickup_location_city TEXT,
ADD COLUMN IF NOT EXISTS pickup_location_state TEXT,
ADD COLUMN IF NOT EXISTS pickup_location_zip TEXT,
ADD COLUMN IF NOT EXISTS pickup_location_phone TEXT,
ADD COLUMN IF NOT EXISTS seller_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_dealership TEXT,
ADD COLUMN IF NOT EXISTS buyer_contact_name TEXT,
ADD COLUMN IF NOT EXISTS buyer_aa_id TEXT,
ADD COLUMN IF NOT EXISTS buyer_reference TEXT,
ADD COLUMN IF NOT EXISTS sale_invoice_status TEXT;

-- Step 2: Drop existing constraints
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_status_check;
ALTER TABLE vehicles DROP CONSTRAINT IF EXISTS vehicles_title_status_check;

-- Step 3: Add correct constraints
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN ('Present', 'Absent'));

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_sale_invoice_status_check 
CHECK (sale_invoice_status IN ('PAID', 'UNPAID'));

-- Step 4: Test the fix
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        INSERT INTO vehicles (make, model, year, status, title_status, created_by)
        VALUES ('Test', 'Model', 2023, 'In Progress', 'Present', test_user_id);
        
        DELETE FROM vehicles WHERE make = 'Test' AND model = 'Model';
        
        RAISE NOTICE 'Quick fix successful - vehicle creation should work now!';
    ELSE
        RAISE NOTICE 'No users found - please create a user first';
    END IF;
END $$;

SELECT 'Quick fix applied successfully!' as message;
