# Storage Bucket Setup Guide

## Quick Setup

To fix the "Failed to upload image. Please ensure the storage bucket exists" error, you need to create the storage bucket in Supabase.

## Method 1: Create via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to [https://app.supabase.com](https://app.supabase.com)
   - Select your project

2. **Open Storage Section**
   - Click on "Storage" in the left sidebar
   - Click "New bucket" button

3. **Create the Bucket**
   - **Name**: `vehicle-images`
   - **Public bucket**: ✅ **Enable this** (toggle ON)
   - Click "Create bucket"

4. **Configure Bucket Settings** (Optional but recommended)
   - Click on the `vehicle-images` bucket
   - Go to "Settings" tab
   - Set **File size limit**: 10 MB (10485760 bytes)
   - Set **Allowed MIME types**: 
     - `image/jpeg`
     - `image/jpg`
     - `image/png`
     - `application/pdf`

## Method 2: Create via SQL (Alternative)

If you prefer using SQL, you can run this in the Supabase SQL Editor:

```sql
-- Note: Storage buckets cannot be created via SQL in Supabase
-- You must use the Dashboard or Storage API
-- This is just for reference
```

**Note**: Supabase Storage buckets must be created via the Dashboard or Storage API, not SQL.

## Method 3: Automatic Creation (If Permissions Allow)

The application will now automatically try to create the bucket if it doesn't exist. However, this requires:
- User to have admin privileges
- Proper RLS policies on storage

If automatic creation fails, use Method 1 above.

## Verify Bucket Creation

After creating the bucket:

1. Go to Storage → `vehicle-images`
2. You should see an empty bucket
3. Try uploading an image in your application
4. The image should appear in the bucket

## Additional Buckets Needed

Your application may also need these buckets (create them the same way):

- `vehicle-assessments` - For assessment images
- `vehicle-dispatch` - For dispatch documents

## Troubleshooting

### Error: "Bucket not found"
- Ensure the bucket name is exactly `vehicle-images` (case-sensitive)
- Check that the bucket is set to **Public**

### Error: "Permission denied"
- Ensure the bucket is set to **Public**
- Check RLS policies if using private buckets

### Error: "File size limit exceeded"
- Default limit is 50MB, but you can set it to 10MB in bucket settings
- Or compress images before uploading

## Storage Costs

- **Free Tier**: 1 GB storage, 2 GB bandwidth/month
- **Pro Plan**: $25/month - 100 GB storage, 200 GB bandwidth
- Monitor usage in Dashboard → Storage → Usage

