-- RBAC System Migration
-- Creates roles table and updates profiles to support custom roles

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- Prevents deletion of system roles
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update profiles table to support custom roles
-- First, drop the constraint if it exists
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add role_id foreign key (nullable for backward compatibility)
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Enable RLS on roles table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for roles
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (role = 'admin' OR role_id IN (
        SELECT id FROM roles WHERE name = 'Admin'
      ))
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for roles table
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert predefined system roles
INSERT INTO roles (name, description, is_system_role, permissions) VALUES
  (
    'Admin',
    'Full system access with all permissions',
    true,
    '{
      "inventory": {
        "view": true,
        "add": true,
        "edit": true,
        "upload_photos": true,
        "update_location": true,
        "condition_notes": true,
        "purchase_details": true,
        "title_status": true
      },
      "sold": {
        "view": true,
        "edit": true,
        "profit_visibility": true,
        "expenses_visibility": true,
        "transportation_costs": true,
        "arb": true,
        "adjust_price": true,
        "arb_outcome_history": true
      },
      "arb": {
        "access": true,
        "create": true,
        "update": true,
        "enter_outcomes": true,
        "enter_price_adjustment": true,
        "transportation_details": true,
        "upload_documents": true
      },
      "title": {
        "status": true,
        "upload_documents": true,
        "missing_titles_dashboard": true,
        "days_missing_tracker": true
      },
      "transportation": {
        "location_tracking": true,
        "transport_assignment": true,
        "transport_notes": true,
        "transport_cost_entry": true,
        "view_history": true
      },
      "accounting": {
        "profit_per_car": true,
        "weekly_profit_summary": true,
        "monthly_profit_summary": true,
        "total_pl_summary": true,
        "accounting_page": true,
        "expenses_section": true,
        "price_adjustment_log": true,
        "export_reports": true
      },
      "reports": {
        "profit_per_car": true,
        "weekly_profit_loss": true,
        "monthly_profit_loss": true,
        "arb_activity": true,
        "arb_transportation_cost": true,
        "price_adjustment_summary": true,
        "inventory_summary": true,
        "sold_cars_weekly_count": true,
        "missing_titles": true,
        "average_transportation_cost": true,
        "average_arb_adjustment_percentage": true
      },
      "user_management": {
        "view_users": true,
        "create_roles": true,
        "edit_roles": true,
        "assign_roles": true,
        "activity_logs": true,
        "permission_editing": true
      }
    }'::jsonb
  ),
  (
    'Office Staff',
    'Access to everything except profit and accounting',
    true,
    '{
      "inventory": {
        "view": true,
        "add": true,
        "edit": true,
        "upload_photos": true,
        "update_location": true,
        "condition_notes": true,
        "purchase_details": true,
        "title_status": true
      },
      "sold": {
        "view": true,
        "edit": true,
        "profit_visibility": false,
        "expenses_visibility": false,
        "transportation_costs": false,
        "arb": false,
        "adjust_price": false,
        "arb_outcome_history": false
      },
      "arb": {
        "access": false,
        "create": false,
        "update": false,
        "enter_outcomes": false,
        "enter_price_adjustment": false,
        "transportation_details": false,
        "upload_documents": false
      },
      "title": {
        "status": true,
        "upload_documents": true,
        "missing_titles_dashboard": true,
        "days_missing_tracker": true
      },
      "transportation": {
        "location_tracking": true,
        "transport_assignment": true,
        "transport_notes": true,
        "transport_cost_entry": false,
        "view_history": true
      },
      "accounting": {
        "profit_per_car": false,
        "weekly_profit_summary": false,
        "monthly_profit_summary": false,
        "total_pl_summary": false,
        "accounting_page": false,
        "expenses_section": false,
        "price_adjustment_log": false,
        "export_reports": false
      },
      "reports": {
        "profit_per_car": false,
        "weekly_profit_loss": false,
        "monthly_profit_loss": false,
        "arb_activity": false,
        "arb_transportation_cost": false,
        "price_adjustment_summary": false,
        "inventory_summary": true,
        "sold_cars_weekly_count": true,
        "missing_titles": true,
        "average_transportation_cost": false,
        "average_arb_adjustment_percentage": false
      },
      "user_management": {
        "view_users": false,
        "create_roles": false,
        "edit_roles": false,
        "assign_roles": false,
        "activity_logs": false,
        "permission_editing": false
      }
    }'::jsonb
  ),
  (
    'Transporter',
    'Restricted operational role - Inventory and location updates only',
    true,
    '{
      "inventory": {
        "view": true,
        "add": false,
        "edit": false,
        "upload_photos": false,
        "update_location": true,
        "condition_notes": false,
        "purchase_details": false,
        "title_status": false
      },
      "sold": {
        "view": false,
        "edit": false,
        "profit_visibility": false,
        "expenses_visibility": false,
        "transportation_costs": false,
        "arb": false,
        "adjust_price": false,
        "arb_outcome_history": false
      },
      "arb": {
        "access": false,
        "create": false,
        "update": false,
        "enter_outcomes": false,
        "enter_price_adjustment": false,
        "transportation_details": false,
        "upload_documents": false
      },
      "title": {
        "status": false,
        "upload_documents": false,
        "missing_titles_dashboard": false,
        "days_missing_tracker": false
      },
      "transportation": {
        "location_tracking": true,
        "transport_assignment": false,
        "transport_notes": true,
        "transport_cost_entry": false,
        "view_history": true
      },
      "accounting": {
        "profit_per_car": false,
        "weekly_profit_summary": false,
        "monthly_profit_summary": false,
        "total_pl_summary": false,
        "accounting_page": false,
        "expenses_section": false,
        "price_adjustment_log": false,
        "export_reports": false
      },
      "reports": {
        "profit_per_car": false,
        "weekly_profit_loss": false,
        "monthly_profit_loss": false,
        "arb_activity": false,
        "arb_transportation_cost": false,
        "price_adjustment_summary": false,
        "inventory_summary": true,
        "sold_cars_weekly_count": false,
        "missing_titles": false,
        "average_transportation_cost": false,
        "average_arb_adjustment_percentage": false
      },
      "user_management": {
        "view_users": false,
        "create_roles": false,
        "edit_roles": false,
        "assign_roles": false,
        "activity_logs": false,
        "permission_editing": false
      }
    }'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Update existing admin users to use Admin role
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
WHERE role = 'admin' AND role_id IS NULL;

