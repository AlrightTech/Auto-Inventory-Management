# GitHub Actions Workflows

This directory contains CI/CD workflows for automated testing, building, and deployment.

## Workflows

### 🚀 `ci-cd.yml` - Main CI/CD Pipeline
**Primary workflow for all builds and deployments**

- **Triggers:**
  - Push to `master`, `main`, or `develop`
  - Pull requests
  - Manual workflow dispatch

- **Jobs:**
  1. **CI - Build and Test**: Runs on every push/PR
     - Linting
     - Type checking
     - Building
     - Artifact verification

  2. **CD - Deploy to Production**: Runs on push to `master`/`main`
     - Builds project
     - Deploys to Vercel production

  3. **CD - Deploy Preview**: Runs on pull requests
     - Builds project
     - Creates preview deployment
     - Comments PR with preview URL

  4. **CD - Manual Deployment**: Runs on workflow dispatch
     - Allows manual deployment to production or preview

### 🔒 `security.yml` - Security Checks
**Automated security scanning**

- **Triggers:**
  - Push to any branch
  - Pull requests
  - Daily at 2 AM UTC (scheduled)

- **Jobs:**
  1. **Security Audit**: Runs `npm audit`
  2. **Dependency Review**: Reviews dependencies in PRs

### 📧 `notify.yml` - Deployment Notifications
**Sends notifications about deployment status**

- **Triggers:**
  - After CI/CD pipeline completes

- **Jobs:**
  1. **Send Notifications**: Creates deployment status

## Setup

### Required Secrets

Add these in **GitHub > Settings > Secrets and variables > Actions**:

1. `VERCEL_TOKEN` - Vercel API token
2. `VERCEL_ORG_ID` - Vercel organization ID
3. `VERCEL_PROJECT_ID` - Vercel project ID
4. `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
5. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Getting Vercel IDs

```bash
npm i -g vercel
vercel link
cat .vercel/project.json
```

## Usage

### Automatic Deployment

- **Production**: Push to `master` or `main`
- **Preview**: Create a pull request

### Manual Deployment

1. Go to **Actions** tab
2. Select **CI/CD Pipeline**
3. Click **Run workflow**
4. Choose environment and branch
5. Click **Run workflow**

## Workflow Status

View all workflow runs: `https://github.com/[owner]/[repo]/actions`

## Troubleshooting

### Build Fails
- Check build logs in Actions tab
- Verify environment variables
- Check for TypeScript errors

### Deployment Fails
- Verify Vercel secrets are correct
- Check Vercel project settings
- Review deployment logs

### Preview Not Created
- Ensure PR is from same repo or fork
- Check Vercel token permissions
- Review workflow logs

## Configuration

Edit workflow files to:
- Change Node.js version
- Modify build steps
- Add custom notifications
- Change deployment conditions

## Documentation

See `CI_CD_SETUP.md` for detailed setup instructions.
