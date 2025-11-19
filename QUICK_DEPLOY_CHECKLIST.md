# Quick Deployment Checklist

## ✅ Pre-Deployment

- [ ] Code is committed and pushed to GitHub
- [ ] Local build succeeds: `npm run build`
- [ ] All environment variables documented
- [ ] Database migrations ready

## 🗄️ Supabase Setup (Backend)

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Run `supabase/migrations/20250103_create_rbac_system.sql` in SQL Editor
- [ ] Get credentials from Settings > API:
  - [ ] Project URL
  - [ ] anon/public key
  - [ ] service_role key (optional)
- [ ] Enable Realtime for: messages, notifications, user_status
- [ ] Configure Auth redirect URLs
- [ ] Create admin user

## 🚀 Vercel Deployment (Frontend)

- [ ] Sign up/login at [vercel.com](https://vercel.com)
- [ ] Import GitHub repository
- [ ] Configure project:
  - [ ] Framework: Next.js (auto-detected)
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next`
- [ ] Add Environment Variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (optional)
- [ ] Deploy
- [ ] Get deployment URL

## 🔧 Post-Deployment

- [ ] Update Supabase Auth URLs:
  - [ ] Site URL: `https://your-app.vercel.app`
  - [ ] Redirect URLs: `https://your-app.vercel.app/auth/callback`
- [ ] Test login/registration
- [ ] Verify all features work
- [ ] Test role-based access
- [ ] Check error logs

## 🚂 Railway (Optional - Not Required)

**Note**: Railway is NOT needed for this setup since Supabase handles the backend.

If you want to deploy a separate backend service on Railway:
- [ ] Create Railway account
- [ ] Create new project
- [ ] Configure environment variables
- [ ] Deploy service
- [ ] Update frontend to use Railway API URL

## ✅ Verification

- [ ] App loads at Vercel URL
- [ ] Login works
- [ ] Database queries succeed
- [ ] Real-time features work
- [ ] RBAC permissions work
- [ ] No console errors
- [ ] All pages accessible

## 📝 Environment Variables Template

```env
# Copy this to Vercel Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🆘 Troubleshooting

- **Build fails**: Check Vercel build logs
- **App doesn't load**: Verify environment variables
- **Database errors**: Check Supabase connection
- **Auth issues**: Verify redirect URLs in Supabase

