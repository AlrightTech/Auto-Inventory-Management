/**
 * Test script to verify Supabase email configuration
 * Run with: node scripts/test-email-config.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure .env.local contains:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailConfiguration() {
  console.log('🧪 Testing Supabase Email Configuration...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('1. Testing Supabase connection...');
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError && userError.message !== 'Auth session missing!') {
      console.error('❌ Failed to connect to Supabase:', userError.message);
      return;
    }
    console.log('✅ Successfully connected to Supabase\n');

    // Test 2: Test signup (this will send an email if configured)
    console.log('2. Testing email signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`
      }
    });

    if (signupError) {
      console.error('❌ Signup failed:', signupError.message);
      return;
    }

    if (signupData.user) {
      if (signupData.user.email_confirmed_at) {
        console.log('✅ Email signup successful (email already confirmed)');
        console.log('   This might indicate email confirmation is disabled in Supabase settings');
      } else {
        console.log('✅ Email signup successful (email confirmation required)');
        console.log('   Check your email inbox for verification link');
        console.log(`   Test email: ${testEmail}`);
      }
    }

    // Test 3: Check database tables
    console.log('\n3. Testing database tables...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profilesError) {
      console.error('❌ Profiles table error:', profilesError.message);
    } else {
      console.log('✅ Profiles table accessible');
    }

    // Test 4: Check auth settings
    console.log('\n4. Checking authentication settings...');
    console.log('   Go to your Supabase Dashboard → Authentication → Settings');
    console.log('   Make sure "Enable email confirmations" is turned ON');
    console.log('   Configure SMTP settings if using custom email provider');

    console.log('\n📧 Email Configuration Checklist:');
    console.log('   □ Enable email confirmations in Supabase Dashboard');
    console.log('   □ Configure SMTP settings (Gmail, SendGrid, etc.)');
    console.log('   □ Set up email templates');
    console.log('   □ Test with real email address');
    console.log('   □ Check spam folder if emails not received');

    console.log('\n🔗 Useful Links:');
    console.log(`   Supabase Dashboard: https://supabase.com/dashboard/project/${supabaseUrl.split('//')[1].split('.')[0]}`);
    console.log('   Auth Settings: Authentication → Settings → Email');
    console.log('   Email Templates: Authentication → Email Templates');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testEmailConfiguration();

