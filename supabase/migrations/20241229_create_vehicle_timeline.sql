-- Create vehicle_timeline table
CREATE TABLE IF NOT EXISTS vehicle_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  action_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_time TIME NOT NULL DEFAULT CURRENT_TIME,
  cost DECIMAL(10,2),
  expense_value DECIMAL(10,2),
  note TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_timeline_vehicle_id ON vehicle_timeline(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_timeline_created_at ON vehicle_timeline(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_timeline_user_id ON vehicle_timeline(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_timeline_action_date ON vehicle_timeline(action_date DESC);

-- Create unique index to prevent duplicate entries based on vehicle_id, action, action_date, action_time, and note
CREATE UNIQUE INDEX IF NOT EXISTS idx_vehicle_timeline_unique_entry 
  ON vehicle_timeline(vehicle_id, action, action_date, action_time, COALESCE(note, ''));

-- Enable Row Level Security (RLS)
ALTER TABLE vehicle_timeline ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vehicle_timeline table
CREATE POLICY "Admins can do everything with vehicle timeline" ON vehicle_timeline
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view vehicle timeline" ON vehicle_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create vehicle timeline entries" ON vehicle_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

-- Note: Timeline entries are typically not updated or deleted, but admins can do so if needed
CREATE POLICY "Admins can update vehicle timeline" ON vehicle_timeline
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete vehicle timeline" ON vehicle_timeline
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

