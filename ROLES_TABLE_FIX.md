# Fix for Roles Table 500 Internal Server Error

## Problem
On user login, the frontend console shows a 500 Internal Server Error when fetching roles:
```
https://kgpslcybqgdsvgxydnel.supabase.co/rest/v1/roles?select=name&id=eq.15fd63e6-a5e9-410e-bf13-30d907bf678d
```

## Root Cause
The RLS (Row Level Security) policies on the `roles` table were incorrectly configured:
1. The "Only admins can manage roles" policy used `FOR ALL`, which conflicted with the SELECT policy
2. Missing GRANT permissions for `authenticated` and `anon` roles
3. Potential circular dependency in RLS policy evaluation

## Solution
Created migration `20250106_fix_roles_rls_policies.sql` that:
1. **Separates policies by operation type**:
   - `FOR SELECT` - Allows anyone to view roles (needed for login flow)
   - `FOR INSERT` - Only admins can create roles
   - `FOR UPDATE` - Only admins can update roles
   - `FOR DELETE` - Only admins can delete roles (and only non-system roles)

2. **Adds proper GRANT statements**:
   - `GRANT SELECT ON roles TO authenticated;`
   - `GRANT SELECT ON roles TO anon;`

3. **Verifies table structure**:
   - Checks that the roles table exists
   - Verifies required columns (id UUID, name TEXT)
   - Ensures RLS is enabled

## How to Apply the Fix

### Step 1: Run the Migration
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/20250106_fix_roles_rls_policies.sql`
4. Copy and paste the entire SQL into the SQL Editor
5. Click **Run** to execute the migration

### Step 2: Verify the Fix
1. In Supabase SQL Editor, run the diagnostic script: `scripts/test_roles_table.sql`
2. Check that all tests pass:
   - ✅ Roles table exists
   - ✅ RLS is enabled
   - ✅ SELECT policy exists and allows access
   - ✅ GRANT permissions are set correctly

### Step 3: Test the Endpoint
You can test the REST API endpoint directly:

**Using curl:**
```bash
curl -X GET \
  'https://kgpslcybqgdsvgxydnel.supabase.co/rest/v1/roles?select=name&id=eq.15fd63e6-a5e9-410e-bf13-30d907bf678d' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Using Postman:**
1. Method: GET
2. URL: `https://kgpslcybqgdsvgxydnel.supabase.co/rest/v1/roles?select=name&id=eq.15fd63e6-a5e9-410e-bf13-30d907bf678d`
3. Headers:
   - `apikey: YOUR_ANON_KEY`
   - `Authorization: Bearer YOUR_ANON_KEY`

**Expected Response:**
```json
[
  {
    "name": "Super Admin"
  }
]
```

### Step 4: Test Login Flow
1. Clear browser cache and cookies
2. Log in to the application
3. Check browser console - should NOT see 500 error
4. Verify that role data loads correctly

## Verification Checklist

- [ ] Migration `20250106_fix_roles_rls_policies.sql` has been run
- [ ] Diagnostic script `scripts/test_roles_table.sql` shows all checks passing
- [ ] REST API endpoint returns 200 OK (not 500)
- [ ] Login flow works without console errors
- [ ] Role data loads correctly on login

## Additional Notes

### If the Error Persists

1. **Check Supabase Logs**:
   - Go to Supabase Dashboard → Logs → API Logs
   - Look for the exact error message during the request
   - Common issues:
     - RLS violation (403) - Policy not applied correctly
     - Missing column (400) - Table structure issue
     - Type mismatch (400) - UUID format issue
     - Internal server error (500) - Usually RLS policy error

2. **Verify UUID Format**:
   - The UUID `15fd63e6-a5e9-410e-bf13-30d907bf678d` should exist in the roles table
   - Check: `SELECT id, name FROM roles WHERE id = '15fd63e6-a5e9-410e-bf13-30d907bf678d';`

3. **Check Profile Role Assignment**:
   - Verify the user's profile has the correct `role_id`:
   - `SELECT id, email, role_id FROM profiles WHERE id = auth.uid();`

### Related Files
- Migration: `supabase/migrations/20250106_fix_roles_rls_policies.sql`
- Diagnostic Script: `scripts/test_roles_table.sql`
- Original RBAC Migration: `supabase/migrations/20241221_create_rbac_system.sql`
- Login Code: `src/app/auth/login/page.tsx` (lines 176-198)

