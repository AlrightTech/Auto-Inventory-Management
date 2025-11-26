import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/users/[id] - Get specific user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    // Get specific user with role data
    // Try to get with status, but handle gracefully if column doesn't exist
    let userData: any = null;
    let error: any = null;
    
    const userQuery = await supabase
      .from('profiles')
      .select('*, role_data:roles(name, is_system_role)')
      .eq('id', id)
      .single();
    
    userData = userQuery.data;
    error = userQuery.error;
    
    // If error is about missing status column, try without it
    if (error && error.message && error.message.includes('status')) {
      const userQueryWithoutStatus = await supabase
        .from('profiles')
        .select('id, email, username, role, role_id, avatar_url, created_at, updated_at, role_data:roles(name, is_system_role)')
        .eq('id', id)
        .single();
      
      userData = userQueryWithoutStatus.data;
      error = userQueryWithoutStatus.error;
      // Default status to 'active' if column doesn't exist
      if (userData) {
        userData.status = 'active';
      }
    }

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    return NextResponse.json({ data: userData });
  } catch (error) {
    console.error('Error in GET /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/users/[id] - Update user (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    // Get target user to check if it's admin
    const { data: targetUser, error: targetUserError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', id)
      .single();

    if (targetUserError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent modifying admin account
    const targetIsAdmin = targetUser?.role === 'admin' || targetUser?.role_data?.name === 'Admin';
    if (targetIsAdmin) {
      return NextResponse.json({ error: 'Admin account cannot be modified' }, { status: 403 });
    }

    const body = await request.json();
    const { username, role, email, status } = body;

    // Validate role if provided - prevent creating new admins
    if (role && role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot change user role to admin via this endpoint' },
        { status: 403 }
      );
    }

    if (role && !['seller', 'transporter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be seller or transporter' },
        { status: 400 }
      );
    }

    // Update profile
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (role !== undefined) updateData.role = role;
    if (email !== undefined) updateData.email = email;
    // Only update status if provided and column exists (will fail gracefully if column doesn't exist)
    if (status !== undefined) {
      updateData.status = status;
    }
    updateData.updated_at = new Date().toISOString();

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action_type: 'update_user',
        target_user_id: id,
        details: {
          changes: { username, role, email, status },
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedUser });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    // Prevent admin from deleting themselves
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if user being deleted is an admin
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', id)
      .single();

    if (targetError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetIsAdmin = targetUser?.role === 'admin' || targetUser?.role_data?.name === 'Admin';
    if (targetIsAdmin) {
      return NextResponse.json({ error: 'Admin account cannot be deleted' }, { status: 403 });
    }

    // Delete profile (this will cascade to related records)
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    // Note: In a real application, you might also want to delete from auth.users
    // This requires admin privileges and should be done carefully

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





