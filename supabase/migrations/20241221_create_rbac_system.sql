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

-- Add columns if they don't exist (for existing tables created without them)
DO $$ 
BEGIN
  -- Add permissions column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'permissions'
  ) THEN
    ALTER TABLE roles ADD COLUMN permissions JSONB DEFAULT '{}'::jsonb;
    -- Update existing rows to have default permissions
    UPDATE roles SET permissions = '{}'::jsonb WHERE permissions IS NULL;
    -- Now make it NOT NULL
    ALTER TABLE roles ALTER COLUMN permissions SET NOT NULL;
    ALTER TABLE roles ALTER COLUMN permissions SET DEFAULT '{}'::jsonb;
  END IF;

  -- Add description column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'description'
  ) THEN
    ALTER TABLE roles ADD COLUMN description TEXT;
  END IF;

  -- Add is_system_role column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'is_system_role'
  ) THEN
    ALTER TABLE roles ADD COLUMN is_system_role BOOLEAN DEFAULT false;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE roles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE roles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Handle display_name column if it exists (make it nullable or add default)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'display_name'
  ) THEN
    -- If display_name exists and is NOT NULL, update existing rows and make it nullable or add default
    BEGIN
      -- Update any NULL display_name values to use name
      UPDATE roles SET display_name = name WHERE display_name IS NULL;
      -- Try to make it nullable if it's currently NOT NULL
      ALTER TABLE roles ALTER COLUMN display_name DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN
      -- If we can't make it nullable, ensure it has a default
      ALTER TABLE roles ALTER COLUMN display_name SET DEFAULT '';
      UPDATE roles SET display_name = COALESCE(display_name, name) WHERE display_name IS NULL OR display_name = '';
    END;
  ELSE
    -- Add display_name column if it doesn't exist (nullable, defaults to name)
    ALTER TABLE roles ADD COLUMN display_name TEXT;
  END IF;
END $$;

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

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON roles;

-- RLS Policies for roles
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (
        role = 'admin' OR 
        role_id IN (
          SELECT id FROM roles WHERE name = 'Super Admin'
        )
      )
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

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;

-- Trigger for roles table
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert predefined system roles
-- Handle display_name column dynamically
DO $$
DECLARE
  has_display_name BOOLEAN;
BEGIN
  -- Check if display_name column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'roles' AND column_name = 'display_name'
  ) INTO has_display_name;

  IF has_display_name THEN
    -- Insert with display_name column
    INSERT INTO roles (name, description, is_system_role, permissions, display_name) VALUES
      (
        'Super Admin',
        'Ultimate system administrator with full access to all roles, permissions, and system functions',
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
    }'::jsonb,
    'Super Admin'
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
    }'::jsonb,
    'Office Staff'
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
    }'::jsonb,
    'Transporter'
  )
  ON CONFLICT (name) DO NOTHING;
  ELSE
    -- Insert without display_name column
    INSERT INTO roles (name, description, is_system_role, permissions) VALUES
      (
        'Super Admin',
        'Ultimate system administrator with full access to all roles, permissions, and system functions',
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
  END IF;
END $$;

-- Update existing admin users to use Super Admin role
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'Super Admin')
WHERE role = 'admin' AND role_id IS NULL;

