import { createClient, createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get all users with role data
    // Try to get with status, but handle gracefully if column doesn't exist
    let users: any[] = [];
    let error: any = null;
    
    const usersQuery = await supabase
      .from('profiles')
      .select('*, role_data:roles(name, is_system_role)')
      .order('created_at', { ascending: false });
    
    users = usersQuery.data || [];
    error = usersQuery.error;
    
    // If error is about missing status column, try without it
    if (error && error.message && error.message.includes('status')) {
      // Try selecting specific columns excluding status
      const usersQueryWithoutStatus = await supabase
        .from('profiles')
        .select('id, email, username, role, role_id, avatar_url, created_at, updated_at, role_data:roles(name, is_system_role)')
        .order('created_at', { ascending: false });
      
      users = (usersQueryWithoutStatus.data || []).map((user: any) => ({
        ...user,
        status: 'active' // Default to active if column doesn't exist
      }));
      error = usersQueryWithoutStatus.error;
    }

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ data: users });
  } catch (error) {
    console.error('Error in GET /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, password, role, username, status } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'seller', 'transporter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, seller, or transporter' },
        { status: 400 }
      );
    }

    // Create user in Supabase Auth using admin client (requires service role key)
    const adminClient = createAdminClient();
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin-created users
      user_metadata: {
        role,
        username: username || email.split('@')[0],
      }
    });

    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create profile
    const profileInsert: any = {
      id: authData.user.id,
      email,
      role,
      username: username || email.split('@')[0],
    };

    // Add status if provided (and column exists)
    if (status && ['active', 'inactive'].includes(status)) {
      profileInsert.status = status;
    }

    const { data: profileData, error: profileCreateError } = await supabase
      .from('profiles')
      .insert(profileInsert)
      .select()
      .single();

    if (profileCreateError) {
      console.error('Error creating profile:', profileCreateError);
      return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
    }

    return NextResponse.json({ data: profileData }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





