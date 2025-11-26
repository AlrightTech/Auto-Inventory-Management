import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/users/[id]/impersonate - Admin impersonate user
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
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    if (adminError) {
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 });
    }

    const isAdmin = adminProfile?.role === 'admin' || adminProfile?.role_data?.name === 'Admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get target user
    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, email, username, status')
      .eq('id', targetUserId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if target user is active
    if (targetUser.status === 'inactive') {
      return NextResponse.json({ error: 'Cannot impersonate inactive user' }, { status: 400 });
    }

    // Prevent impersonating admin
    const { data: targetUserRole } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', targetUserId)
      .single();

    const targetIsAdmin = targetUserRole?.role === 'admin' || targetUserRole?.role_data?.name === 'Admin';
    if (targetIsAdmin) {
      return NextResponse.json({ error: 'Cannot impersonate admin users' }, { status: 403 });
    }

    // Get target user's auth session
    const { data: targetAuthUser, error: authError } = await supabase.auth.admin.getUserById(targetUserId);
    if (authError || !targetAuthUser) {
      return NextResponse.json({ error: 'Failed to get target user session' }, { status: 500 });
    }

    // Create impersonation session
    // Store original admin ID in a cookie for later restoration
    const cookieStore = await cookies();
    cookieStore.set('impersonating_admin_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    // Log the impersonation
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: user.id,
        action_type: 'impersonate_user',
        target_user_id: targetUserId,
        details: {
          admin_email: adminProfile.email || user.email,
          target_email: targetUser.email,
          target_username: targetUser.username,
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      });

    // Return success - the frontend will handle the session switch
    return NextResponse.json({ 
      message: 'Impersonation started',
      targetUserId,
      targetEmail: targetUser.email,
      targetUsername: targetUser.username,
    });
  } catch (error) {
    console.error('Error in POST /api/users/[id]/impersonate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

