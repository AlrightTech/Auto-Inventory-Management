import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// GET /api/users/check-impersonation - Check if admin is impersonating
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('impersonating_admin_id')?.value;
    
    if (!adminId) {
      return NextResponse.json({ isImpersonating: false });
    }

    // Get admin username
    const supabase = await createClient();
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('username, email')
      .eq('id', adminId)
      .single();

    return NextResponse.json({
      isImpersonating: true,
      adminId,
      adminUsername: adminProfile?.username || adminProfile?.email || 'Admin',
    });
  } catch (error) {
    console.error('Error checking impersonation:', error);
    return NextResponse.json({ isImpersonating: false });
  }
}

