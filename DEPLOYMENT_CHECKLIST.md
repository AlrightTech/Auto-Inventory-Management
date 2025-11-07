# Vercel Deployment Checklist

Use this checklist to ensure a successful deployment to Vercel.

## Pre-Deployment

- [ ] Build passes locally (`npm run build`)
- [ ] All environment variables documented
- [ ] No hardcoded secrets in code
- [ ] `.env.local` is in `.gitignore`
- [ ] All dependencies are in `package.json`

## Vercel Setup

- [ ] Vercel account created
- [ ] GitHub repository connected to Vercel
- [ ] Project imported in Vercel dashboard
- [ ] Environment variables added in Vercel dashboard:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] Any other required variables
- [ ] Environment variables enabled for:
  - [ ] Production
  - [ ] Preview
  - [ ] Development

## GitHub Actions Setup (Optional)

- [ ] GitHub Actions enabled for repository
- [ ] Secrets added to GitHub:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deployment

- [ ] Code committed to repository
- [ ] Pushed to `master` or `main` branch
- [ ] Deployment triggered automatically
- [ ] Build logs checked for errors
- [ ] Deployment successful

## Post-Deployment

- [ ] Application accessible at Vercel URL
- [ ] All pages load correctly
- [ ] API routes working
- [ ] Database connections working
- [ ] Authentication working
- [ ] No console errors in browser
- [ ] Performance acceptable

## Monitoring

- [ ] Vercel Analytics enabled (optional)
- [ ] Error tracking set up (optional)
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate active (automatic with Vercel)

## Rollback Plan

- [ ] Know how to rollback in Vercel dashboard
- [ ] Previous deployment identified
- [ ] Rollback procedure tested

## Documentation

- [ ] Deployment guide updated
- [ ] Environment variables documented
- [ ] Team members informed of deployment

