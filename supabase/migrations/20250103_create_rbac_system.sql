-- RBAC System Migration
-- Creates permissions, roles, and role_permissions tables for granular access control

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'inventory.view', 'tasks.create'
  name TEXT NOT NULL, -- Display name e.g., 'View Inventory'
  description TEXT,
  module TEXT NOT NULL, -- Group permissions by module e.g., 'inventory', 'tasks'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create roles table (extends beyond basic admin/seller/transporter)
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- e.g., 'admin', 'seller', 'transporter', 'custom_role_1'
  display_name TEXT NOT NULL, -- e.g., 'Administrator', 'Seller', 'Transporter'
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions pivot table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  granted BOOLEAN DEFAULT TRUE, -- ON/OFF toggle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Add role_id to profiles table (nullable for backward compatibility)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(key);
CREATE INDEX IF NOT EXISTS idx_permissions_module ON permissions(module);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON profiles(role_id);

-- Enable RLS on new tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for permissions table
CREATE POLICY "Anyone can view permissions" ON permissions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage permissions" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for roles table
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage roles" ON roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for role_permissions table
CREATE POLICY "Anyone can view role permissions" ON role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON role_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system roles
INSERT INTO roles (name, display_name, description, is_system_role) VALUES
  ('admin', 'Administrator', 'Full system access with all permissions', TRUE),
  ('seller', 'Seller', 'Vendor managing vehicle listings and transactions', TRUE),
  ('transporter', 'Transporter', 'Customer browsing and purchasing vehicles', TRUE)
ON CONFLICT (name) DO NOTHING;

-- Insert all permissions for the system
-- Dashboard permissions
INSERT INTO permissions (key, name, description, module) VALUES
  ('dashboard.view', 'View Dashboard', 'Access to dashboard overview', 'dashboard'),

-- Task Management permissions
  ('tasks.view', 'View Tasks', 'View assigned and all tasks', 'tasks'),
  ('tasks.create', 'Create Tasks', 'Create new tasks', 'tasks'),
  ('tasks.edit', 'Edit Tasks', 'Edit existing tasks', 'tasks'),
  ('tasks.delete', 'Delete Tasks', 'Delete tasks', 'tasks'),
  ('tasks.assign', 'Assign Tasks', 'Assign tasks to users', 'tasks'),

-- Inventory permissions
  ('inventory.view', 'View Inventory', 'View vehicle inventory', 'inventory'),
  ('inventory.create', 'Create Vehicles', 'Add new vehicles to inventory', 'inventory'),
  ('inventory.edit', 'Edit Vehicles', 'Edit existing vehicles', 'inventory'),
  ('inventory.delete', 'Delete Vehicles', 'Delete vehicles from inventory', 'inventory'),
  ('inventory.view_all', 'View All Inventory', 'View all vehicles across all sellers', 'inventory'),

-- ARB permissions
  ('arb.view', 'View ARB', 'View ARB status and information', 'arb'),
  ('arb.manage', 'Manage ARB', 'Manage ARB filings and status', 'arb'),

-- Events permissions
  ('events.view', 'View Events', 'View scheduled events', 'events'),
  ('events.create', 'Create Events', 'Create new events', 'events'),
  ('events.edit', 'Edit Events', 'Edit existing events', 'events'),
  ('events.delete', 'Delete Events', 'Delete events', 'events'),

-- Chat permissions
  ('chat.view', 'View Chat', 'Access chat functionality', 'chat'),
  ('chat.send', 'Send Messages', 'Send chat messages', 'chat'),

-- Sold vehicles permissions
  ('sold.view', 'View Sold Vehicles', 'View sold vehicle records', 'sold'),
  ('sold.manage', 'Manage Sold Vehicles', 'Manage sold vehicle records', 'sold'),

-- Accounting permissions
  ('accounting.view', 'View Accounting', 'View accounting summary', 'accounting'),
  ('accounting.purchases.view', 'View Purchases', 'View purchase records', 'accounting'),
  ('accounting.purchases.manage', 'Manage Purchases', 'Create and edit purchase records', 'accounting'),
  ('accounting.sold.view', 'View Sold Records', 'View sold vehicle accounting records', 'accounting'),
  ('accounting.sold.manage', 'Manage Sold Records', 'Manage sold vehicle accounting records', 'accounting'),
  ('accounting.reports.view', 'View Reports', 'View accounting reports', 'accounting'),
  ('accounting.reports.export', 'Export Reports', 'Export accounting reports', 'accounting'),

-- VIN Decode permissions
  ('vin_decode.view', 'View VIN Decode', 'Access VIN decode functionality', 'vin_decode'),
  ('vin_decode.decode', 'Decode VIN', 'Decode VIN numbers', 'vin_decode'),

-- User Management permissions
  ('users.view', 'View Users', 'View user list', 'users'),
  ('users.create', 'Create Users', 'Create new users', 'users'),
  ('users.edit', 'Edit Users', 'Edit user information', 'users'),
  ('users.delete', 'Delete Users', 'Delete users', 'users'),

-- Settings permissions
  ('settings.view', 'View Settings', 'Access settings page', 'settings'),
  ('settings.manage', 'Manage Settings', 'Modify system settings', 'settings'),
  ('settings.dropdowns.manage', 'Manage Dropdowns', 'Manage dropdown settings', 'settings'),
  ('settings.staff.manage', 'Manage Staff', 'Manage staff settings', 'settings'),
  ('settings.transporter.manage', 'Manage Transporter Settings', 'Manage transporter settings', 'settings'),

-- Role Management permissions
  ('roles.view', 'View Roles', 'View roles and permissions', 'roles'),
  ('roles.manage', 'Manage Roles', 'Create, edit, and delete roles', 'roles'),
  ('roles.permissions.manage', 'Manage Permissions', 'Assign permissions to roles', 'roles'),

-- Vehicle Assessments permissions
  ('assessments.view', 'View Assessments', 'View vehicle assessments', 'assessments'),
  ('assessments.create', 'Create Assessments', 'Create vehicle assessments', 'assessments'),
  ('assessments.edit', 'Edit Assessments', 'Edit vehicle assessments', 'assessments'),
  ('assessments.delete', 'Delete Assessments', 'Delete vehicle assessments', 'assessments'),

-- Notifications permissions
  ('notifications.view', 'View Notifications', 'View system notifications', 'notifications'),
  ('notifications.manage', 'Manage Notifications', 'Create and manage notifications', 'notifications')
ON CONFLICT (key) DO NOTHING;

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_id UUID)
RETURNS TABLE(permission_key TEXT, granted BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT p.key, COALESCE(rp.granted, FALSE) as granted
  FROM permissions p
  LEFT JOIN role_permissions rp ON p.id = rp.permission_id
  LEFT JOIN profiles pr ON pr.role_id = rp.role_id
  WHERE pr.id = user_id AND rp.granted = TRUE
  UNION
  -- Also check legacy role-based permissions (for backward compatibility)
  SELECT p.key, TRUE as granted
  FROM permissions p
  JOIN profiles pr ON pr.id = user_id
  WHERE 
    (pr.role = 'admin' AND p.key LIKE '%') OR
    (pr.role = 'seller' AND (
      p.key LIKE 'dashboard.%' OR
      p.key LIKE 'tasks.%' OR
      p.key LIKE 'inventory.%' OR
      p.key LIKE 'events.%' OR
      p.key LIKE 'chat.%' OR
      p.key LIKE 'sold.view' OR
      p.key LIKE 'assessments.%' OR
      p.key LIKE 'notifications.view'
    )) OR
    (pr.role = 'transporter' AND (
      p.key LIKE 'dashboard.%' OR
      p.key LIKE 'tasks.view' OR
      p.key LIKE 'inventory.view' OR
      p.key LIKE 'events.view' OR
      p.key LIKE 'chat.%' OR
      p.key LIKE 'assessments.view' OR
      p.key LIKE 'notifications.view'
    ))
  AND NOT EXISTS (
    SELECT 1 FROM role_permissions rp2
    JOIN profiles pr2 ON pr2.role_id = rp2.role_id
    WHERE pr2.id = user_id AND rp2.permission_id = p.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, permission_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM get_user_permissions(user_id)
    WHERE permission_key = user_has_permission.permission_key AND granted = TRUE
  ) INTO has_permission;
  
  RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant default permissions to system roles
-- Admin gets all permissions
DO $$
DECLARE
  admin_role_id UUID;
  perm_record RECORD;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  FOR perm_record IN SELECT id FROM permissions LOOP
    INSERT INTO role_permissions (role_id, permission_id, granted)
    VALUES (admin_role_id, perm_record.id, TRUE)
    ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = TRUE;
  END LOOP;
END $$;

-- Seller gets specific permissions
DO $$
DECLARE
  seller_role_id UUID;
  seller_permissions TEXT[] := ARRAY[
    'dashboard.view',
    'tasks.view', 'tasks.create', 'tasks.edit',
    'inventory.view', 'inventory.create', 'inventory.edit',
    'events.view', 'events.create', 'events.edit',
    'chat.view', 'chat.send',
    'sold.view',
    'assessments.view', 'assessments.create', 'assessments.edit',
    'notifications.view'
  ];
  perm_record RECORD;
BEGIN
  SELECT id INTO seller_role_id FROM roles WHERE name = 'seller';
  
  FOR perm_record IN 
    SELECT id FROM permissions WHERE key = ANY(seller_permissions)
  LOOP
    INSERT INTO role_permissions (role_id, permission_id, granted)
    VALUES (seller_role_id, perm_record.id, TRUE)
    ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = TRUE;
  END LOOP;
END $$;

-- Transporter gets limited permissions
DO $$
DECLARE
  transporter_role_id UUID;
  transporter_permissions TEXT[] := ARRAY[
    'dashboard.view',
    'tasks.view',
    'inventory.view',
    'events.view',
    'chat.view', 'chat.send',
    'assessments.view',
    'notifications.view'
  ];
  perm_record RECORD;
BEGIN
  SELECT id INTO transporter_role_id FROM roles WHERE name = 'transporter';
  
  FOR perm_record IN 
    SELECT id FROM permissions WHERE key = ANY(transporter_permissions)
  LOOP
    INSERT INTO role_permissions (role_id, permission_id, granted)
    VALUES (transporter_role_id, perm_record.id, TRUE)
    ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = TRUE;
  END LOOP;
END $$;

-- Link existing profiles to roles based on their role field
UPDATE profiles p
SET role_id = r.id
FROM roles r
WHERE p.role = r.name AND p.role_id IS NULL;

