# Railway Environment Variables Template

## Required Environment Variables

Copy these to Railway Dashboard → Variables:

```env
# Node Environment
NODE_ENV=production

# Port (Railway sets this automatically, but you can set it explicitly)
PORT=3000

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role (OPTIONAL - for admin operations only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

## Important Notes

- ✅ `NEXT_PUBLIC_*` variables are exposed to the browser
- ❌ `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to browser
- ✅ Railway automatically sets `PORT` - you can override if needed
- ✅ After adding variables, **redeploy** your service

## Setting Variables in Railway

1. Go to Railway Dashboard
2. Select your service
3. Click **Variables** tab
4. Click **"New Variable"**
5. Enter name and value
6. Click **"Add"**
7. **Redeploy** to apply changes

## Verification

After deployment, check logs to verify:
- ✅ No "undefined" environment variable errors
- ✅ Supabase connection successful
- ✅ Application starts without errors

