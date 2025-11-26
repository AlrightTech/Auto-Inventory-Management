import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/users/[id]/reset-password - Admin reset user password
export async function POST(
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
    if (targetUserId === user.id) {
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('role, role_id, role_data:roles(name)')
        .eq('id', targetUserId)
        .single();

      const targetIsAdmin = targetProfile?.role === 'admin' || targetProfile?.role_data?.name === 'Admin';
      if (targetIsAdmin) {
        return NextResponse.json({ error: 'Admin account cannot be modified' }, { status: 403 });
      }
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Get target user
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password using admin API
    const { error: passwordError } = await supabase.auth.admin.updateUserById(
      targetUserId,
      { password: newPassword }
    );

    if (passwordError) {
      console.error('Error resetting password:', passwordError);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action_type: 'reset_password',
        target_user_id: targetUserId,
        details: {
          admin_email: adminProfile.email,
          target_email: targetUser.email,
          target_username: targetUser.username,
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });

    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error in POST /api/users/[id]/reset-password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

