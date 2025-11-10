-- Auto Inventory Management Database Schema
-- This file contains all the necessary tables, RLS policies, and configurations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'seller', 'transporter')),
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Vehicle Information
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  vin TEXT UNIQUE,
  trim TEXT,
  exterior_color TEXT,
  interior_color TEXT,
  
  -- Vehicle Status and Details
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress')),
  odometer INTEGER,
  title_status TEXT DEFAULT 'Absent' CHECK (title_status IN ('Present', 'Absent')),
  psi_status TEXT,
  dealshield_arbitration_status TEXT,
  
  -- Financial Information
  bought_price DECIMAL(10,2),
  buy_fee DECIMAL(10,2),
  sale_invoice DECIMAL(10,2),
  total_vehicle_cost DECIMAL(10,2),
  other_charges DECIMAL(10,2),
  
  -- Sale Information
  sale_date DATE,
  lane INTEGER,
  run INTEGER,
  channel TEXT,
  
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
  sale_invoice_status TEXT CHECK (sale_invoice_status IN ('PAID', 'UNPAID')),
  
  -- System Fields
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vehicle_assessments table
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

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  assigned_by UUID REFERENCES profiles(id),
  category TEXT CHECK (category IN ('missing_title', 'file_arb', 'location', 'general')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  notes TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table (for chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_status table for online presence
CREATE TABLE IF NOT EXISTS user_status (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_vehicle_id ON tasks(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_events_assigned_to ON events(assigned_to);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_vehicle_assessments_vehicle_id ON vehicle_assessments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assessments_date ON vehicle_assessments(assessment_date);
CREATE INDEX IF NOT EXISTS idx_vehicle_assessments_status ON vehicle_assessments(status);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for vehicles table
CREATE POLICY "Admins can do everything with vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Sellers can manage own vehicles" ON vehicles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'seller' AND id = created_by
    )
  );

CREATE POLICY "Transporters can view vehicles" ON vehicles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'transporter'
    )
  );

-- RLS Policies for tasks table
CREATE POLICY "Admins can do everything with tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view assigned tasks" ON tasks
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update assigned tasks" ON tasks
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for events table
CREATE POLICY "Admins can do everything with events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view assigned events" ON events
  FOR SELECT USING (
    assigned_to = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can create events" ON events
  FOR INSERT WITH CHECK (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can update assigned events" ON events
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for messages table
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- RLS Policies for notifications table
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for user_status table
CREATE POLICY "Users can view all status" ON user_status
  FOR SELECT USING (true);

CREATE POLICY "Users can update own status" ON user_status
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own status" ON user_status
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for vehicle_assessments table
CREATE POLICY "Users can view assessments" ON vehicle_assessments
  FOR SELECT USING (true);

CREATE POLICY "Users can create assessments" ON vehicle_assessments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update assessments" ON vehicle_assessments
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete assessments" ON vehicle_assessments
  FOR DELETE USING (true);

-- Create functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_status_updated_at BEFORE UPDATE ON user_status
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_assessments_updated_at BEFORE UPDATE ON vehicle_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE user_status;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT;
BEGIN
  -- Count existing users to determine if this is the first user (admin)
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Set role: first user becomes admin, others get role from metadata or default to transporter
  IF user_count = 0 THEN
    user_role := 'admin';
  ELSE
    user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'transporter');
  END IF;
  
  INSERT INTO public.profiles (id, email, role, username)
  VALUES (
    NEW.id,
    NEW.email,
    user_role,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO public.user_status (user_id, is_online, last_seen)
  VALUES (NEW.id, false, NOW());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sample data will be created after users are registered in the application
-- The trigger function will automatically create profiles when users sign up
