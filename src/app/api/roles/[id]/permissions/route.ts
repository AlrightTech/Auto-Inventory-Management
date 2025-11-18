import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/middleware/permissions';

// PUT /api/roles/[id]/permissions - Update role permissions (admin only)
// Body: { permissions: [{ permission_id: string, granted: boolean }] }
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.error) return authResult.response;
    const { supabase } = authResult;

    const { id: roleId } = await params;
    const body = await request.json();
    const { permissions } = body;

    if (!Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Permissions must be an array' },
        { status: 400 }
      );
    }

    // Verify role exists
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('id', roleId)
      .single();

    if (roleError || !role) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 });
    }

    // Delete existing role permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', roleId);

    if (deleteError) {
      console.error('Error deleting existing permissions:', deleteError);
      return NextResponse.json(
        { error: 'Failed to update permissions' },
        { status: 500 }
      );
    }

    // Insert new role permissions (only granted ones)
    const permissionsToInsert = permissions
      .filter((p: any) => p.granted === true)
      .map((p: any) => ({
        role_id: roleId,
        permission_id: p.permission_id,
        granted: true,
      }));

    if (permissionsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToInsert);

      if (insertError) {
        console.error('Error inserting permissions:', insertError);
        return NextResponse.json(
          { error: 'Failed to update permissions' },
          { status: 500 }
        );
      }
    }

    // Fetch updated permissions
    const { data: allPerms, error: fetchError } = await supabase
      .from('permissions')
      .select('*')
      .order('module', { ascending: true })
      .order('name', { ascending: true });

    if (fetchError) {
      console.error('Error fetching updated permissions:', fetchError);
    }

    const { data: rolePerms } = await supabase
      .from('role_permissions')
      .select('permission_id, granted, id')
      .eq('role_id', roleId);

    const permissionsMap = new Map(
      (rolePerms || []).map((rp) => [
        rp.permission_id,
        { granted: rp.granted, id: rp.id },
      ])
    );

    const formattedPermissions = (allPerms || []).map((perm: any) => {
      const rolePerm = permissionsMap.get(perm.id);
      return {
        ...perm,
        granted: rolePerm?.granted || false,
        role_permission_id: rolePerm?.id || null,
      };
    });

    return NextResponse.json({
      data: {
        role_id: roleId,
        permissions: formattedPermissions,
      },
      message: 'Permissions updated successfully',
    });
  } catch (error) {
    console.error('Error in PUT /api/roles/[id]/permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

