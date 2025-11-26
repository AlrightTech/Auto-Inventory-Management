import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// POST /api/users/[id]/restore-admin - Restore admin session after impersonation
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    
    // Get stored admin ID from cookie
    const adminId = cookieStore.get('impersonating_admin_id')?.value;
    
    if (!adminId) {
      return NextResponse.json({ error: 'No impersonation session found' }, { status: 400 });
    }

    // Verify admin still exists and is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', adminId)
      .single();

    if (adminError || !adminProfile) {
      return NextResponse.json({ error: 'Admin account not found' }, { status: 404 });
    }

    const isAdmin = adminProfile?.role === 'admin' || adminProfile?.role_data?.name === 'Admin';
    if (!isAdmin) {
      return NextResponse.json({ error: 'Original admin account is no longer admin' }, { status: 403 });
    }

    // Get current impersonated user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Log the restoration
      await supabase
        .from('audit_logs')
        .insert({
          admin_id: adminId,
          action_type: 'restore_admin_session',
          target_user_id: user.id,
          details: {
            restored_at: new Date().toISOString(),
          },
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
        });
    }

    // Clear impersonation cookie
    cookieStore.delete('impersonating_admin_id');

    return NextResponse.json({ 
      message: 'Admin session restored',
      adminId,
    });
  } catch (error) {
    console.error('Error in POST /api/users/[id]/restore-admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

