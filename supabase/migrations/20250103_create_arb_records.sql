-- Create vehicle_arb_records table to track all ARB history
CREATE TABLE IF NOT EXISTS vehicle_arb_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  arb_type TEXT NOT NULL CHECK (arb_type IN ('Sold ARB', 'Inventory ARB')),
  outcome TEXT NOT NULL CHECK (outcome IN (
    'Denied', 
    'Price Adjustment', 
    'Buyer Withdrew',
    'Withdrawn',
    'Pending'
  )),
  adjustment_amount DECIMAL(10,2),
  transport_type TEXT,
  transport_location TEXT,
  transport_date DATE,
  transport_cost DECIMAL(10,2),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_arb_records_vehicle_id ON vehicle_arb_records(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_arb_records_arb_type ON vehicle_arb_records(arb_type);
CREATE INDEX IF NOT EXISTS idx_vehicle_arb_records_outcome ON vehicle_arb_records(outcome);
CREATE INDEX IF NOT EXISTS idx_vehicle_arb_records_created_at ON vehicle_arb_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_arb_records_created_by ON vehicle_arb_records(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE vehicle_arb_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_arb_records table
CREATE POLICY "Admins can do everything with ARB records" ON vehicle_arb_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view ARB records" ON vehicle_arb_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create ARB records" ON vehicle_arb_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own ARB records" ON vehicle_arb_records
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete ARB records" ON vehicle_arb_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_vehicle_arb_records_updated_at BEFORE UPDATE ON vehicle_arb_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update vehicles table status constraint to include 'Pending Arbitration'
ALTER TABLE vehicles 
DROP CONSTRAINT IF EXISTS vehicles_status_check;

ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress', 'Pending Arbitration'));






