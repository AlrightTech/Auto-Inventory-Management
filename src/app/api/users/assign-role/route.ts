import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/permissions';

// POST /api/users/assign-role - Assign role to user (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.response;
    const { supabase } = authResult;

    const body = await request.json();
    const { user_id, role_id } = body;

    if (!user_id || !role_id) {
      return NextResponse.json(
        { error: 'user_id and role_id are required' },
        { status: 400 }
      );
    }

    // Verify role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .eq('id', role_id)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Update user's role_id
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ role_id: role_id })
      .eq('id', user_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error assigning role:', updateError);
      return NextResponse.json(
        { error: 'Failed to assign role' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: updatedProfile,
      message: `Role "${role.name}" assigned successfully`,
    });
  } catch (error) {
    console.error('Error in POST /api/users/assign-role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

