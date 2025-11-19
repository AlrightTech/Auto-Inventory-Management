# 🔧 Vercel Deployment Troubleshooting Guide

## Issue: "Access Denied" Page After Deployment

If you're seeing the "Access Denied" page when opening your Vercel URL, follow these steps:

## ✅ Step 1: Verify Environment Variables

**Critical**: Environment variables must be set correctly in Vercel.

### Check in Vercel Dashboard:

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Verify these variables exist:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. **Important**: 
   - Variables must be set for **Production**, **Preview**, AND **Development**
   - Variable names are **case-sensitive**
   - No spaces before/after the `=` sign
   - No quotes around values

### How to Fix:

1. **Delete and Re-add Variables**:
   - Delete existing variables
   - Add them again with exact names:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
2. **Redeploy** after adding variables:
   - Go to **Deployments** tab
   - Click **"Redeploy"** on the latest deployment
   - Wait for deployment to complete

## ✅ Step 2: Configure Supabase Auth URLs

Supabase must allow requests from your Vercel domain.

### In Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   https://your-app.vercel.app/**
   ```
4. **Save** changes

## ✅ Step 3: Check Supabase Connection

### Verify in Browser Console:

1. Open your Vercel URL
2. Open Browser DevTools (F12)
3. Go to **Console** tab
4. Look for errors:
   - ❌ "Missing Supabase environment variables" → Environment variables not set
   - ❌ "Failed to fetch" → Supabase URL incorrect
   - ❌ "Invalid API key" → Anon key incorrect

### Verify in Vercel Logs:

1. Go to Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. Check **Build Logs** and **Function Logs**
4. Look for Supabase connection errors

## ✅ Step 4: Test Authentication Flow

### Expected Behavior:

1. **First Visit** (not logged in):
   - Root URL (`/`) → Redirects to `/auth/login` ✅
   - Protected routes (`/admin`) → Redirects to `/auth/login` ✅

2. **After Login**:
   - Should redirect to dashboard based on role ✅
   - Should NOT show "Access Denied" ✅

### If You See "Access Denied":

This means:
- ✅ User is authenticated
- ❌ User doesn't have required permission
- ❌ User profile/role not set up correctly

## ✅ Step 5: Create Admin User

If you need to access admin routes, create an admin user:

### In Supabase SQL Editor:

```sql
-- First, create user in Auth (or use Supabase Auth UI)
-- Then update their profile:
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'your-admin@email.com';

-- Verify the update:
SELECT p.email, r.name as role_name
FROM profiles p
LEFT JOIN roles r ON p.role_id = r.id
WHERE p.email = 'your-admin@email.com';
```

## ✅ Step 6: Check Database Migrations

Ensure RBAC system is set up:

1. Go to Supabase → **SQL Editor**
2. Run: `supabase/migrations/20250103_create_rbac_system.sql`
3. Verify tables exist:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('roles', 'permissions', 'role_permissions');
   ```

## 🔍 Common Issues & Solutions

### Issue 1: "Access Denied" on Root URL

**Cause**: User is logged in but doesn't have permission for `/admin`

**Solution**:
- Go to `/auth/login` first
- Or access a route you have permission for
- Or create an admin user (see Step 5)

### Issue 2: Environment Variables Not Working

**Symptoms**: Console shows "Missing Supabase environment variables"

**Solution**:
1. Verify variables in Vercel Dashboard
2. Check variable names (case-sensitive)
3. **Redeploy** after adding/changing variables
4. Clear browser cache

### Issue 3: Supabase Connection Fails

**Symptoms**: Network errors in console, "Failed to fetch"

**Solution**:
1. Verify Supabase URL is correct
2. Check Supabase project is active
3. Verify CORS settings in Supabase
4. Check Supabase auth URLs are configured

### Issue 4: User Can't Login

**Symptoms**: Login page loads but login fails

**Solution**:
1. Check Supabase auth is enabled
2. Verify email confirmation settings
3. Check Supabase logs for errors
4. Verify redirect URLs are correct

### Issue 5: "Host validation failed" Console Errors

**Note**: These are usually from browser extensions (password managers, etc.)
- They don't affect your app functionality
- Can be safely ignored
- Not related to your application code

## 🧪 Testing Checklist

After fixing issues, test:

- [ ] Root URL redirects to login
- [ ] Login page loads
- [ ] Can register new user
- [ ] Can login with existing user
- [ ] Redirects to correct dashboard after login
- [ ] Protected routes accessible after login
- [ ] No "Access Denied" for authorized routes
- [ ] Environment variables working
- [ ] Supabase connection successful

## 🆘 Still Having Issues?

1. **Check Vercel Logs**:
   - Deployments → Latest → Logs
   - Look for error messages

2. **Check Supabase Logs**:
   - Supabase Dashboard → Logs
   - Check API and Auth logs

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Check Console and Network tabs
   - Look for failed requests

4. **Verify Build**:
   ```bash
   npm run build  # Should complete without errors
   ```

## 📞 Quick Fix Summary

1. ✅ Set environment variables in Vercel
2. ✅ Configure Supabase auth URLs
3. ✅ Redeploy after changes
4. ✅ Create admin user in Supabase
5. ✅ Test login flow

## 🎉 Success Indicators

Your deployment is working when:
- ✅ Login page loads
- ✅ Can login successfully
- ✅ Redirects to dashboard
- ✅ No "Access Denied" errors
- ✅ Database queries work

