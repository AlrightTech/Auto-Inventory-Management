# 🔍 Debugging "Access Denied" Issue

## Root Cause Analysis

Since environment variables are set correctly, the issue is likely one of these:

## 🔴 Most Likely Issues

### 1. User Doesn't Have a Profile/Role

**Symptom**: User is authenticated but gets "Access Denied"

**Check**:
```sql
-- In Supabase SQL Editor, check if user has profile:
SELECT p.id, p.email, p.role, p.role_id, r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.email = 'your-email@example.com';
```

**Fix**: Create profile and assign role:
```sql
-- If profile doesn't exist, create it:
INSERT INTO profiles (id, email, role, role_id, username, created_at)
VALUES (
  'user-uuid-here',
  'your-email@example.com',
  'admin',  -- or 'seller', 'transporter', 'office_staff'
  (SELECT id FROM roles WHERE name = 'admin'),
  'username',
  NOW()
);

-- Or update existing profile:
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'your-email@example.com';
```

### 2. RBAC Migration Not Run

**Symptom**: Permission checks fail, `user_has_permission` function doesn't exist

**Check**:
```sql
-- Check if RBAC tables exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('roles', 'permissions', 'role_permissions');

-- Check if functions exist:
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_user_permissions', 'user_has_permission');
```

**Fix**: Run the migration:
1. Go to Supabase → SQL Editor
2. Run: `supabase/migrations/20250103_create_rbac_system.sql`
3. Verify tables and functions are created

### 3. User Has No Permissions Assigned

**Symptom**: User has profile/role but still gets "Access Denied"

**Check**:
```sql
-- Check user's permissions:
SELECT * FROM get_user_permissions('user-uuid-here');

-- Check user's role:
SELECT p.email, r.name as role_name, r.id as role_id
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.id = 'user-uuid-here';
```

**Fix**: Ensure role has permissions:
```sql
-- Check if admin role has permissions:
SELECT COUNT(*) 
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'admin' AND rp.granted = true;

-- Should return a large number (80+ for admin)
```

### 4. Database Connection Issue

**Symptom**: Permission check fails silently

**Check in Vercel Logs**:
1. Go to Vercel Dashboard → Deployments → Latest → Logs
2. Look for:
   - "Error checking permission"
   - "Exception checking permission"
   - Database connection errors

**Fix**: 
- Verify Supabase URL and key are correct
- Check Supabase project is active
- Verify RLS policies allow reads

## 🧪 Diagnostic Steps

### Step 1: Check User Authentication

1. Open browser DevTools (F12)
2. Go to Application → Cookies
3. Look for Supabase auth cookies
4. If missing → User not authenticated

### Step 2: Check Database Connection

1. Open browser Console (F12)
2. Look for errors:
   - "Failed to fetch"
   - "Network error"
   - Supabase connection errors

### Step 3: Check User Profile

Run in Supabase SQL Editor:
```sql
-- Replace with your user ID or email
SELECT 
  p.id,
  p.email,
  p.role,
  p.role_id,
  r.name as role_name,
  r.display_name as role_display_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.email = 'your-email@example.com';
```

### Step 4: Check Permissions

Run in Supabase SQL Editor:
```sql
-- Replace with your user ID
SELECT * FROM get_user_permissions('user-uuid-here');
```

Should return a list of permissions. If empty → User has no permissions.

### Step 5: Test Permission Function

Run in Supabase SQL Editor:
```sql
-- Replace with your user ID
SELECT user_has_permission('user-uuid-here', 'dashboard.view');
```

Should return `true` or `false`. If error → Function doesn't exist or user has no profile.

## 🔧 Quick Fixes

### Fix 1: Create Admin User

```sql
-- 1. Create user in Supabase Auth (or use Auth UI)
-- 2. Get user ID from Auth
-- 3. Run this:

INSERT INTO profiles (id, email, role, role_id, username, created_at)
VALUES (
  'user-id-from-auth',
  'admin@example.com',
  'admin',
  (SELECT id FROM roles WHERE name = 'admin'),
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET role_id = (SELECT id FROM roles WHERE name = 'admin'),
    role = 'admin';
```

### Fix 2: Run RBAC Migration

1. Go to Supabase → SQL Editor
2. Copy entire content of `supabase/migrations/20250103_create_rbac_system.sql`
3. Paste and run
4. Verify no errors

### Fix 3: Grant Permissions to Role

```sql
-- Grant all permissions to admin role (if missing):
DO $$
DECLARE
  admin_role_id UUID;
BEGIN
  SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
  
  INSERT INTO role_permissions (role_id, permission_id, granted)
  SELECT admin_role_id, id, TRUE
  FROM permissions
  ON CONFLICT (role_id, permission_id) DO UPDATE SET granted = TRUE;
END $$;
```

## 📊 Expected Behavior

### When Everything Works:

1. **Root URL (`/`)** → Redirects to `/auth/login` ✅
2. **Login** → Redirects to dashboard based on role ✅
3. **Protected Route** → Shows content if user has permission ✅
4. **No Permission** → Shows "Access Denied" ✅

### Current Issue:

- User sees "Access Denied" immediately
- Likely cause: User doesn't have profile/role or permissions

## 🆘 Still Not Working?

1. **Check Vercel Function Logs**:
   - Deployments → Latest → Functions
   - Look for middleware errors

2. **Check Supabase Logs**:
   - Supabase Dashboard → Logs
   - Look for permission check errors

3. **Enable Debug Logging**:
   - Check browser console
   - Check Vercel logs
   - Look for permission check logs

4. **Test Locally**:
   ```bash
   npm run dev
   # Test with same environment variables
   ```

## ✅ Success Indicators

After fixes, you should see:
- ✅ Login page loads
- ✅ Can login successfully
- ✅ Redirects to dashboard
- ✅ No "Access Denied" for authorized routes
- ✅ Permission checks work in logs

