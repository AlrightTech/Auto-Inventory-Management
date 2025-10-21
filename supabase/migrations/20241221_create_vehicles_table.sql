-- Create comprehensive vehicles table based on Excel structure
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Vehicle Information
  vin TEXT UNIQUE,
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  trim TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  
  -- Vehicle Status and Details
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress')),
  odometer INTEGER,
  title_status TEXT DEFAULT 'Absent' CHECK (title_status IN ('Present', 'Absent')),
  psi_status TEXT DEFAULT 'Not Eligible',
  dealshield_arbitration_status TEXT DEFAULT '--',
  
  -- Financial Information
  bought_price DECIMAL(10,2),
  buy_fee DECIMAL(10,2) DEFAULT 0,
  sale_invoice DECIMAL(10,2),
  total_vehicle_cost DECIMAL(10,2),
  other_charges DECIMAL(10,2) DEFAULT 0,
  
  -- Sale Information
  sale_date DATE,
  lane INTEGER,
  run INTEGER,
  channel TEXT DEFAULT 'Simulcast',
  
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
  sale_invoice_status TEXT DEFAULT 'UNPAID' CHECK (sale_invoice_status IN ('PAID', 'UNPAID')),
  
  -- System Fields
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicles_vin ON vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_make_model ON vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_by ON vehicles(created_by);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);

-- Enable Row Level Security
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin: full access to all vehicles
CREATE POLICY "Admin full access to vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Seller: access to vehicles they created
CREATE POLICY "Seller access to own vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'seller'
      AND vehicles.created_by = auth.uid()
    )
  );

-- Transporter: read-only access to all vehicles
CREATE POLICY "Transporter read access to vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'transporter'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_vehicles_updated_at_trigger
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_vehicles_updated_at();

-- Create function to calculate total vehicle cost
CREATE OR REPLACE FUNCTION calculate_total_vehicle_cost()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total vehicle cost as bought_price + buy_fee + other_charges
  NEW.total_vehicle_cost = COALESCE(NEW.bought_price, 0) + COALESCE(NEW.buy_fee, 0) + COALESCE(NEW.other_charges, 0);
  
  -- Set sale_invoice to total_vehicle_cost if not provided
  IF NEW.sale_invoice IS NULL THEN
    NEW.sale_invoice = NEW.total_vehicle_cost;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate costs
CREATE TRIGGER calculate_vehicle_costs_trigger
  BEFORE INSERT OR UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_total_vehicle_cost();



