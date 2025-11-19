# 🚂 Complete Railway Deployment Guide

## ✅ Railway Configuration Files Created

All necessary configuration files have been created for smooth Railway deployment:

- ✅ `railway.json` - Primary Railway configuration
- ✅ `railway.toml` - Alternative Railway configuration format
- ✅ `.nvmrc` - Node.js version specification (v20)
- ✅ `Procfile` - Process file for Railway (backup)

## 🎯 Why Railway Works for Next.js

Railway **fully supports** Next.js applications including:
- ✅ Next.js 15 with App Router
- ✅ Server-side rendering (SSR)
- ✅ API routes (`/api/*`)
- ✅ Static page generation
- ✅ Middleware
- ✅ Environment variables
- ✅ Custom domains
- ✅ Automatic HTTPS

## 📋 Pre-Deployment Checklist

- [x] Code committed to GitHub
- [x] Build succeeds locally: `npm run build`
- [x] Railway configuration files created
- [x] Node.js version specified (`.nvmrc`)
- [x] Supabase project created
- [x] Database migrations ready

## 🚀 Step-by-Step Railway Deployment

### Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Sign up with **GitHub** (recommended for easy repo connection)
4. Verify your email if prompted

### Step 2: Create New Project

1. Click **"New Project"** in Railway dashboard
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub repositories
4. Search for and select: **"Auto Inventory Management"**
5. Railway will auto-detect it's a Next.js application

### Step 3: Configure Service

Railway should auto-detect Next.js, but verify these settings:

1. **Service Name**: 
   - Click on the service → Settings → General
   - Name: `auto-inventory-management` (or your choice)

2. **Build Settings** (usually auto-detected):
   - Go to Settings → Build & Deploy
   - **Build Command**: `npm run build` ✅
   - **Start Command**: `npm start` ✅
   - **Root Directory**: `./` (default) ✅

3. **Node.js Version**:
   - Railway will read `.nvmrc` file automatically
   - Should use Node.js 20 (compatible with Next.js 15)

### Step 4: Add Environment Variables

**Critical Step**: Add these in Railway Dashboard:

1. Go to your service → **Variables** tab
2. Click **"New Variable"** and add:

```env
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Optional** (for admin operations):
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important Notes**:
- Railway automatically sets `PORT` - you can set it explicitly or let Railway handle it
- `NEXT_PUBLIC_*` variables are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` should be kept secret (not exposed to browser)

### Step 5: Deploy

1. Railway will automatically:
   - Install dependencies (`npm install`)
   - Run build command (`npm run build`)
   - Start the application (`npm start`)

2. **Monitor Deployment**:
   - Go to **Deployments** tab
   - Watch the build logs in real-time
   - Wait for "Deployment successful" message (2-5 minutes)

3. **Check Build Logs**:
   - If build fails, check the logs for errors
   - Common issues: missing environment variables, build errors

### Step 6: Get Your Railway URL

1. Go to **Settings** → **Networking**
2. Enable **"Public Networking"** (if not already enabled)
3. Railway will generate a URL like: `https://your-app.up.railway.app`
4. Copy this URL - this is your live application!

### Step 7: Configure Supabase Auth

1. Go to **Supabase Dashboard** → Your Project → **Authentication** → **URL Configuration**

2. Update these settings:
   - **Site URL**: `https://your-app.up.railway.app`
   - **Redirect URLs**: Add:
     ```
     https://your-app.up.railway.app/auth/callback
     https://your-app.up.railway.app/**
     ```

3. **Save** the changes

### Step 8: Create Admin User

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL (replace email with your admin email):

```sql
-- First, create the user in Auth (or use Supabase Auth UI)
-- Then update their profile:
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'admin')
WHERE email = 'your-admin@email.com';
```

### Step 9: Test Your Deployment

1. Visit your Railway URL: `https://your-app.up.railway.app`
2. Test these features:
   - ✅ Homepage loads
   - ✅ Login/Registration works
   - ✅ Dashboard accessible
   - ✅ Database queries work
   - ✅ RBAC permissions work
   - ✅ API routes functional

## 🔧 Railway-Specific Configuration

### Port Configuration

Railway automatically sets the `PORT` environment variable. Next.js will use it automatically:

```typescript
// Next.js automatically uses process.env.PORT
// No code changes needed!
```

### Build Process

Railway uses **Nixpacks** which:
- Auto-detects Next.js
- Installs dependencies
- Runs build command
- Starts the application

### Environment Variables

Railway environment variables:
- Set in Railway Dashboard → Variables
- Available at build time and runtime
- Can be different per environment (Production, Preview, Development)

### Health Checks

Railway automatically health checks your app:
- Default path: `/` (configured in `railway.json`)
- Timeout: 100 seconds
- Railway will restart if health check fails

## 🆚 Railway vs Vercel Comparison

| Feature | Vercel | Railway |
|---------|--------|---------|
| Next.js Support | ✅ Native | ✅ Full Support |
| API Routes | ✅ Yes | ✅ Yes |
| Server Components | ✅ Yes | ✅ Yes |
| Static Generation | ✅ Yes | ✅ Yes |
| Environment Variables | ✅ Yes | ✅ Yes |
| Custom Domains | ✅ Yes | ✅ Yes |
| Auto Deploy | ✅ Yes | ✅ Yes |
| Pricing | Free tier | Pay-as-you-go |
| Build Time | Fast | Fast |
| Cold Starts | Minimal | Minimal |

## 🔍 Troubleshooting Railway Deployment

### Issue: Build Fails

**Symptoms**: Build logs show errors

**Solutions**:
1. Check build logs in Railway dashboard
2. Verify `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "build": "next build",
       "start": "next start"
     }
   }
   ```
3. Ensure Node.js version is compatible (`.nvmrc` specifies v20)
4. Check for missing dependencies

### Issue: App Doesn't Start

**Symptoms**: Deployment succeeds but app doesn't load

**Solutions**:
1. Check **Logs** tab in Railway dashboard
2. Verify `PORT` environment variable (Railway sets this automatically)
3. Verify start command: `npm start`
4. Check for runtime errors in logs

### Issue: Environment Variables Not Working

**Symptoms**: App loads but features don't work (database errors, etc.)

**Solutions**:
1. Verify variables are set in Railway Dashboard → Variables
2. Check variable names (case-sensitive):
   - ✅ `NEXT_PUBLIC_SUPABASE_URL`
   - ❌ `NEXT_PUBLIC_SUPABASE_url` (wrong case)
3. **Redeploy** after adding new variables (Railway requires redeploy)
4. Check logs for "undefined" environment variable errors

### Issue: Database Connection Fails

**Symptoms**: Supabase connection errors

**Solutions**:
1. Verify Supabase URL and keys are correct
2. Check Supabase project is active
3. Verify RLS policies are enabled
4. Check Supabase allows connections from Railway IPs
5. Verify environment variables are set correctly

### Issue: Authentication Not Working

**Symptoms**: Login/Registration fails

**Solutions**:
1. Verify Supabase auth URLs are configured:
   - Site URL: Your Railway URL
   - Redirect URLs: Include `/auth/callback`
2. Check Supabase project settings
3. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
4. Check browser console for errors

### Issue: Slow Build Times

**Symptoms**: Build takes > 5 minutes

**Solutions**:
1. Check build logs for bottlenecks
2. Consider upgrading Railway plan
3. Optimize dependencies (remove unused packages)
4. Check for large files in repository

## 📊 Railway Dashboard Features

### Metrics Tab
- CPU usage
- Memory usage
- Network traffic
- Request count

### Logs Tab
- Real-time application logs
- Build logs
- Error logs
- Search and filter logs

### Deployments Tab
- View deployment history
- Rollback to previous deployment
- View build logs for each deployment

### Variables Tab
- Manage environment variables
- Set different values per environment
- View variable history

### Networking Tab
- Configure public URL
- Set up custom domain
- View network settings

## 🔄 Continuous Deployment

Railway automatically deploys when you:

1. **Push to GitHub**:
   - Push to connected branch (usually `main`)
   - Railway detects changes
   - Triggers new deployment

2. **Manual Deploy**:
   - Go to Deployments tab
   - Click "Redeploy"
   - Select deployment to redeploy

3. **Environment Variable Changes**:
   - Update variables in Railway Dashboard
   - Railway will prompt to redeploy
   - Click "Redeploy" to apply changes

## 💰 Railway Pricing

### Free Trial
- $5 credit to start
- Enough for testing and small apps

### Pay-as-You-Go
- Only pay for what you use
- Pricing based on:
  - Compute time
  - Memory usage
  - Network traffic

### Estimated Costs
- **Small app**: ~$5-10/month
- **Medium app**: ~$20-50/month
- **Large app**: Custom pricing

### Cost Optimization
- Use Railway's sleep feature for dev environments
- Monitor usage in dashboard
- Set up usage alerts

## 🌐 Custom Domain Setup

### Step 1: Add Custom Domain

1. Go to **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Enter your domain: `yourdomain.com`
4. Click **"Add Domain"**

### Step 2: Configure DNS

Railway will provide DNS records to add:

1. **CNAME Record**:
   - Name: `@` or `www`
   - Value: Railway-provided CNAME

2. **Or A Record** (if CNAME not supported):
   - Name: `@`
   - Value: Railway-provided IP

### Step 3: SSL Certificate

- Railway automatically provisions SSL certificates
- Wait 5-10 minutes for DNS propagation
- SSL will be active automatically

### Step 4: Update Supabase

Update Supabase auth URLs to use your custom domain:
- Site URL: `https://yourdomain.com`
- Redirect URLs: `https://yourdomain.com/auth/callback`

## ✅ Post-Deployment Checklist

- [ ] App loads at Railway URL
- [ ] Login/Registration works
- [ ] Database queries succeed
- [ ] API routes functional
- [ ] RBAC permissions work
- [ ] Real-time features work (if applicable)
- [ ] Custom domain configured (if needed)
- [ ] Environment variables verified
- [ ] Monitoring set up
- [ ] Error tracking configured (optional)

## 🎉 Success!

Your Next.js application is now running on Railway!

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Next.js Guide](https://docs.railway.app/guides/nextjs)
- [Railway Support](https://railway.app/support)
- [Railway Discord](https://discord.gg/railway)

## 🔗 Quick Links

- **Railway Dashboard**: [railway.app](https://railway.app)
- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Supabase Dashboard**: [supabase.com/dashboard](https://supabase.com/dashboard)

---

**Need Help?** Check the troubleshooting section above or Railway's support documentation.

