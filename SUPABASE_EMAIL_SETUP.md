# Supabase Email Configuration Guide

## Issue: Signup verification emails are not being received

This guide will help you configure Supabase to send verification emails properly.

## Step 1: Configure Email Settings in Supabase Dashboard

1. **Go to your Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project: `kgpslcybqgdsvgxydnel`

2. **Navigate to Authentication Settings**
   - Go to `Authentication` → `Settings`
   - Scroll down to `Email` section

3. **Configure Email Provider**
   - **Option A: Use Supabase's built-in email service (Limited)**
     - Enable "Enable email confirmations"
     - Set "Confirm email" to `true`
     - Note: This has daily limits and may go to spam

   - **Option B: Use custom SMTP (Recommended for production)**
     - Enable "Enable email confirmations"
     - Set "Confirm email" to `true`
     - Configure SMTP settings:
       - **SMTP Host**: `smtp.gmail.com` (for Gmail)
       - **SMTP Port**: `587`
       - **SMTP User**: Your email address
       - **SMTP Pass**: Your app password (not regular password)
       - **SMTP Admin Email**: Your email address
       - **SMTP Sender Name**: `Auto Inventory Management`

## Step 2: Gmail SMTP Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in SMTP settings

3. **SMTP Configuration**:
   ```
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP User: your-email@gmail.com
   SMTP Pass: your-16-character-app-password
   SMTP Admin Email: your-email@gmail.com
   SMTP Sender Name: Auto Inventory Management
   ```

## Step 3: Alternative Email Providers

### SendGrid (Recommended for production)
1. Create SendGrid account
2. Get API key
3. Configure in Supabase:
   ```
   SMTP Host: smtp.sendgrid.net
   SMTP Port: 587
   SMTP User: apikey
   SMTP Pass: your-sendgrid-api-key
   ```

### Mailgun
1. Create Mailgun account
2. Get SMTP credentials
3. Configure in Supabase:
   ```
   SMTP Host: smtp.mailgun.org
   SMTP Port: 587
   SMTP User: your-mailgun-smtp-user
   SMTP Pass: your-mailgun-smtp-password
   ```

## Step 4: Email Templates Configuration

1. **Go to Authentication → Email Templates**
2. **Configure Confirmation Email**:
   - Subject: `Confirm your Auto Inventory account`
   - Body: 
   ```html
   <h2>Welcome to Auto Inventory Management!</h2>
   <p>Please confirm your email address by clicking the link below:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm Email</a></p>
   <p>If you didn't create this account, please ignore this email.</p>
   ```

3. **Configure Password Reset Email**:
   - Subject: `Reset your Auto Inventory password`
   - Body:
   ```html
   <h2>Password Reset Request</h2>
   <p>Click the link below to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
   <p>This link will expire in 1 hour.</p>
   ```

## Step 5: Test Email Configuration

1. **Test Registration**:
   - Go to your app's registration page
   - Register with a test email
   - Check if verification email is received

2. **Check Spam Folder**:
   - Emails might go to spam initially
   - Add sender to contacts to avoid spam

3. **Monitor Supabase Logs**:
   - Go to Logs → Auth
   - Check for email sending errors

## Step 6: Environment Variables (Already Configured)

Your `.env.local` file already has the correct Supabase configuration:
```
NEXT_PUBLIC_SUPABASE_URL=https://kgpslcybqgdsvgxydnel.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 7: Database Migration

Run the database migration to create the profile trigger:
```bash
# If you have Supabase CLI installed
supabase db push

# Or apply the migration manually in Supabase SQL Editor
```

## Troubleshooting

### Common Issues:

1. **Emails not being sent**:
   - Check SMTP credentials
   - Verify email provider settings
   - Check Supabase logs for errors

2. **Emails going to spam**:
   - Configure SPF/DKIM records
   - Use a professional email service
   - Add sender to contacts

3. **"Invalid confirmation link"**:
   - Check email redirect URL configuration
   - Ensure `/auth/confirm` route is accessible

4. **Profile not created after confirmation**:
   - Check database trigger is installed
   - Verify RLS policies allow profile creation

### Testing Steps:

1. Register with a test email
2. Check email inbox (and spam)
3. Click verification link
4. Verify redirect to confirmation page
5. Check if profile is created in database
6. Test login with confirmed account

## Production Recommendations

1. **Use professional email service** (SendGrid, Mailgun, AWS SES)
2. **Set up proper DNS records** (SPF, DKIM, DMARC)
3. **Monitor email delivery rates**
4. **Set up email analytics**
5. **Configure email templates** with your branding

## Current Status

✅ **Fixed Issues**:
- Added proper email confirmation flow
- Created confirmation page (`/auth/confirm`)
- Updated registration to include email redirect
- Added database trigger for profile creation
- Improved error handling and user feedback

🔧 **Still Need to Configure**:
- SMTP settings in Supabase dashboard
- Email templates customization
- Test with real email provider

## Next Steps

1. Configure SMTP in Supabase dashboard
2. Test email delivery
3. Customize email templates
4. Monitor email delivery rates





