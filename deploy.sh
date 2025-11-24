#!/bin/bash

# Auto Inventory Management - Deployment Script
# This script ensures all deployment requirements are met

echo "🚀 Auto Inventory Management - Deployment Preparation"
echo "=================================================="
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "   Node.js: $NODE_VERSION"
echo ""

# Install dependencies
echo "📥 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ Failed to install dependencies"
  exit 1
fi
echo "✅ Dependencies installed"
echo ""

# Check environment variables
echo "🔍 Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "⚠️  WARNING: NEXT_PUBLIC_SUPABASE_URL is not set"
  echo "   The build will succeed but the app won't work without it"
else
  echo "✅ NEXT_PUBLIC_SUPABASE_URL is set"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
  echo "⚠️  WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set"
  echo "   The build will succeed but the app won't work without it"
else
  echo "✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
fi
echo ""

# Run build
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Build successful"
echo ""

# Verify build artifacts
echo "🔍 Verifying build artifacts..."
if [ ! -d ".next" ]; then
  echo "❌ Build artifacts not found"
  exit 1
fi
echo "✅ Build artifacts verified"
echo ""

echo "✨ Deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Set environment variables in Vercel dashboard"
echo "   2. Run database migration in Supabase"
echo "   3. Assign Super Admin role to your account"
echo "   4. Deploy to Vercel"
echo ""


