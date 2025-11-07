-- Create dropdown_settings table for dynamic dropdown management
CREATE TABLE IF NOT EXISTS dropdown_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, label)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dropdown_settings_category ON dropdown_settings(category);
CREATE INDEX IF NOT EXISTS idx_dropdown_settings_is_active ON dropdown_settings(is_active);
CREATE INDEX IF NOT EXISTS idx_dropdown_settings_category_active ON dropdown_settings(category, is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE dropdown_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dropdown_settings table
CREATE POLICY "Admins can do everything with dropdown settings" ON dropdown_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view active dropdown settings" ON dropdown_settings
  FOR SELECT USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_dropdown_settings_updated_at BEFORE UPDATE ON dropdown_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default Car Location options
INSERT INTO dropdown_settings (category, label, value, is_active) VALUES
  ('car_location', 'Missing', 'Missing', true),
  ('car_location', 'Shop/Mechanic', 'Shop/Mechanic', true),
  ('car_location', 'Auction', 'Auction', true),
  ('car_location', 'Other Mechanic', 'Other Mechanic', true),
  ('car_location', 'Unknown', 'Unknown', true),
  ('car_location', 'Other', 'Other', true),
  ('car_location', 'PDR', 'PDR', true)
ON CONFLICT (category, label) DO NOTHING;

