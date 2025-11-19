# 🚂 Railway Quick Start Guide

## ⚡ Deploy in 5 Minutes

### Step 1: Push to GitHub (if not already)
```bash
git add .
git commit -m "Ready for Railway deployment"
git push origin main
```

### Step 2: Deploy on Railway

1. **Go to Railway**: [railway.app/new](https://railway.app/new)
2. **Sign up** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your repository: "Auto Inventory Management"
5. **Wait** for Railway to auto-detect Next.js (2-3 minutes)

### Step 3: Add Environment Variables

In Railway Dashboard → **Variables** tab, add:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Step 4: Get Your URL

1. Go to **Settings** → **Networking**
2. Enable **"Public Networking"**
3. Copy your Railway URL: `https://your-app.up.railway.app`

### Step 5: Configure Supabase

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. Set **Site URL**: Your Railway URL
3. Add **Redirect URL**: `https://your-app.up.railway.app/auth/callback`

## ✅ Done!

Your app is live at your Railway URL!

## 📋 Configuration Files

All Railway config files are ready:
- ✅ `railway.json` - Main configuration
- ✅ `railway.toml` - Alternative config
- ✅ `.nvmrc` - Node.js version (v20)
- ✅ `Procfile` - Process file

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs, verify dependencies |
| App doesn't start | Check logs, verify PORT variable |
| Env vars not working | Redeploy after adding variables |
| Database errors | Verify Supabase credentials |

## 📚 Full Guide

See `DEPLOY_RAILWAY_COMPLETE.md` for detailed instructions.

