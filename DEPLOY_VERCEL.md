# Deploy to Vercel - Step by Step

## 🚀 Quick Deploy (5 Minutes)

### Step 1: Prepare Your Code
```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel**: [vercel.com/new](https://vercel.com/new)

2. **Import Repository**:
   - Click "Import Git Repository"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project**:
   - **Project Name**: auto-inventory-management (or your choice)
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables**:
   Click "Environment Variables" and add:
   
   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: https://your-project.supabase.co
   Environment: Production, Preview, Development
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: your-anon-key-here
   Environment: Production, Preview, Development
   
   Name: SUPABASE_SERVICE_ROLE_KEY (Optional)
   Value: your-service-role-key-here
   Environment: Production, Preview, Development
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Your app will be live!

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy (first time - will prompt for configuration)
vercel

# Deploy to production
vercel --prod
```

### Step 3: Configure Supabase

1. **Go to Supabase Dashboard** → Your Project → Authentication → URL Configuration

2. **Update URLs**:
   - **Site URL**: `https://your-project.vercel.app`
   - **Redirect URLs**: Add:
     - `https://your-project.vercel.app/auth/callback`
     - `https://your-project.vercel.app/**`

3. **Save Changes**

### Step 4: Verify Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Test login/registration
3. Verify features work
4. Check browser console for errors

## 🔧 Environment Variables

### Required Variables:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |

### Optional Variables:

| Variable | Description |
|----------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | For admin operations (keep secret!) |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL |

## 📝 Database Setup (Before Deployment)

1. **Run Migrations in Supabase**:
   - Go to SQL Editor
   - Run `supabase/migrations/20250103_create_rbac_system.sql`
   - Verify tables are created

2. **Create Admin User**:
   ```sql
   -- After creating user in Auth, update profile:
   UPDATE profiles 
   SET role_id = (SELECT id FROM roles WHERE name = 'admin')
   WHERE email = 'admin@example.com';
   ```

## ✅ Post-Deployment Checklist

- [ ] App loads at Vercel URL
- [ ] Login/Registration works
- [ ] Database connection successful
- [ ] RBAC permissions work
- [ ] All pages accessible
- [ ] No console errors
- [ ] Real-time features work

## 🆘 Troubleshooting

### Build Fails
- Check Vercel build logs
- Verify `package.json` is correct
- Ensure all dependencies are listed

### App Doesn't Load
- Verify environment variables are set
- Check Supabase URL is correct
- Verify Supabase project is active

### Database Errors
- Check Supabase connection
- Verify RLS policies are active
- Check database migrations ran successfully

### Auth Issues
- Verify redirect URLs in Supabase
- Check Site URL is set correctly
- Verify environment variables

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch → Auto-deploy to production
- Every pull request → Auto-deploy preview
- Manual deployments available in dashboard

## 📊 Monitoring

- **Vercel Analytics**: Dashboard → Analytics
- **Supabase Logs**: Dashboard → Logs
- **Error Tracking**: Check Vercel deployment logs

## 🎉 Success!

Your app is now live at: `https://your-project.vercel.app`

