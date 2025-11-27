-- IMMEDIATE FIX: Assign Super Admin to your account
-- Replace 'admin@autoinventory.com' with your actual email address

-- Step 1: Assign Super Admin role to your account
UPDATE profiles 
SET 
  role = 'admin',
  role_id = (SELECT id FROM roles WHERE name = 'Super Admin')
WHERE email = 'admin@autoinventory.com';

-- Step 2: Verify the fix worked
SELECT 
  p.email,
  p.role,
  r.name as role_name,
  r.is_system_role,
  r.description
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.email = 'admin@autoinventory.com';

-- Expected result:
-- email: admin@autoinventory.com
-- role: admin
-- role_name: Super Admin
-- is_system_role: true
-- description: Ultimate system administrator with full access...




