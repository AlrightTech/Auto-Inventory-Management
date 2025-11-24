import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// PATCH assign role to user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const supabase = await createClient();
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role_id === null) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { role_id } = body;

    if (!role_id) {
      return NextResponse.json({ error: 'role_id is required' }, { status: 400 });
    }

    // Verify role exists
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('id', role_id)
      .single();

    if (!role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update user's role
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update({ role_id })
      .eq('id', params.userId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning role:', error);
      return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
    }

    return NextResponse.json({ data: updatedProfile });
  } catch (error) {
    console.error('Error in PATCH /api/users/[userId]/role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

