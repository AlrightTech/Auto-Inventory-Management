# 🚀 START HERE - Deployment Guide

## Quick Overview

- **Frontend**: Deploy to **Vercel** (Next.js app)
- **Backend**: Already on **Supabase** (cloud-hosted database + API)
- **Railway**: NOT needed (Supabase handles backend)

## ⚡ Quick Deploy (15 minutes)

### Step 1: Supabase Setup (Backend)

1. Create project at [supabase.com](https://supabase.com/dashboard)
2. Run SQL migration: `supabase/migrations/20250103_create_rbac_system.sql`
3. Get credentials from Settings → API:
   - Project URL
   - anon/public key
   - service_role key (optional)

### Step 2: Vercel Deployment (Frontend)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click "Deploy"
5. Wait 2-3 minutes
6. Get your live URL!

### Step 3: Configure Supabase Auth

1. Go to Supabase → Authentication → URL Configuration
2. Set Site URL: `https://your-app.vercel.app`
3. Add Redirect URL: `https://your-app.vercel.app/auth/callback`

### Step 4: Create Admin User

```sql
-- In Supabase SQL Editor
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'your-admin@email.com';
```

## ✅ That's It!

Your app is now live. Visit your Vercel URL and login.

## 📚 Detailed Guides

- **Full Guide**: See `DEPLOYMENT_COMPLETE_GUIDE.md`
- **Vercel Only**: See `DEPLOY_VERCEL.md`
- **Railway** (if needed): See `DEPLOY_RAILWAY.md`
- **Checklist**: See `QUICK_DEPLOY_CHECKLIST.md`

## 🆘 Need Help?

1. Check deployment logs in Vercel
2. Verify environment variables are set
3. Check Supabase connection
4. Review troubleshooting in `DEPLOYMENT_COMPLETE_GUIDE.md`

