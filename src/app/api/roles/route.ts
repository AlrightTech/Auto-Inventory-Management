import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin - with better error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile in roles API (GET):', profileError);
      return NextResponse.json({ error: 'Failed to verify user permissions' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check admin status - handle both legacy and RBAC
    const isLegacyAdmin = profile.role === 'admin';
    const isRbacAdmin = profile.role_data?.name === 'Admin';
    const isAdmin = isLegacyAdmin || isRbacAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required',
        details: 'Only administrators can manage roles'
      }, { status: 403 });
    }

    // Get all roles
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('is_system_role', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: roles || [] });
  } catch (error: any) {
    console.error('Error in GET /api/roles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin - with better error handling
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile in roles API (POST):', profileError);
      return NextResponse.json({ error: 'Failed to verify user permissions' }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check admin status - handle both legacy and RBAC
    const isLegacyAdmin = profile.role === 'admin';
    const isRbacAdmin = profile.role_data?.name === 'Admin';
    const isAdmin = isLegacyAdmin || isRbacAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required',
        details: 'Only administrators can create roles'
      }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, permissions } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 }
      );
    }

    // Validate permissions structure
    const defaultPermissions = getDefaultPermissions();
    const rolePermissions: RolePermissions = permissions || defaultPermissions;

    // Create role
    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name: name.trim(),
        description: description || null,
        is_system_role: false,
        permissions: rolePermissions,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'Role with this name already exists' },
          { status: 400 }
        );
      }
      console.error('Error creating role:', error);
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: role }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/roles:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

