// Server-side route protection utilities

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PermissionPath } from '@/types/permissions';
import { hasPermission, isAdmin } from './permissions';

/**
 * Check if user has required permission (server-side)
 */
export async function checkPermission(permission: PermissionPath): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { data: profile } = await supabase
      .from('profiles')
      .select(`
        role,
        role_id,
        role_data:roles(*)
      `)
      .eq('id', user.id)
      .single();

    if (!profile) return false;

    // Admin always has access
    if (isAdmin(profile)) return true;

    // Check role permissions
    if (profile.role_data) {
      return hasPermission((profile.role_data as any).permissions, permission);
    }

    return false;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Require permission or redirect (server-side)
 */
export async function requirePermission(
  permission: PermissionPath,
  redirectTo: string = '/admin'
): Promise<void> {
  const hasAccess = await checkPermission(permission);
  if (!hasAccess) {
    redirect(redirectTo);
  }
}

/**
 * Require admin or redirect (server-side)
 */
export async function requireAdmin(redirectTo: string = '/admin'): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      redirect('/auth/login');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      redirect('/auth/login');
    }

    // Check legacy admin role
    if (profile.role === 'admin') {
      return; // Allow access
    }

    // Check RBAC Admin role
    if (profile.role_id) {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', profile.role_id)
        .maybeSingle();
      
      if (!roleError && roleData?.name === 'Admin') {
        return; // Allow access
      }
    }

    // Not an admin, redirect
    redirect(redirectTo);
  } catch (error) {
    console.error('Error checking admin:', error);
    redirect('/auth/login');
  }
}

