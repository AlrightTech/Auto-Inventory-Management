# Vercel Deployment Fix

## The Issue
Vercel was looking for secrets named `next_public_supabase_url` but your environment variables are named `NEXT_PUBLIC_SUPABASE_URL`.

## The Fix
1. **Updated `vercel.json`**: Removed the incorrect `env` configuration that was referencing secrets
2. **Environment Variables**: Make sure to add them as **Environment Variables** in Vercel dashboard, NOT as Secrets

## Steps to Fix in Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to `Settings` > `Environment Variables`
3. **Delete any existing variables** that have the `@` prefix
4. **Add new Environment Variables** (not Secrets):
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Make sure they are enabled for **Production**, **Preview**, and **Development**
6. **Redeploy** your project

## Verification
After redeploying, your application should work without the environment variable error.

## Common Mistakes to Avoid
- ❌ Don't use `@` prefix when adding environment variables
- ❌ Don't add them as "Secrets" - use "Environment Variables"
- ❌ Don't forget to enable for all environments (Production, Preview, Development)
- ✅ Do use the exact variable names: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
