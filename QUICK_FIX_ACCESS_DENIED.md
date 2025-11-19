# ⚡ Quick Fix: Access Denied on Vercel

## 🎯 Most Likely Cause

The "Access Denied" page appears because:
1. **Environment variables not set** in Vercel (90% of cases)
2. **Supabase auth URLs not configured**
3. **User not logged in** or **no permissions**

## ✅ 5-Minute Fix

### Step 1: Set Environment Variables (2 minutes)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add these **exact** variable names:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Get values from **Supabase Dashboard** → **Settings** → **API**
4. Enable for: **Production**, **Preview**, **Development**
5. Click **"Save"**

### Step 2: Configure Supabase (1 minute)

1. Go to **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL**: `https://your-app.vercel.app`
3. Add **Redirect URL**: `https://your-app.vercel.app/auth/callback`
4. Click **"Save"**

### Step 3: Redeploy (2 minutes)

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 4: Test

1. Visit your Vercel URL
2. Should see **login page** (not "Access Denied")
3. Try logging in
4. Should work! ✅

## 🔍 Verify It's Fixed

### Check Environment Variables:
- ✅ Variables set in Vercel Dashboard
- ✅ Names are exact (case-sensitive)
- ✅ Enabled for all environments
- ✅ Redeployed after adding

### Check Supabase:
- ✅ Site URL set to Vercel URL
- ✅ Redirect URLs include `/auth/callback`
- ✅ Project is active

### Check Browser:
- ✅ No "Missing Supabase environment variables" in console
- ✅ Login page loads
- ✅ Can login successfully

## 🆘 Still Not Working?

1. **Check Vercel Logs**: Deployments → Latest → Logs
2. **Check Browser Console**: F12 → Console tab
3. **Verify Variables**: Double-check names and values
4. **Clear Cache**: Hard refresh (Ctrl+Shift+R)

## 📚 Detailed Guides

- **Full Troubleshooting**: `VERCEL_DEPLOYMENT_TROUBLESHOOTING.md`
- **Environment Setup**: `VERCEL_ENV_SETUP.md`

## ✅ Success!

After these steps, your app should:
- ✅ Load the login page
- ✅ Allow login/registration
- ✅ Redirect to dashboard
- ✅ No "Access Denied" errors

