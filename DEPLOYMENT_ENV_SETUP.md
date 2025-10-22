# Environment Variables Setup for Deployment

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Supabase Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## How to Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

## For Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add the following variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (optional)

## Build Process

The application is configured to handle missing environment variables gracefully during build time, so the build will succeed even without these variables set. However, the application will not function properly without the correct Supabase credentials.
