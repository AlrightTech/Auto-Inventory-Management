-- Fix Invalid Role IDs
-- This script fixes users who have role_id pointing to non-existent roles
-- Run this in Supabase SQL Editor

-- Step 1: Find users with invalid role_id
SELECT 
  p.id,
  p.email,
  p.role,
  p.role_id,
  r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.role_id IS NOT NULL AND r.id IS NULL;

-- Step 2: Assign Super Admin role to users with invalid role_id who are admins
UPDATE profiles
SET role_id = (
  SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1
)
WHERE role_id IS NOT NULL 
  AND role_id NOT IN (SELECT id FROM roles)
  AND role = 'admin';

-- Step 3: Clear invalid role_id for non-admin users (they'll use legacy role field)
UPDATE profiles
SET role_id = NULL
WHERE role_id IS NOT NULL 
  AND role_id NOT IN (SELECT id FROM roles)
  AND role != 'admin';

-- Step 4: Verify the fix
SELECT 
  p.id,
  p.email,
  p.role,
  p.role_id,
  r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.role_id IS NOT NULL;







