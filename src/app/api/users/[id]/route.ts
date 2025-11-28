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
    const { username, role, role_id, email, status } = body;

    // Validate role if provided - prevent creating new admins
    if (role && role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot change user role to admin via this endpoint' },
        { status: 403 }
      );
    }

    // If role_id is provided, validate it exists and is not Admin
    if (role_id) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name, is_system_role')
        .eq('id', role_id)
        .single();

      if (roleError || !roleData) {
        return NextResponse.json(
          { error: 'Invalid role_id provided' },
          { status: 400 }
        );
      }

      // Prevent assigning Admin role
      if (roleData.name.toLowerCase() === 'admin') {
        return NextResponse.json(
          { error: 'Cannot assign Admin role via this endpoint' },
          { status: 403 }
        );
      }
    }

    // Validate legacy role if provided (for backward compatibility)
    if (role && !['seller', 'transporter'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be seller or transporter' },
        { status: 400 }
      );
    }

    // Validate and normalize status if provided
    let normalizedStatus: string | undefined = undefined;
    if (status !== undefined) {
      const statusLower = String(status).toLowerCase().trim();
      if (statusLower === 'active' || statusLower === 'inactive') {
        normalizedStatus = statusLower;
      } else {
        return NextResponse.json(
          { error: `Invalid status value. Must be 'active' or 'inactive', received: '${status}'` },
          { status: 400 }
        );
      }
    }

    // Validate email format if provided
    if (email !== undefined) {
      const emailTrimmed = email.trim();
      if (!emailTrimmed) {
        return NextResponse.json(
          { error: 'Email cannot be empty' },
          { status: 400 }
        );
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Check for duplicate email if email is being changed
    if (email !== undefined && email !== targetUser.email) {
      const { data: existingUser, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim())
        .neq('id', id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is what we want
        console.error('Error checking duplicate email:', checkError);
      } else if (existingUser) {
        return NextResponse.json(
          { error: 'Email already exists. Please use a different email address.' },
          { status: 400 }
        );
      }
    }

    // Update profile
    const updateData: any = {};
    if (username !== undefined) {
      const usernameTrimmed = username.trim();
      if (!usernameTrimmed) {
        return NextResponse.json(
          { error: 'Username cannot be empty' },
          { status: 400 }
        );
      }
      updateData.username = usernameTrimmed;
    }
    if (role !== undefined) updateData.role = role;
    if (role_id !== undefined) updateData.role_id = role_id;
    if (email !== undefined) updateData.email = email.trim();
    // Update status with normalized value
    if (normalizedStatus !== undefined) {
      updateData.status = normalizedStatus;
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
          changes: { username, role, role_id, email, status },
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });

    console.log('Updating user profile:', { userId: id, updateData });

    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        updateData,
        userId: id
      });

      // Provide meaningful error messages based on error type
      let errorMessage = 'Failed to update user';
      let statusCode = 500;

      if (error.code === '23505') {
        // Unique constraint violation
        if (error.message?.includes('email')) {
          errorMessage = 'Email already exists. Please use a different email address.';
        } else if (error.message?.includes('username')) {
          errorMessage = 'Username already exists. Please use a different username.';
        } else {
          errorMessage = 'A record with this information already exists.';
        }
        statusCode = 400;
      } else if (error.code === '23514') {
        // Check constraint violation
        if (error.message?.includes('status')) {
          errorMessage = `Invalid status value. Must be 'active' or 'inactive'.`;
        } else if (error.message?.includes('role')) {
          errorMessage = `Invalid role value.`;
        } else {
          errorMessage = `Validation failed: ${error.message || 'Invalid data provided'}`;
        }
        statusCode = 400;
      } else if (error.code === '23503') {
        // Foreign key constraint violation
        if (error.message?.includes('role_id')) {
          errorMessage = 'Invalid role selected. The role does not exist.';
        } else {
          errorMessage = 'Referenced record does not exist.';
        }
        statusCode = 400;
      } else if (error.message) {
        errorMessage = `Failed to update user: ${error.message}`;
      }

      return NextResponse.json({ 
        error: errorMessage,
        details: error.details,
        code: error.code
      }, { status: statusCode });
    }

    console.log('User profile updated successfully:', { userId: id, updatedUser });

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





