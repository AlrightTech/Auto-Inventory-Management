# CI/CD Pipeline Setup Guide

This project includes comprehensive CI/CD pipelines for automated testing, building, and deployment to Vercel.

## Pipeline Overview

### 1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
Main pipeline that handles:
- ✅ Continuous Integration (CI): Build and test on every push/PR
- ✅ Continuous Deployment (CD): Auto-deploy to production on `master`/`main`
- ✅ Preview deployments for pull requests
- ✅ Manual deployment support

### 2. **Security Checks** (`.github/workflows/security.yml`)
- 🔒 Dependency vulnerability scanning
- 🔒 Automated security audits
- 🔒 Dependency review for PRs

### 3. **Deployment Notifications** (`.github/workflows/notify.yml`)
- 📧 Deployment status notifications
- 📧 Success/failure alerts

## Pipeline Workflow

```
┌─────────────────┐
│   Push/PR       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   CI: Build     │
│   & Test        │
└────────┬────────┘
         │
         ├─── PR ────► Preview Deployment
         │
         └─── Main ──► Production Deployment
```

## Required GitHub Secrets

### For CI/CD Pipeline

Add these secrets in GitHub: **Settings > Secrets and variables > Actions**

#### Required Secrets:

1. **VERCEL_TOKEN**
   - Get from: https://vercel.com/account/tokens
   - Create a new token with full access

2. **VERCEL_ORG_ID**
   - Get by running: `vercel link` locally
   - Check `.vercel/project.json` for `orgId`

3. **VERCEL_PROJECT_ID**
   - Get by running: `vercel link` locally
   - Check `.vercel/project.json` for `projectId`

4. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`

5. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Get from Supabase Dashboard > Settings > API

#### Optional Secrets:

- **VERCEL_PROJECT_NAME** - For deployment URLs in notifications

## Getting Vercel IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project (run in project root)
vercel link

# View the IDs
cat .vercel/project.json
```

The file will contain:
```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id"
}
```

## Pipeline Triggers

### Automatic Triggers

1. **Push to `master`/`main`**
   - Runs CI (build & test)
   - Deploys to production if CI passes

2. **Push to `develop`**
   - Runs CI (build & test)
   - No automatic deployment

3. **Pull Request**
   - Runs CI (build & test)
   - Creates preview deployment
   - Comments PR with preview URL

### Manual Triggers

1. **Workflow Dispatch**
   - Go to Actions tab
   - Select "CI/CD Pipeline"
   - Click "Run workflow"
   - Choose environment (production/preview)

## Pipeline Jobs

### 1. CI - Build and Test

**Runs on:** Every push and PR

**Steps:**
- ✅ Checkout code
- ✅ Setup Node.js 20
- ✅ Install dependencies (`npm ci`)
- ✅ Run linter
- ✅ Type check (TypeScript)
- ✅ Build project
- ✅ Verify build artifacts
- ✅ Upload artifacts (for PRs)

### 2. CD - Deploy to Production

**Runs on:** Push to `master`/`main` (after CI passes)

**Steps:**
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Build project
- ✅ Deploy to Vercel production
- ✅ Create deployment summary

### 3. CD - Deploy Preview

**Runs on:** Pull requests (after CI passes)

**Steps:**
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Install dependencies
- ✅ Build project
- ✅ Deploy preview to Vercel
- ✅ Comment PR with preview URL

### 4. Security Audit

**Runs on:** Every push, PR, and daily at 2 AM UTC

**Steps:**
- ✅ Checkout code
- ✅ Setup Node.js
- ✅ Run `npm audit`
- ✅ Check for vulnerabilities
- ✅ Dependency review (for PRs)

## Environment Variables

### In Vercel Dashboard

Add these in **Vercel Project > Settings > Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Enable for:
- ✅ Production
- ✅ Preview
- ✅ Development

### In GitHub Secrets

Same variables should be in GitHub Secrets for CI builds.

## Monitoring Deployments

### View Pipeline Status

1. Go to **GitHub > Actions** tab
2. See all workflow runs
3. Click on a run to see detailed logs

### View Deployment Status

1. Go to **Vercel Dashboard**
2. Navigate to **Deployments**
3. See deployment history and status

### Deployment URLs

- **Production**: `https://your-project.vercel.app`
- **Preview**: Generated per PR/branch

## Troubleshooting

### Build Fails

**Check:**
1. Build logs in GitHub Actions
2. Verify environment variables are set
3. Check for TypeScript errors
4. Verify all dependencies are in `package.json`

### Deployment Fails

**Check:**
1. Vercel deployment logs
2. Verify Vercel secrets are correct
3. Check Vercel project settings
4. Verify environment variables in Vercel

### Preview Not Created

**Check:**
1. PR must be from a fork or same repo
2. Vercel token must have correct permissions
3. Check workflow logs for errors

## Best Practices

### 1. Branch Protection

Enable branch protection for `master`/`main`:
- Require CI to pass before merge
- Require PR reviews
- Prevent force pushes

### 2. Environment Variables

- ✅ Never commit secrets to repository
- ✅ Use GitHub Secrets for CI
- ✅ Use Vercel Environment Variables for deployments
- ✅ Use different values for dev/staging/prod

### 3. Deployment Strategy

- ✅ Test in preview before production
- ✅ Use feature branches for development
- ✅ Merge to `develop` for staging
- ✅ Merge to `master` for production

### 4. Monitoring

- ✅ Set up error tracking (Sentry, etc.)
- ✅ Monitor deployment success rates
- ✅ Set up alerts for failed deployments
- ✅ Review security audit results regularly

## Pipeline Configuration

### Modify Pipeline

Edit `.github/workflows/ci-cd.yml` to:
- Change Node.js version
- Add/remove build steps
- Modify deployment conditions
- Add custom notifications

### Add Custom Steps

```yaml
- name: Custom Step
  run: |
    echo "Your custom command here"
```

### Change Triggers

Modify the `on:` section:

```yaml
on:
  push:
    branches:
      - your-branch
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight
```

## Quick Commands

```bash
# Test build locally
npm run build

# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Test deployment locally
vercel --prod
```

## Support

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## Status Badge

Add this to your README.md:

```markdown
![CI/CD](https://github.com/OWNER/REPO/workflows/CI/CD%20Pipeline/badge.svg)
```

Replace `OWNER` and `REPO` with your GitHub username and repository name.

