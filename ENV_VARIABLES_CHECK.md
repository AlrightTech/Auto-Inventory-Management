# Environment Variables Check

## The Error
If you're seeing: `{"message":"No API key found in request","hint":"No `apikey` request header or url param was found."}`

This means the Supabase client is not receiving the API key, which happens when environment variables are missing or not accessible.

## Required Environment Variables

You MUST have these set in your deployment environment (Vercel):

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

## How to Fix

### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key-here`

4. **IMPORTANT**: After adding variables, you MUST:
   - Redeploy your application (go to Deployments and click "Redeploy")
   - Or trigger a new deployment by pushing to your repository

### For Local Development:

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## How to Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** > **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Verify Environment Variables Are Set

After setting the variables, check the browser console. You should see:
- `Supabase URL: Set`
- `Supabase Key: Set`

If you see "Missing" for either, the environment variables are not properly configured.

## Common Issues

1. **Variables not prefixed with `NEXT_PUBLIC_`**: Next.js only exposes variables to the browser if they start with `NEXT_PUBLIC_`
2. **Variables set but not redeployed**: After adding variables in Vercel, you must redeploy
3. **Wrong key used**: Make sure you're using the `anon` key, not the `service_role` key
4. **Variables in wrong environment**: Make sure variables are set for the correct environment (Production, Preview, Development)

