import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// GET single role
export async function GET(
  request: NextRequest,
  { params }: { params: { roleId: string } }
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

    const { data: role, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', params.roleId)
      .single();

    if (error) {
      console.error('Error fetching role:', error);
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    return NextResponse.json({ data: role });
  } catch (error) {
    console.error('Error in GET /api/roles/[roleId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH update role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { roleId: string } }
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

    // Check if role is system role (prevent deletion of system roles)
    const { data: existingRole } = await supabase
      .from('roles')
      .select('is_system_role')
      .eq('id', params.roleId)
      .single();

    if (existingRole?.is_system_role) {
      return NextResponse.json({ error: 'Cannot modify system roles' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (permissions) {
      // Validate permissions structure
      const defaultPerms = getDefaultPermissions();
      updateData.permissions = {
        inventory: { ...defaultPerms.inventory, ...(permissions.inventory || {}) },
        sold: { ...defaultPerms.sold, ...(permissions.sold || {}) },
        arb: { ...defaultPerms.arb, ...(permissions.arb || {}) },
        title: { ...defaultPerms.title, ...(permissions.title || {}) },
        transportation: { ...defaultPerms.transportation, ...(permissions.transportation || {}) },
        accounting: { ...defaultPerms.accounting, ...(permissions.accounting || {}) },
        reports: { ...defaultPerms.reports, ...(permissions.reports || {}) },
        user_management: { ...defaultPerms.user_management, ...(permissions.user_management || {}) },
      };
    }

    const { data: role, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', params.roleId)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
    }

    return NextResponse.json({ data: role });
  } catch (error) {
    console.error('Error in PATCH /api/roles/[roleId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { roleId: string } }
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

    // Check if role is system role
    const { data: existingRole } = await supabase
      .from('roles')
      .select('is_system_role')
      .eq('id', params.roleId)
      .single();

    if (existingRole?.is_system_role) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 403 });
    }

    // Check if any users are using this role
    const { data: usersWithRole } = await supabase
      .from('profiles')
      .select('id')
      .eq('role_id', params.roleId)
      .limit(1);

    if (usersWithRole && usersWithRole.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete role. Users are assigned to this role.' 
      }, { status: 409 });
    }

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', params.roleId);

    if (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/roles/[roleId]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

