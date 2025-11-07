# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing and deployment.

## Workflows

### 1. `ci.yml` - Continuous Integration
- Runs on every push and pull request
- Builds the project
- Runs linter
- Validates build artifacts
- Creates preview deployment comments on PRs

### 2. `deploy.yml` - Vercel Deployment
- Runs on pushes to `master`/`main` branch
- Builds the project
- Deploys to Vercel production
- Can be triggered manually via `workflow_dispatch`

### 3. `vercel-deploy.yml` - Advanced Vercel Deployment
- Uses Vercel CLI for deployment
- More control over deployment process
- Requires Vercel tokens and project IDs

## Setup

### Required GitHub Secrets

For `deploy.yml` and `vercel-deploy.yml`:

1. Go to GitHub repository > Settings > Secrets and variables > Actions
2. Add these secrets:

   - `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Get from `.vercel/project.json` after running `vercel link`
   - `VERCEL_PROJECT_ID` - Get from `.vercel/project.json` after running `vercel link`
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Getting Vercel IDs

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link

# Check .vercel/project.json for IDs
cat .vercel/project.json
```

## Usage

### Automatic Deployment

- Push to `master` → Triggers `deploy.yml` → Deploys to Vercel
- Create PR → Triggers `ci.yml` → Runs tests and builds

### Manual Deployment

1. Go to Actions tab in GitHub
2. Select "Deploy to Vercel" workflow
3. Click "Run workflow"
4. Select branch and click "Run workflow"

## Workflow Status

View workflow runs at: `https://github.com/[owner]/[repo]/actions`

