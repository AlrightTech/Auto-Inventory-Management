# Auto Inventory Management - Deployment Guide

## Prerequisites

1. **Supabase Project**: Create a new project at [supabase.com](https://supabase.com)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Push your code to GitHub

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the SQL script to create all tables and policies

## Vercel Deployment

### Method 1: Vercel CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Method 2: Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy

## Post-Deployment

1. **Create Admin User**: Go to Supabase Auth and create an admin user
2. **Update Profile**: Add the user to the profiles table with role 'admin'
3. **Test Application**: Visit your deployed URL and test all features

## Local Development

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Build Verification

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues:
1. **Environment Variables**: Ensure all required env vars are set
2. **Database Connection**: Verify Supabase URL and keys are correct
3. **RLS Policies**: Check that Row Level Security policies are active
4. **Build Errors**: Run `npm run build` locally to catch issues early

### Support:
- Check Vercel deployment logs
- Check Supabase logs in dashboard
- Verify all API routes are working
