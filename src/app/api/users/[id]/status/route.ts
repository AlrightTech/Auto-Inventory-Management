import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// PATCH /api/users/[id]/status - Admin activate/deactivate user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: targetUserId } = await params;
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if current user is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name), email')
      .eq('id', user.id)
      .single();

    if (adminError) {
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    const isAdmin = adminProfile?.role === 'admin' || adminProfile?.role_data?.name === 'Admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Prevent modifying admin account
    const { data: targetProfile, error: targetError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name), email, username')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetIsAdmin = targetProfile?.role === 'admin' || targetProfile?.role_data?.name === 'Admin';
    if (targetIsAdmin) {
      return NextResponse.json({ error: 'Admin account cannot be deactivated' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "inactive"' },
        { status: 400 }
      );
    }

    // Update status
    // Check if status column exists first by trying to update
    const { data: updatedUser, error: updateError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', targetUserId)
      .select()
      .single();

    if (updateError) {
      // If error is about missing column, return helpful message
      if (updateError.message && updateError.message.includes('status')) {
        console.error('Status column does not exist. Please run migration: 20250105_add_user_management_fields.sql');
        return NextResponse.json({ 
          error: 'Status column does not exist. Please run the database migration to enable user status management.',
          details: 'Migration file: 20250105_add_user_management_fields.sql'
        }, { status: 500 });
      }
      console.error('Error updating user status:', updateError);
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action_type: status === 'active' ? 'activate_user' : 'deactivate_user',
        target_user_id: targetUserId,
        details: {
          admin_email: adminProfile.email,
          target_email: targetProfile.email,
          target_username: targetProfile.username,
          new_status: status,
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });

    return NextResponse.json({ 
      data: updatedUser,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Error in PATCH /api/users/[id]/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

