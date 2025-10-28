-- Update vehicles table to match TypeScript interface
-- This migration adds all the missing fields from the Vehicle interface

-- Add missing columns to vehicles table
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
ADD COLUMN IF NOT EXISTS sale_invoice_status TEXT CHECK (sale_invoice_status IN ('PAID', 'UNPAID'));

-- Update status enum to match TypeScript interface
ALTER TABLE vehicles 
DROP CONSTRAINT IF EXISTS vehicles_status_check;

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress'));

-- Update title_status enum to match TypeScript interface
ALTER TABLE vehicles 
DROP CONSTRAINT IF EXISTS vehicles_title_status_check;

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_title_status_check 
CHECK (title_status IN ('Present', 'Absent'));

-- Update arb_status enum to match TypeScript interface
ALTER TABLE vehicles 
DROP CONSTRAINT IF EXISTS vehicles_arb_status_check;

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_arb_status_check 
CHECK (arb_status IN ('Present', 'Absent'));

-- Rename sold_price to match TypeScript interface (it's not used in the interface, but keeping for compatibility)
-- The interface uses bought_price, sale_invoice, etc. instead

-- Add indexes for new fields that might be queried frequently
CREATE INDEX IF NOT EXISTS idx_vehicles_sale_date ON vehicles(sale_date);
CREATE INDEX IF NOT EXISTS idx_vehicles_seller_name ON vehicles(seller_name);
CREATE INDEX IF NOT EXISTS idx_vehicles_buyer_dealership ON vehicles(buyer_dealership);
CREATE INDEX IF NOT EXISTS idx_vehicles_facilitating_location ON vehicles(facilitating_location);
CREATE INDEX IF NOT EXISTS idx_vehicles_vehicle_location ON vehicles(vehicle_location);
