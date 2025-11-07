-- Create vehicle_dispatch table
CREATE TABLE IF NOT EXISTS vehicle_dispatch (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  transport_company TEXT NOT NULL,
  transport_cost DECIMAL(10,2),
  address TEXT,
  state TEXT,
  zip TEXT,
  ac_assign_carrier TEXT,
  notes TEXT,
  file_url TEXT,
  file_name TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_dispatch_vehicle_id ON vehicle_dispatch(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_dispatch_created_at ON vehicle_dispatch(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_dispatch_created_by ON vehicle_dispatch(created_by);

-- Enable Row Level Security (RLS)
ALTER TABLE vehicle_dispatch ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_dispatch table
CREATE POLICY "Admins can do everything with vehicle dispatch" ON vehicle_dispatch
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view vehicle dispatch" ON vehicle_dispatch
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create vehicle dispatch" ON vehicle_dispatch
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own vehicle dispatch" ON vehicle_dispatch
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own vehicle dispatch" ON vehicle_dispatch
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_vehicle_dispatch_updated_at BEFORE UPDATE ON vehicle_dispatch
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

