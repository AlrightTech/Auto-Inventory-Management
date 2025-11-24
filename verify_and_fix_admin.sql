-- Verify and Fix Admin User Role Assignment
-- Run this in Supabase SQL Editor to check and fix admin user access

-- Step 1: Check current admin users and their role assignments
SELECT 
  p.id,
  p.email,
  p.role as legacy_role,
  p.role_id,
  r.name as role_name,
  r.is_system_role
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.role = 'admin' OR r.name = 'Super Admin'
ORDER BY p.email;

-- Step 2: Get the Super Admin role ID
SELECT id, name, is_system_role 
FROM roles 
WHERE name = 'Super Admin';

-- Step 3: Assign Super Admin role to all users with legacy 'admin' role
-- Replace 'YOUR_ADMIN_EMAIL@example.com' with your actual admin email
UPDATE profiles
SET 
  role = 'admin',
  role_id = (SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1)
WHERE email = 'admin@autoinventory.com'  -- Replace with your admin email
  AND (
    role = 'admin' OR 
    role_id IS NULL OR
    role_id NOT IN (SELECT id FROM roles WHERE name = 'Super Admin')
  );

-- Step 4: Verify the fix
SELECT 
  p.id,
  p.email,
  p.role as legacy_role,
  p.role_id,
  r.name as role_name,
  r.is_system_role,
  CASE 
    WHEN p.role = 'admin' AND r.name = 'Super Admin' THEN '✅ Correct'
    WHEN p.role = 'admin' AND r.name IS NULL THEN '❌ Missing role_id'
    WHEN p.role != 'admin' AND r.name = 'Super Admin' THEN '⚠️ Role mismatch'
    ELSE '❌ Not admin'
  END as status
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.email = 'admin@autoinventory.com';  -- Replace with your admin email

-- Step 5: If Super Admin role doesn't exist, create it
-- (This should already exist from migration, but just in case)
INSERT INTO roles (name, display_name, description, is_system_role, permissions)
SELECT 
  'Super Admin',
  'Super Admin',
  'Ultimate system administrator with full access to all features and permissions',
  true,
  jsonb_build_object(
    'inventory', jsonb_build_object(
      'view', true, 'add', true, 'edit', true, 'upload_photos', true,
      'update_location', true, 'condition_notes', true, 'purchase_details', true, 'title_status', true
    ),
    'sold', jsonb_build_object(
      'view', true, 'edit', true, 'profit_visibility', true, 'expenses_visibility', true,
      'transportation_costs', true, 'arb', true, 'adjust_price', true, 'arb_outcome_history', true
    ),
    'arb', jsonb_build_object(
      'access', true, 'create', true, 'update', true, 'enter_outcomes', true,
      'enter_price_adjustment', true, 'transportation_details', true, 'upload_documents', true
    ),
    'title', jsonb_build_object(
      'status', true, 'upload_documents', true, 'missing_titles_dashboard', true, 'days_missing_tracker', true
    ),
    'transportation', jsonb_build_object(
      'location_tracking', true, 'transport_assignment', true, 'transport_notes', true,
      'transport_cost_entry', true, 'view_history', true
    ),
    'accounting', jsonb_build_object(
      'profit_per_car', true, 'weekly_profit_summary', true, 'monthly_profit_summary', true,
      'total_pl_summary', true, 'accounting_page', true, 'expenses_section', true,
      'price_adjustment_log', true, 'export_reports', true
    ),
    'reports', jsonb_build_object(
      'profit_per_car', true, 'weekly_profit_loss', true, 'monthly_profit_loss', true,
      'arb_activity', true, 'arb_transportation_cost', true, 'price_adjustment_summary', true,
      'inventory_summary', true, 'sold_cars_weekly_count', true, 'missing_titles', true,
      'average_transportation_cost', true, 'average_arb_adjustment_percentage', true
    ),
    'user_management', jsonb_build_object(
      'view_users', true, 'create_roles', true, 'edit_roles', true, 'assign_roles', true,
      'activity_logs', true, 'permission_editing', true
    )
  )
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Super Admin');

