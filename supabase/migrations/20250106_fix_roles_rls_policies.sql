-- Fix RLS policies for roles table
-- This migration ensures proper access to the roles table for all users
-- Fixes the 500 Internal Server Error when fetching roles on login

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can view roles" ON roles;
DROP POLICY IF EXISTS "Only admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON roles;
DROP POLICY IF EXISTS "Only admins can delete roles" ON roles;

-- RLS Policy: Anyone can view roles (for SELECT operations)
-- This allows all authenticated and unauthenticated users to read roles
-- This is necessary for the login flow to work properly
CREATE POLICY "Anyone can view roles" ON roles
  FOR SELECT
  USING (true);

-- RLS Policy: Only admins can insert roles
CREATE POLICY "Only admins can insert roles" ON roles
  FOR INSERT
  WITH CHECK (
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

-- RLS Policy: Only admins can update roles
CREATE POLICY "Only admins can update roles" ON roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (
        role = 'admin' OR 
        role_id IN (
          SELECT id FROM roles WHERE name = 'Super Admin'
        )
      )
    )
  )
  WITH CHECK (
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

-- RLS Policy: Only admins can delete roles (with system role protection)
CREATE POLICY "Only admins can delete roles" ON roles
  FOR DELETE
  USING (
    -- User must be an admin AND the role must not be a system role
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND (
        role = 'admin' OR 
        role_id IN (
          SELECT id FROM roles WHERE name = 'Super Admin'
        )
      )
    )
    AND is_system_role = false
  );

-- Verify the roles table exists and has the correct structure
DO $$
BEGIN
  -- Check if roles table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'roles'
  ) THEN
    RAISE EXCEPTION 'Roles table does not exist. Please run the RBAC system migration first.';
  END IF;

  -- Check if required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'roles' 
    AND column_name = 'id'
    AND data_type = 'uuid'
  ) THEN
    RAISE EXCEPTION 'Roles table is missing id column or it has wrong type';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'roles' 
    AND column_name = 'name'
    AND data_type = 'text'
  ) THEN
    RAISE EXCEPTION 'Roles table is missing name column or it has wrong type';
  END IF;

  -- Ensure RLS is enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'roles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Grant necessary permissions to authenticated and anon roles
-- This ensures PostgREST can access the table properly
-- Note: These GRANT statements are idempotent (safe to run multiple times)
-- In Supabase, 'authenticated' and 'anon' are special roles that always exist
GRANT SELECT ON roles TO authenticated;
GRANT SELECT ON roles TO anon;
