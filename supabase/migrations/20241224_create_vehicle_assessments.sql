-- Create vehicle_assessments table for vehicle inspection records
CREATE TABLE IF NOT EXISTS vehicle_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  
  -- Assessment Info
  assessment_date DATE NOT NULL,
  assessment_time TIME NOT NULL,
  conducted_name TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  
  -- Vehicle Info Section
  miles_in INTEGER,
  color TEXT,
  cr_number TEXT,
  
  -- Dents & Scratches (stored as JSON)
  damage_markers JSONB DEFAULT '[]'::jsonb, -- Array of {x, y, type: 'dent'|'scratch', notes}
  
  -- Defects & Fuel Level
  pre_accident_defects TEXT,
  other_defects TEXT,
  work_requested JSONB DEFAULT '[]'::jsonb, -- Array of work items
  owner_instructions JSONB DEFAULT '[]'::jsonb, -- Array of instruction items
  fuel_level INTEGER CHECK (fuel_level >= 0 AND fuel_level <= 100), -- 0-100%
  
  -- File uploads
  assessment_file_url TEXT,
  assessment_file_name TEXT,
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  
  -- System Fields
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_assessments_vehicle_id ON vehicle_assessments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assessments_date ON vehicle_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_assessments_status ON vehicle_assessments(status);

-- Enable RLS
ALTER TABLE vehicle_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view assessments" ON vehicle_assessments
  FOR SELECT USING (true);

CREATE POLICY "Users can create assessments" ON vehicle_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update assessments" ON vehicle_assessments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete assessments" ON vehicle_assessments
  FOR DELETE USING (true);


