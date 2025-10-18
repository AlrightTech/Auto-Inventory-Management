#!/usr/bin/env node

/**
 * Database Setup Script for Auto Inventory Management
 * 
 * This script helps set up the Supabase database with the required tables,
 * RLS policies, and sample data.
 * 
 * Usage:
 * 1. Make sure you have your Supabase project URL and anon key in .env.local
 * 2. Run: node scripts/setup-database.js
 */

import fs from 'fs';
import path from 'path';

async function setupDatabase() {
  console.log('🚀 Setting up Auto Inventory Management Database...\n');
  
  // Check if .env.local exists
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌.env.local file not found!');
    console.log('Please create .env.local with your Supabase credentials:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    process.exit(1);
  }
  
  // Read environment variables with better parsing
  // Try UTF-8 first, then UTF-16 if that fails
  let envContent;
  try {
    envContent = fs.readFileSync(envPath, 'utf8');
  } catch {
    try {
      envContent = fs.readFileSync(envPath, 'utf16le');
    } catch {
      console.error('❌ Could not read .env.local file');
      process.exit(1);
    }
  }
  
  // Convert UTF-16 to UTF-8 if needed
  if (envContent.includes('\u0000')) {
    // This is UTF-16, convert to UTF-8
    envContent = envContent.replace(/\u0000/g, '');
  }
  
  const lines = envContent.split('\n');
  
  let supabaseUrl = null;
  let supabaseAnonKey = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.includes('NEXT_PUBLIC_SUPABASE_URL=')) {
      const parts = trimmedLine.split('=');
      if (parts.length >= 2) {
        supabaseUrl = parts.slice(1).join('=').trim();
        console.log('✅ Found URL');
      }
    }
    if (trimmedLine.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      const parts = trimmedLine.split('=');
      if (parts.length >= 2) {
        supabaseAnonKey = parts.slice(1).join('=').trim();
        console.log('✅ Found Key');
      }
    }
  }
  
  console.log('URL found:', Boolean(supabaseUrl));
  console.log('Key found:', Boolean(supabaseAnonKey));
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials in .env.local!');
    console.log('Please add:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
    process.exit(1);
  }
  
  console.log('✅ Environment variables found');
  console.log(`📡 Supabase URL: ${supabaseUrl}`);
  console.log(`🔑 Anon Key: ${supabaseAnonKey.substring(0, 20)}...`);
  
  // Read schema file
  const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error('❌ Schema file not found at supabase/schema.sql');
    process.exit(1);
  }
  
  fs.readFileSync(schemaPath, 'utf8');
  console.log('✅ Schema file found');
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
  console.log('2. Navigate to your project');
  console.log('3. Go to SQL Editor');
  console.log('4. Copy and paste the contents of supabase/schema.sql');
  console.log('5. Run the SQL script');
  console.log('\n📄 Schema file location: supabase/schema.sql');
  console.log('\n🎯 The schema includes:');
  console.log('   • All required tables (profiles, vehicles, tasks, events, messages, notifications)');
  console.log('   • Row Level Security (RLS) policies');
  console.log('   • Indexes for performance');
  console.log('   • Triggers for updated_at timestamps');
  console.log('   • Realtime subscriptions for messages');
  console.log('   • Sample data for development');
  
  console.log('\n✨ After running the schema:');
  console.log('   • Your database will be ready for the application');
  console.log('   • Sample users will be created (admin, seller, transporter)');
  console.log('   • Sample vehicles and tasks will be available');
  console.log('   • Real-time chat will be functional');
  
  console.log('\n🔐 Creating Admin User:');
  console.log('   1. Go to Supabase Dashboard → Authentication → Users');
  console.log('   2. Click "Add User" → "Create new user"');
  console.log('   3. Enter email: admin@example.com');
  console.log('   4. Enter password: admin123456');
  console.log('   5. Click "Create user"');
  console.log('   6. The profile will be automatically created with admin role');
  console.log('\n📝 Note: The trigger will automatically create a profile with admin role');
  console.log('   when you create the first user. You can change the role later if needed.');
  
  console.log('\n🎉 Database setup instructions complete!');
}

// Run the setup
setupDatabase().catch(console.error);
