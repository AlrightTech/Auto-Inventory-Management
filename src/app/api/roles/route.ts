import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Role, RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Set max duration to 10 seconds

// GET all roles
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const supabase = await createClient();
    
    // Check if user is admin with timeout protection
    const authPromise = supabase.auth.getUser();
    const { data: { user }, error: authError } = await Promise.race([
      authPromise,
      new Promise<{ data: { user: null }, error: { message: string } }>((resolve) => 
        setTimeout(() => resolve({ data: { user: null }, error: { message: 'Auth timeout' } }), 3000)
      )
    ]) as any;

    if (authError || !user) {
      console.error('Auth error or no user:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Quick admin check - use role field first (faster)
    const profilePromise = supabase
      .from('profiles')
      .select('role, role_id')
      .eq('id', user.id)
      .single()
      .limit(1);

    const profileResult = await Promise.race([
      profilePromise,
      new Promise<{ data: null, error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: { message: 'Profile query timeout' } }), 3000)
      )
    ]) as any;

    if (profileResult.error) {
      console.error('Profile fetch error:', profileResult.error);
      return NextResponse.json({ error: 'Failed to verify permissions' }, { status: 500 });
    }

    const profile = profileResult.data;
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Check admin access
    const isAdmin = profile?.role === 'admin';
    if (!isAdmin && profile?.role_id === null) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch roles with timeout protection
    try {
      const rolesQuery = supabase
        .from('roles')
        .select('*')
        .order('name', { ascending: true });

      const timeoutPromise = new Promise<{ data: null, error: { code: string, message: string } }>((resolve) =>
        setTimeout(() => resolve({ 
          data: null, 
          error: { code: 'TIMEOUT', message: 'Query timeout after 4 seconds' } 
        }), 4000)
      );

      const rolesResult = await Promise.race([rolesQuery, timeoutPromise]) as any;
      const { data: roles, error: rolesError } = rolesResult;

      if (rolesError) {
        // Check if table doesn't exist
        if (rolesError.code === '42P01' || 
            rolesError.code === 'TIMEOUT' ||
            rolesError.message?.includes('does not exist') ||
            rolesError.message?.includes('relation') ||
            rolesError.message?.includes('permission denied')) {
          console.error('Roles table issue:', rolesError);
          
          // Return empty array with 200 status so UI doesn't break
          return NextResponse.json({ 
            data: [],
            error: rolesError.code === 'TIMEOUT' 
              ? 'Request timed out. Please check database connection.'
              : 'Roles table not found. Please run database migration: supabase/migrations/20241221_create_rbac_system.sql'
          }, { status: 200 });
        }
        
        console.error('Error fetching roles:', rolesError);
        return NextResponse.json({ 
          error: rolesError.message || 'Failed to fetch roles',
          data: [] 
        }, { status: 500 });
      }

      const rolesData = roles || [];
      const duration = Date.now() - startTime;
      
      if (duration > 2000) {
        console.warn(`Roles query took ${duration}ms`);
      }

      return NextResponse.json({ data: rolesData }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      });
    } catch (queryError: any) {
      console.error('Query execution error:', queryError);
      return NextResponse.json({ 
        error: queryError.message || 'Database query failed',
        data: [] 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error in GET /api/roles:', error);
    const errorMessage = error?.message || 'Internal server error';
    return NextResponse.json({ 
      error: errorMessage,
      data: [] 
    }, { status: 500 });
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

