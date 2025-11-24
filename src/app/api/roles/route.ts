import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Role, RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// GET all roles
export async function GET(request: NextRequest) {
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

    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }

    return NextResponse.json({ data: roles });
  } catch (error) {
    console.error('Error in GET /api/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new role
export async function POST(request: NextRequest) {
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
    const { name, description, permissions } = body;

    if (!name || !permissions) {
      return NextResponse.json({ error: 'Name and permissions are required' }, { status: 400 });
    }

    // Validate permissions structure
    const defaultPerms = getDefaultPermissions();
    const validatedPermissions: RolePermissions = {
      inventory: { ...defaultPerms.inventory, ...(permissions.inventory || {}) },
      sold: { ...defaultPerms.sold, ...(permissions.sold || {}) },
      arb: { ...defaultPerms.arb, ...(permissions.arb || {}) },
      title: { ...defaultPerms.title, ...(permissions.title || {}) },
      transportation: { ...defaultPerms.transportation, ...(permissions.transportation || {}) },
      accounting: { ...defaultPerms.accounting, ...(permissions.accounting || {}) },
      reports: { ...defaultPerms.reports, ...(permissions.reports || {}) },
      user_management: { ...defaultPerms.user_management, ...(permissions.user_management || {}) },
    };

    const { data: role, error } = await supabase
      .from('roles')
      .insert({
        name,
        description: description || null,
        is_system_role: false,
        permissions: validatedPermissions,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating role:', error);
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Role name already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }

    return NextResponse.json({ data: role }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

