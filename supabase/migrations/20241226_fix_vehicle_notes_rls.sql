-- Add RLS policies for vehicle_notes table if they don't exist
-- This fixes the "table not found in schema cache" error

-- Create vehicle_notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS vehicle_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  note_text TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_notes_vehicle_id ON vehicle_notes(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_notes_created_by ON vehicle_notes(created_by);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE vehicle_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can do everything with vehicle notes" ON vehicle_notes;
DROP POLICY IF EXISTS "Users can view vehicle notes" ON vehicle_notes;
DROP POLICY IF EXISTS "Users can create vehicle notes" ON vehicle_notes;
DROP POLICY IF EXISTS "Users can update own vehicle notes" ON vehicle_notes;
DROP POLICY IF EXISTS "Users can delete own vehicle notes" ON vehicle_notes;

-- RLS Policies for vehicle_notes table
CREATE POLICY "Admins can do everything with vehicle notes" ON vehicle_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view vehicle notes" ON vehicle_notes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create vehicle notes" ON vehicle_notes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update own vehicle notes" ON vehicle_notes
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can delete own vehicle notes" ON vehicle_notes
  FOR DELETE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at if it doesn't exist
DROP TRIGGER IF EXISTS update_vehicle_notes_updated_at ON vehicle_notes;
CREATE TRIGGER update_vehicle_notes_updated_at BEFORE UPDATE ON vehicle_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

