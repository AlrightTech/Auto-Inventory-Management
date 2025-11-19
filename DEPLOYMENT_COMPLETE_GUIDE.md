# Complete Deployment Guide - Vercel + Supabase

## 🎯 Overview

This application uses:
- **Frontend**: Next.js 15 (deploy to Vercel)
- **Backend**: Supabase (PostgreSQL database + API - already hosted)

**Note**: Since the backend is Supabase (cloud-hosted), you don't need Railway. However, if you want to deploy a separate backend service on Railway, that's possible too.

## 📋 Pre-Deployment Checklist

### ✅ 1. Database Setup (Supabase)

1. **Create Supabase Project**:
   - Go to [supabase.com](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose organization, name, database password, and region
   - Wait for project to be created (~2 minutes)

2. **Run Database Migrations**:
   - Go to SQL Editor in Supabase Dashboard
   - Run `supabase/schema.sql` first (if exists)
   - Then run `supabase/migrations/20250103_create_rbac_system.sql`
   - Verify all tables are created

3. **Get Supabase Credentials**:
   - Go to Settings > API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY` (optional, for admin operations)

4. **Enable Realtime** (if needed):
   - Go to Database > Replication
   - Enable replication for `messages`, `notifications`, `user_status` tables

5. **Create Admin User**:
   ```sql
   -- In Supabase SQL Editor
   -- First create user in Auth, then update profile:
   UPDATE profiles 
   SET role_id = (SELECT id FROM roles WHERE name = 'admin')
   WHERE email = 'admin@example.com';
   ```

### ✅ 2. Code Preparation

1. **Ensure code is on GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Test build locally**:
   ```bash
   npm run build
   ```

## 🚀 Vercel Deployment

### Method 1: Vercel Dashboard (Recommended)

1. **Sign up/Login to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up or login with GitHub

2. **Import Project**:
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Select the repository: "Auto Inventory Management"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Set Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here (optional)
   ```
   
   **Important**: 
   - Add these for **Production**, **Preview**, and **Development** environments
   - Click "Save" after adding each variable

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No (first time) or Yes (if exists)
# - Project name? auto-inventory-management
# - Directory? ./
```

### Method 3: GitHub Integration (Auto-Deploy)

1. **Connect Repository** (if not already):
   - In Vercel Dashboard → Settings → Git
   - Connect your GitHub repository

2. **Auto-Deploy Settings**:
   - Production Branch: `main` or `master`
   - Automatic deployments: Enabled
   - Preview deployments: Enabled

3. **Every push to main** will automatically deploy to production

## 🔧 Post-Deployment Configuration

### 1. Update Supabase Auth Settings

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel URL to:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: 
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/**`

### 2. Verify Environment Variables

1. In Vercel Dashboard → Settings → Environment Variables
2. Verify all variables are set correctly
3. Redeploy if you added new variables

### 3. Test Deployment

1. Visit your Vercel URL
2. Test login/registration
3. Verify all features work:
   - Dashboard loads
   - Inventory management
   - Role-based access
   - Real-time features

## 🚂 Railway Deployment (Optional - If Needed)

**Note**: Railway is typically used for separate backend services. Since this app uses Supabase, Railway is not required. However, if you want to deploy a separate API service:

### Railway Setup (For Separate Backend Service)

1. **Create Railway Account**:
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo" (if you have a separate backend repo)
   - Or "Empty Project" to start fresh

3. **Configure Service**:
   - Add environment variables
   - Set build command
   - Set start command

4. **Get Railway URL**:
   - Railway provides a public URL
   - Update your frontend to use this URL for API calls

**However**, for this Next.js + Supabase setup, Railway is **not needed** as Supabase handles all backend functionality.

## 📝 Environment Variables Reference

### Required for Vercel:

```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### How to Get Supabase Keys:

1. Go to Supabase Dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## 🔍 Troubleshooting

### Build Fails on Vercel

1. **Check Build Logs**:
   - Go to Vercel Dashboard → Deployments → Click on failed deployment
   - Check "Build Logs" tab

2. **Common Issues**:
   - Missing environment variables → Add them in Vercel settings
   - TypeScript errors → Fix in code
   - Missing dependencies → Check `package.json`

### App Doesn't Work After Deployment

1. **Check Environment Variables**:
   - Verify all variables are set in Vercel
   - Check variable names (case-sensitive)
   - Redeploy after adding variables

2. **Check Supabase Settings**:
   - Verify Site URL is set correctly
   - Check Redirect URLs include your Vercel domain
   - Verify RLS policies are active

3. **Check Browser Console**:
   - Open browser DevTools
   - Check for errors in Console
   - Check Network tab for failed requests

### Database Connection Issues

1. **Verify Supabase URL**:
   - Check `NEXT_PUBLIC_SUPABASE_URL` is correct
   - Should be: `https://xxxxx.supabase.co`

2. **Check API Key**:
   - Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
   - Should start with `eyJ...`

3. **Check RLS Policies**:
   - Go to Supabase Dashboard → Authentication → Policies
   - Verify policies are active

## 📊 Monitoring

### Vercel Analytics

1. Go to Vercel Dashboard → Analytics
2. Enable Analytics (if not already)
3. Monitor:
   - Page views
   - Performance metrics
   - Error rates

### Supabase Monitoring

1. Go to Supabase Dashboard → Logs
2. Monitor:
   - API requests
   - Database queries
   - Authentication events
   - Error logs

## 🔐 Security Checklist

- [ ] Environment variables are set in Vercel (not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is kept secret (never commit)
- [ ] Supabase RLS policies are active
- [ ] Auth redirect URLs are configured correctly
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] CORS is configured in Supabase (if needed)

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ App loads at Vercel URL
- ✅ Login/Registration works
- ✅ Database queries succeed
- ✅ Real-time features work
- ✅ Role-based access works correctly
- ✅ All pages load without 404 errors

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs
3. Verify environment variables
4. Test locally with same env vars
5. Check browser console for errors

## 🔄 Continuous Deployment

Once set up, every push to your main branch will automatically:
1. Trigger a new build on Vercel
2. Run tests (if configured)
3. Deploy to production
4. Send deployment notifications

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

