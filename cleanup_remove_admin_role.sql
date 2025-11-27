-- Cleanup: Remove Admin role and migrate users to Super Admin
-- Run this in Supabase SQL Editor after updating the migration

-- Step 1: Migrate all users with Admin role to Super Admin
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'Super Admin')
WHERE role_id = (SELECT id FROM roles WHERE name = 'Admin')
   OR (role = 'admin' AND role_id IS NULL);

-- Step 2: Delete the Admin role (only if no users are assigned to it)
-- First check if any users still have Admin role
DO $$
DECLARE
  admin_role_id UUID;
  user_count INTEGER;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'Admin';
  
  IF admin_role_id IS NOT NULL THEN
    SELECT COUNT(*) INTO user_count 
    FROM profiles 
    WHERE role_id = admin_role_id;
    
    IF user_count = 0 THEN
      DELETE FROM roles WHERE name = 'Admin';
      RAISE NOTICE 'Admin role deleted successfully';
    ELSE
      RAISE NOTICE 'Cannot delete Admin role: % users still assigned', user_count;
    END IF;
  END IF;
END $$;

-- Step 3: Verify cleanup - should show only 3 system roles
SELECT 
  r.name,
  r.is_system_role,
  COUNT(p.id) as user_count
FROM roles r
LEFT JOIN profiles p ON p.role_id = r.id
WHERE r.is_system_role = true
GROUP BY r.id, r.name, r.is_system_role
ORDER BY r.name;

-- Expected result: Only Super Admin, Office Staff, Transporter




