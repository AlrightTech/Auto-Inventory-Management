import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RolePermissions } from '@/types/permissions';

// GET /api/roles/[roleId] - Get single role
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const supabase = await createClient();
    const { roleId } = await params;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role_data?.name === 'Admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get role
    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', roleId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Role not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching role:', error);
      return NextResponse.json(
        { error: 'Failed to fetch role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: role });
  } catch (error: any) {
    console.error('Error in GET /api/roles/[roleId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/roles/[roleId] - Update role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const supabase = await createClient();
    const { roleId } = await params;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role_data?.name === 'Admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get role to verify it exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single();

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
    }
    if (description !== undefined) {
      updateData.description = description || null;
    }
    if (permissions !== undefined) {
      updateData.permissions = permissions as RolePermissions;
    }

    // Update role
    const { data: role, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', roleId)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Role with this name already exists' },
          { status: 400 }
        );
      }
      console.error('Error updating role:', error);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: role });
  } catch (error: any) {
    console.error('Error in PATCH /api/roles/[roleId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[roleId] - Delete role
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const supabase = await createClient();
    const { roleId } = await params;
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    const isAdmin = profile?.role === 'admin' || profile?.role_data?.name === 'Admin';
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get role to verify it exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single();

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if any users are using this role
    const { data: usersWithRole } = await supabase
      .from('profiles')
      .select('id')
      .eq('role_id', roleId)
      .limit(1);

    if (usersWithRole && usersWithRole.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users. Please reassign users first.' },
        { status: 400 }
      );
    }

    // Delete role
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json(
        { error: 'Failed to delete role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/roles/[roleId]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

