# Fix: Vehicle Assessments Table Not Found

## Problem
The error "Could not find the table 'public.vehicle_assessments' in the schema cache" occurs because the `vehicle_assessments` table hasn't been created in your Supabase database.

## Solution

### Quick Fix (Recommended)
1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Open the file: `scripts/fix-vehicle-assessments-table.sql`
4. Copy the entire contents of the file
5. Paste it into the SQL Editor
6. Click **Run** to execute the script

The script will:
- Create the `vehicle_assessments` table
- Set up all required indexes
- Enable Row Level Security (RLS)
- Create RLS policies
- Set up the `updated_at` trigger

### Verification
After running the script, you should see a success message. You can verify the table was created by:
1. Going to **Table Editor** in Supabase Dashboard
2. You should see `vehicle_assessments` in the list of tables

### Alternative: Run Migration File
If you prefer to use the migration file directly:
1. Go to **Supabase Dashboard** > **SQL Editor**
2. Open `supabase/migrations/20241224_create_vehicle_assessments.sql`
3. Copy and paste the contents
4. Run the SQL

## What Was Fixed
- ✅ Added `vehicle_assessments` table definition to `supabase/schema.sql` (for future database setups)
- ✅ Created fix script at `scripts/fix-vehicle-assessments-table.sql` (for immediate fix)
- ✅ The table includes all necessary columns, indexes, RLS policies, and triggers

## After Fixing
Once the table is created, you should be able to:
- Create new assessments
- Update existing assessments
- View assessments in the vehicle details page
- Delete assessments

The error should no longer appear when trying to create or update assessments.

