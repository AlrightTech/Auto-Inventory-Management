-- RBAC System Migration
-- Creates permissions, roles, and role_permissions tables for granular access control

-- Drop existing RBAC objects if they exist (for clean migration)
-- Drop policies first (must be done before dropping tables)
DO $$ 
BEGIN
  -- Drop policies on permissions table
  DROP POLICY IF EXISTS "Anyone can view permissions" ON permissions;
  DROP POLICY IF EXISTS "Only admins can manage permissions" ON permissions;
  
  -- Drop policies on roles table
  DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
  DROP POLICY IF EXISTS "Only admins can manage roles" ON roles;
  
  -- Drop policies on role_permissions table
  DROP POLICY IF EXISTS "Anyone can view role permissions" ON role_permissions;
  DROP POLICY IF EXISTS "Only admins can manage role permissions" ON role_permissions;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Drop functions
DROP FUNCTION IF EXISTS get_user_permissions(UUID) CASCADE;
DROP FUNCTION IF EXISTS user_has_permission(UUID, TEXT) CASCADE;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_permissions_updated_at ON permissions;
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
DROP TRIGGER IF EXISTS update_role_permissions_updated_at ON role_permissions;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_permissions_key;
DROP INDEX IF EXISTS idx_permissions_module;
DROP INDEX IF EXISTS idx_roles_name;
DROP INDEX IF EXISTS idx_role_permissions_role_id;
DROP INDEX IF EXISTS idx_role_permissions_permission_id;
DROP INDEX IF EXISTS idx_profiles_role_id;

-- Drop tables (CASCADE to handle foreign key dependencies)
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Remove role_id column from profiles if it exists (will be re-added)
ALTER TABLE profiles DROP COLUMN IF EXISTS role_id;

-- Create permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL, -- e.g., 'inventory.view', 'tasks.create'
  name TEXT NOT NULL, -- Display name e.g., 'View Inventory'
  description TEXT,
  module TEXT NOT NULL, -- Group permissions by module e.g., 'inventory', 'tasks'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create roles table (extends beyond basic admin/seller/transporter)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- e.g., 'admin', 'seller', 'transporter', 'custom_role_1'
  display_name TEXT NOT NULL, -- e.g., 'Administrator', 'Seller', 'Transporter'
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- System roles cannot be deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create role_permissions pivot table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  granted BOOLEAN DEFAULT TRUE, -- ON/OFF toggle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Add role_id to profiles table (nullable for backward compatibility)
ALTER TABLE profiles ADD COLUMN role_id UUID REFERENCES roles(id) ON DELETE SET NULL;

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
  ('transporter', 'Transporter', 'Customer browsing and purchasing vehicles', TRUE),
  ('office_staff', 'Office Staff', 'Office staff with access to everything except profit/financial data', TRUE)
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
  ('inventory.view', 'View Inventory List', 'View vehicle inventory list', 'inventory'),
  ('inventory.create', 'Add New Inventory Car', 'Add new vehicles to inventory', 'inventory'),
  ('inventory.edit', 'Edit Inventory Car Details', 'Edit existing vehicle details', 'inventory'),
  ('inventory.delete', 'Delete Vehicles', 'Delete vehicles from inventory', 'inventory'),
  ('inventory.view_all', 'View All Inventory', 'View all vehicles across all sellers', 'inventory'),
  ('inventory.photos.manage', 'Upload/Edit Photos', 'Upload and edit vehicle photos', 'inventory'),
  ('inventory.location.update', 'Update Car Location', 'Update vehicle location information', 'inventory'),
  ('inventory.notes.manage', 'Condition / Mechanical Notes', 'Manage condition and mechanical notes', 'inventory'),
  ('inventory.purchase.manage', 'Purchase Details', 'Manage purchase details (buy price, seller info)', 'inventory'),
  ('inventory.title.manage', 'Title Status in Inventory', 'Manage title status in inventory', 'inventory'),

-- ARB permissions
  ('arb.view', 'Access to ARB dashboard', 'Access ARB dashboard and view ARB cases', 'arb'),
  ('arb.create', 'Create / Update ARB Cases', 'Create and update ARB cases', 'arb'),
  ('arb.outcome.enter', 'Enter ARB Outcome', 'Enter ARB outcome (Denied, Price Adjusted, Withdrawn)', 'arb'),
  ('arb.price.adjust', 'Enter Price Adjustment Amount', 'Enter price adjustment amount for ARB cases', 'arb'),
  ('arb.transport.manage', 'Enter Transportation Details/Cost', 'Enter transportation details and cost for withdrawn cases', 'arb'),
  ('arb.documents.upload', 'Upload ARB Documents', 'Upload documents related to ARB cases', 'arb'),

-- Events permissions
  ('events.view', 'View Events', 'View scheduled events', 'events'),
  ('events.create', 'Create Events', 'Create new events', 'events'),
  ('events.edit', 'Edit Events', 'Edit existing events', 'events'),
  ('events.delete', 'Delete Events', 'Delete events', 'events'),

-- Chat permissions
  ('chat.view', 'View Chat', 'Access chat functionality', 'chat'),
  ('chat.send', 'Send Messages', 'Send chat messages', 'chat'),

-- Sold vehicles permissions
  ('sold.view', 'View Sold Cars', 'View sold vehicle records', 'sold'),
  ('sold.edit', 'Edit Sold Car Details', 'Edit details of sold vehicles', 'sold'),
  ('sold.profit.view', 'Profit Visibility', 'View profit information for sold cars (Most restricted)', 'sold'),
  ('sold.expenses.view', 'Expenses Visibility', 'View expenses for sold vehicles', 'sold'),
  ('sold.transport.cost', 'Transportation Costs (sold section)', 'View and manage transportation costs for sold vehicles', 'sold'),
  ('sold.arb.view', 'ARB for Sold Cars', 'View ARB information for sold cars', 'sold'),
  ('sold.arb.adjust_price', 'Adjust Price (sold ARB)', 'Adjust price for sold cars with ARB', 'sold'),
  ('sold.arb.history', 'View ARB Outcome History', 'View ARB outcome history for sold cars', 'sold'),

-- Accounting permissions
  ('accounting.view', 'Accounting Page', 'Access accounting page', 'accounting'),
  ('accounting.profit.car', 'Profit Per Car (visible/invisible)', 'View profit per car information', 'accounting'),
  ('accounting.profit.weekly', 'Weekly Profit Summary', 'View weekly profit summary', 'accounting'),
  ('accounting.profit.monthly', 'Monthly Profit Summary', 'View monthly profit summary', 'accounting'),
  ('accounting.pnl.summary', 'Total P&L Summary Dashboard', 'View total profit and loss summary dashboard', 'accounting'),
  ('accounting.expenses.view', 'Expenses Section', 'View expenses section', 'accounting'),
  ('accounting.price.adjustment.log', 'Price Adjustment Log', 'View price adjustment log', 'accounting'),
  ('accounting.reports.export', 'Export Financial Reports', 'Export financial reports', 'accounting'),

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

-- Title & Documentation permissions
  ('title.status.view', 'Title Status (all sections)', 'View title status across all sections', 'title'),
  ('title.documents.upload', 'Upload Title Documents', 'Upload title documents', 'title'),
  ('title.missing.dashboard', 'Missing Titles Dashboard', 'Access missing titles dashboard', 'title'),
  ('title.missing.tracker', 'Days Missing Title Tracker', 'View and track days missing title', 'title'),

-- Transportation / Logistics permissions
  ('transport.location.track', 'Location Tracking (Inventory)', 'Track vehicle location in inventory', 'transportation'),
  ('transport.assign', 'Transport Assignment', 'Assign transportation for vehicles', 'transportation'),
  ('transport.notes', 'Transport Notes', 'View and manage transport notes', 'transportation'),
  ('transport.cost.entry', 'Transport Cost Entry', 'Enter transportation costs', 'transportation'),
  ('transport.history.view', 'View Transport History', 'View transportation history', 'transportation'),

-- Reports permissions
  ('reports.profit.car', 'Profit Per Car Report', 'View profit per car report', 'reports'),
  ('reports.profit.weekly', 'Weekly Profit/Loss Report', 'View weekly profit/loss report', 'reports'),
  ('reports.profit.monthly', 'Monthly Profit/Loss Report', 'View monthly profit/loss report', 'reports'),
  ('reports.arb.activity', 'ARB Activity Report (count, outcome)', 'View ARB activity report with count and outcomes', 'reports'),
  ('reports.arb.transport.cost', 'ARB Transportation Cost Report', 'View ARB transportation cost report', 'reports'),
  ('reports.price.adjustment', 'Price Adjustment Summary', 'View price adjustment summary report', 'reports'),
  ('reports.inventory.summary', 'Inventory Summary Report', 'View inventory summary report', 'reports'),
  ('reports.sold.weekly', 'Sold Cars Weekly Count', 'View sold cars weekly count report', 'reports'),
  ('reports.missing.titles', 'Missing Titles Report', 'View missing titles report', 'reports'),
  ('reports.transport.avg_cost', 'Average Transportation Cost', 'View average transportation cost report', 'reports'),
  ('reports.arb.adjustment.percent', 'Average ARB Adjustment Percentage', 'View average ARB adjustment percentage report', 'reports'),

-- System / User Management permissions
  ('system.users.view', 'User Accounts (view)', 'View user accounts', 'system'),
  ('system.roles.create', 'Create Roles', 'Create new roles', 'system'),
  ('system.roles.edit', 'Edit Roles', 'Edit existing roles', 'system'),
  ('system.roles.assign', 'Assign Roles', 'Assign roles to users', 'system'),
  ('system.activity.logs', 'Activity Logs', 'View system activity logs', 'system'),
  ('system.permissions.edit', 'Permission Editing (hide/show UI)', 'Edit permissions and hide/show UI elements', 'system'),

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
    (pr.role = 'office_staff' AND (
      p.key NOT LIKE 'sold.profit.%'
      AND p.key NOT LIKE 'accounting.profit.%'
      AND p.key NOT LIKE 'accounting.pnl.%'
      AND p.key NOT LIKE 'accounting.expenses.%'
      AND p.key NOT LIKE 'reports.profit.%'
      AND p.key != 'sold.profit.view'
      AND p.key != 'accounting.profit.car'
      AND p.key != 'accounting.profit.weekly'
      AND p.key != 'accounting.profit.monthly'
      AND p.key != 'accounting.pnl.summary'
      AND p.key != 'accounting.expenses.view'
      AND p.key != 'reports.profit.car'
      AND p.key != 'reports.profit.weekly'
      AND p.key != 'reports.profit.monthly'
    )) OR
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
      p.key = 'inventory.view' OR
      p.key = 'inventory.location.update'
    )) OR
    (pr.role = 'office_staff' AND (
      p.key NOT LIKE '%profit%'
      AND p.key NOT LIKE '%financial%'
      AND p.key != 'sold.profit.view'
      AND p.key != 'sold.expenses.view'
      AND p.key != 'accounting.view'
      AND p.key NOT LIKE 'accounting.%'
      AND p.key NOT LIKE 'reports.profit.%'
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
    'inventory.photos.manage', 'inventory.location.update',
    'inventory.notes.manage', 'inventory.purchase.manage', 'inventory.title.manage',
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

-- Transporter gets minimal permissions (only inventory view and location update)
DO $$
DECLARE
  transporter_role_id UUID;
  transporter_permissions TEXT[] := ARRAY[
    'inventory.view',
    'inventory.location.update'
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

-- Office Staff gets all permissions EXCEPT profit/financial related
DO $$
DECLARE
  office_staff_role_id UUID;
  perm_record RECORD;
  excluded_permissions TEXT[] := ARRAY[
    -- Profit visibility
    'sold.profit.view',
    'accounting.profit.car',
    'accounting.profit.weekly',
    'accounting.profit.monthly',
    'accounting.pnl.summary',
    -- Expenses
    'sold.expenses.view',
    'accounting.expenses.view',
    -- Accounting section (entire section)
    'accounting.view',
    'accounting.price.adjustment.log',
    'accounting.reports.export',
    -- Profit reports
    'reports.profit.car',
    'reports.profit.weekly',
    'reports.profit.monthly',
    -- Transportation costs in sold section
    'sold.transport.cost'
  ];
BEGIN
  SELECT id INTO office_staff_role_id FROM roles WHERE name = 'office_staff';
  
  -- Grant all permissions except profit/financial related ones
  FOR perm_record IN 
    SELECT id FROM permissions 
    WHERE key != ALL(excluded_permissions)
      AND key NOT LIKE 'sold.profit.%'
      AND key NOT LIKE 'accounting.profit.%'
      AND key NOT LIKE 'accounting.pnl.%'
      AND key NOT LIKE 'accounting.expenses.%'
      AND key NOT LIKE 'reports.profit.%'
      AND key NOT LIKE 'sold.expenses.%'
      AND key NOT LIKE 'accounting.%'
  LOOP
    INSERT INTO role_permissions (role_id, permission_id, granted)
    VALUES (office_staff_role_id, perm_record.id, TRUE)
    ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = TRUE;
  END LOOP;
END $$;

-- Link existing profiles to roles based on their role field
UPDATE profiles p
SET role_id = r.id
FROM roles r
WHERE p.role = r.name AND p.role_id IS NULL;

