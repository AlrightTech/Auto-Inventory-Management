# 🔑 Vercel Environment Variables Setup

## Critical: Environment Variables Must Be Set

Your application **requires** these environment variables to work correctly.

## ✅ Required Variables

Add these in **Vercel Dashboard** → **Settings** → **Environment Variables**:

### 1. Supabase Project URL
```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development
```

### 2. Supabase Anon Key
```
Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environment: Production, Preview, Development
```

## 📋 Step-by-Step Setup

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Add to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. For each variable:
   - Enter **Name** (exactly as shown above)
   - Enter **Value** (from Supabase)
   - Select **Environments**: Production, Preview, Development
   - Click **"Save"**

### Step 3: Redeploy

**IMPORTANT**: After adding/changing environment variables:

1. Go to **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

## ⚠️ Common Mistakes

### ❌ Wrong Variable Names
```
NEXT_PUBLIC_SUPABASE_url  ← Wrong (lowercase 'url')
next_public_supabase_url  ← Wrong (all lowercase)
NEXT_PUBLIC_SUPABASE-URL  ← Wrong (hyphen instead of underscore)
```

### ✅ Correct Variable Names
```
NEXT_PUBLIC_SUPABASE_URL  ← Correct
NEXT_PUBLIC_SUPABASE_ANON_KEY  ← Correct
```

### ❌ Not Setting for All Environments
- Must set for: **Production**, **Preview**, AND **Development**
- If only set for Production, preview deployments won't work

### ❌ Forgetting to Redeploy
- Variables are only available after redeploy
- Changes don't apply to existing deployments

### ❌ Using Quotes in Values
```
Value: "https://xxx.supabase.co"  ← Wrong (quotes included)
Value: https://xxx.supabase.co    ← Correct (no quotes)
```

## 🔍 Verification

### Check in Vercel:

1. Go to **Settings** → **Environment Variables**
2. Verify both variables are listed
3. Check they're enabled for all environments

### Check in Browser:

1. Open your Vercel URL
2. Open DevTools (F12) → **Console**
3. Should NOT see: "Missing Supabase environment variables"
4. If you see this error → Variables not set correctly

### Check in Build Logs:

1. Go to **Deployments** → Latest → **Build Logs**
2. Should NOT see environment variable errors
3. Build should complete successfully

## 🧪 Test After Setup

1. **Redeploy** your application
2. Visit your Vercel URL
3. Should see login page (not "Access Denied")
4. Try logging in
5. Should redirect to dashboard

## 📝 Quick Reference

| Variable Name | Where to Get | Required For |
|--------------|--------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL | All environments |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public key | All environments |

## 🆘 Still Not Working?

1. **Double-check variable names** (case-sensitive!)
2. **Verify values** are correct (no extra spaces)
3. **Redeploy** after changes
4. **Clear browser cache**
5. **Check Vercel logs** for errors

## ✅ Success

When environment variables are set correctly:
- ✅ Application loads
- ✅ Login page works
- ✅ Database connections succeed
- ✅ No console errors about missing variables

