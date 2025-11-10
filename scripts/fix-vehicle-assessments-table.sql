-- Fix: Create vehicle_assessments table if it doesn't exist
-- Run this script in your Supabase SQL Editor to fix the "table not found" error

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
  
  -- Images
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view assessments" ON vehicle_assessments;
DROP POLICY IF EXISTS "Users can create assessments" ON vehicle_assessments;
DROP POLICY IF EXISTS "Users can update assessments" ON vehicle_assessments;
DROP POLICY IF EXISTS "Users can delete assessments" ON vehicle_assessments;

-- RLS Policies
CREATE POLICY "Users can view assessments" ON vehicle_assessments
  FOR SELECT USING (true);

CREATE POLICY "Users can create assessments" ON vehicle_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update assessments" ON vehicle_assessments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete assessments" ON vehicle_assessments
  FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_vehicle_assessments_updated_at 
  BEFORE UPDATE ON vehicle_assessments
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'vehicle_assessments') THEN
    RAISE NOTICE '✅ vehicle_assessments table created successfully!';
  ELSE
    RAISE EXCEPTION '❌ Failed to create vehicle_assessments table';
  END IF;
END $$;

