# Vercel CI/CD Deployment Guide

This guide will help you set up continuous deployment to Vercel using GitHub Actions and Vercel's built-in CI/CD.

## Prerequisites

- GitHub repository connected to your project
- Vercel account (sign up at https://vercel.com)
- Node.js 20+ installed locally

## Option 1: Vercel Built-in CI/CD (Recommended - Easiest)

Vercel automatically deploys when you push to your connected Git repository. This is the simplest approach.

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `AlrightTech/Auto-Inventory-Management`
4. Vercel will auto-detect Next.js configuration

### Step 2: Configure Environment Variables

1. In your Vercel project dashboard, go to **Settings** > **Environment Variables**
2. Add the following variables (NOT as Secrets, use Environment Variables):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Enable for all environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Step 3: Deploy

1. Click **"Deploy"** in Vercel dashboard
2. Vercel will automatically:
   - Install dependencies
   - Run build
   - Deploy to production
3. Every push to `master` branch will trigger automatic deployment

### Step 4: Configure Branch Deployments

1. Go to **Settings** > **Git**
2. Configure:
   - **Production Branch**: `master` or `main`
   - **Preview Deployments**: Enabled for all branches
   - **Automatic Deployments**: Enabled

## Option 2: GitHub Actions CI/CD (Advanced)

For more control over the deployment process, use the GitHub Actions workflow.

### Step 1: Get Vercel Tokens

1. Go to [Vercel Account Settings](https://vercel.com/account/tokens)
2. Create a new token with full access
3. Copy the token

### Step 2: Get Vercel Project IDs

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel link` in your project directory
3. This will create a `.vercel` folder with `project.json` containing:
   - `orgId`: Your organization ID
   - `projectId`: Your project ID

### Step 3: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add the following secrets:

   ```
   VERCEL_TOKEN=your-vercel-token-here
   VERCEL_ORG_ID=your-org-id-here
   VERCEL_PROJECT_ID=your-project-id-here
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### Step 4: Push to Trigger Deployment

```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin master
```

The GitHub Actions workflow will:
1. Run build and tests
2. Deploy to Vercel on successful build
3. Create preview deployments for pull requests

## Deployment Workflow

### Automatic Deployments

- **Production**: Every push to `master` branch
- **Preview**: Every push to other branches and pull requests
- **Development**: Manual deployments from Vercel dashboard

### Manual Deployments

1. Go to Vercel dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Click **"Redeploy"** for any deployment

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard > Settings > API |

### Optional Variables

Add any other environment variables your application needs in Vercel dashboard.

## Monitoring Deployments

### View Deployment Status

1. Vercel Dashboard > Your Project > Deployments
2. Each deployment shows:
   - Build logs
   - Deployment status
   - Build time
   - URL

### View Build Logs

1. Click on any deployment
2. View detailed build logs
3. Check for errors or warnings

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify environment variables are set correctly
3. Ensure `package.json` has correct build script
4. Check Node.js version compatibility

### Environment Variable Issues

- ❌ Don't use `@` prefix in Vercel dashboard
- ✅ Use exact variable names as in your code
- ✅ Enable for all environments (Production, Preview, Development)

### Common Errors

**Error: Missing environment variables**
- Solution: Add all required variables in Vercel dashboard

**Error: Build timeout**
- Solution: Check `vercel.json` for function timeout settings

**Error: Module not found**
- Solution: Ensure all dependencies are in `package.json`

## CI/CD Pipeline Features

### Pre-deployment Checks

- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Build verification
- ✅ Test execution (if tests are added)

### Deployment Features

- ✅ Automatic deployments on push
- ✅ Preview deployments for PRs
- ✅ Rollback capability
- ✅ Deployment notifications

## Next Steps

1. **Set up monitoring**: Configure error tracking (Sentry, etc.)
2. **Add tests**: Create unit and integration tests
3. **Performance monitoring**: Set up Vercel Analytics
4. **Custom domains**: Add your domain in Vercel settings

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GitHub Actions](https://docs.github.com/en/actions)

## Quick Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs
```

