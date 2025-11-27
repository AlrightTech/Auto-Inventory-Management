-- Fix admin@autoinventory.com user to have Super Admin role
-- Run this in Supabase SQL Editor

-- Step 1: Update the role field to 'admin' and assign Super Admin role_id
UPDATE profiles 
SET 
  role = 'admin',
  role_id = (SELECT id FROM roles WHERE name = 'Super Admin')
WHERE email = 'admin@autoinventory.com';

-- Step 2: Verify the update
SELECT 
  p.id,
  p.email,
  p.role,
  p.role_id,
  r.name as role_name,
  r.is_system_role
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.email = 'admin@autoinventory.com';




