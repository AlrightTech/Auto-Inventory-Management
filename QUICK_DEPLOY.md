# Quick Deploy to Vercel

## Fastest Way (5 minutes)

### Step 1: Connect to Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select `AlrightTech/Auto-Inventory-Management`
4. Click **"Import"**

### Step 2: Add Environment Variables (2 minutes)

In Vercel project settings:

1. Go to **Settings** > **Environment Variables**
2. Add these two variables:

   ```
   Name: NEXT_PUBLIC_SUPABASE_URL
   Value: [Your Supabase URL from Supabase Dashboard]
   
   Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: [Your Supabase Anon Key from Supabase Dashboard]
   ```

3. Check all three boxes:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development

### Step 3: Deploy (1 minute)

1. Click **"Deploy"** button
2. Wait for build to complete (~2-3 minutes)
3. Your app will be live at: `https://your-project.vercel.app`

## That's it! 🎉

Every time you push to `master` branch, Vercel will automatically deploy.

## Next Steps

- Add custom domain (Settings > Domains)
- Enable Vercel Analytics (Settings > Analytics)
- Set up preview deployments for PRs (automatic)

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify environment variables are set correctly

**App not working?**
- Check browser console for errors
- Verify Supabase connection
- Check Vercel function logs

## Need Help?

See `VERCEL_DEPLOYMENT_GUIDE.md` for detailed instructions.

