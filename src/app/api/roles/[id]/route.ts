import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/permissions';
import { logActivity, ACTIVITY_ACTIONS } from '@/lib/activity-logs';

// GET /api/roles/[id] - Get specific role with permissions (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.response;
    const { supabase } = authResult;

    const { id } = await params;

    // Get role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (roleError) {
      if (roleError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Role not found' }, { status: 404 });
      }
      console.error('Error fetching role:', roleError);
      return NextResponse.json(
        { error: 'Failed to fetch role' },
        { status: 500 }
      );
    }

    // Get all permissions
    const { data: allPermissions, error: allPermError } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('name', { ascending: true });

    if (allPermError) {
      console.error('Error fetching permissions:', allPermError);
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      );
    }

    // Get role permissions for this role
    const { data: rolePerms, error: rolePermError } = await supabase
      .from('role_permissions')
      .select('permission_id, granted, id')
      .eq('role_id', id);

    if (rolePermError) {
      console.error('Error fetching role permissions:', rolePermError);
      return NextResponse.json(
        { error: 'Failed to fetch role permissions' },
        { status: 500 }
      );
    }

    // Merge permissions with grant status
    const permissionsMap = new Map(
      (rolePerms || []).map((rp) => [
        rp.permission_id,
        { granted: rp.granted, id: rp.id },
      ])
    );

    const formattedPermissions = (allPermissions || []).map((perm: any) => {
      const rolePerm = permissionsMap.get(perm.id);
      return {
        ...perm,
        granted: rolePerm?.granted || false,
        role_permission_id: rolePerm?.id || null,
      };
    });

    return NextResponse.json({
      data: {
        ...role,
        permissions: formattedPermissions,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/roles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/roles/[id] - Update role (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.response;
    const { supabase } = authResult;

    const { id } = await params;
    const body = await request.json();
    const { display_name, description } = body;

    // Check if role is system role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('is_system_role, name')
      .eq('id', id)
      .single();

    if (roleError) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // System roles can only have description updated
    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (!role.is_system_role && display_name !== undefined) {
      updateData.display_name = display_name;
    }

    const { data: updatedRole, error } = await supabase
      .from('roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating role:', error);
      return NextResponse.json(
        { error: 'Failed to update role' },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(
      supabase,
      authResult.user.id,
      ACTIVITY_ACTIONS.ROLE_UPDATED,
      'role',
      id,
      {
        role_id: id,
        role_name: role.name,
        changes: updateData,
      },
      request
    );

    return NextResponse.json({ data: updatedRole });
  } catch (error) {
    console.error('Error in PATCH /api/roles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/roles/[id] - Delete role (admin only, cannot delete system roles)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.response;
    const { supabase } = authResult;

    const { id } = await params;

    // Check if role is system role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('is_system_role')
      .eq('id', id)
      .single();

    if (roleError) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    if (role.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 400 }
      );
    }

    // Check if any users are using this role
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role_id', id)
      .limit(1);

    if (usersError) {
      console.error('Error checking users:', usersError);
      return NextResponse.json(
        { error: 'Failed to check role usage' },
        { status: 500 }
      );
    }

    if (users && users.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role that is assigned to users' },
        { status: 400 }
      );
    }

    // Get role details before deletion for logging
    const { data: roleToDelete } = await supabase
      .from('roles')
      .select('name, display_name')
      .eq('id', id)
      .single();

    const { error } = await supabase.from('roles').delete().eq('id', id);

    if (error) {
      console.error('Error deleting role:', error);
      return NextResponse.json(
        { error: 'Failed to delete role' },
        { status: 500 }
      );
    }

    // Log activity
    await logActivity(
      supabase,
      authResult.user.id,
      ACTIVITY_ACTIONS.ROLE_DELETED,
      'role',
      id,
      {
        role_name: roleToDelete?.name,
        role_display_name: roleToDelete?.display_name,
      },
      request
    );

    return NextResponse.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/roles/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

