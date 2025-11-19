// Route protection middleware
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getRoutePermission } from '@/lib/route-permissions';
import { hasPermission, hasAnyPermission } from '@/lib/permissions';

/**
 * Check if user has permission to access a route
 */
export async function checkRoutePermission(
  request: NextRequest,
  pathname: string
): Promise<
  | { error: false; supabase: any; user: any }
  | { error: true; response: NextResponse }
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return {
      error: true,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // Get required permission for this route
  const requiredPermission = getRoutePermission(pathname);

  // If no permission required, allow access
  if (!requiredPermission) {
    return { error: false, supabase, user };
  }

  // Check if user has a profile with role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role_id, role')
    .eq('id', user.id)
    .single();

  // If user doesn't have a profile, redirect to login
  if (profileError || !profile) {
    console.log(`User ${user.id} doesn't have a profile, redirecting to login`);
    return {
      error: true,
      response: NextResponse.redirect(
        new URL('/auth/login?error=no_profile', request.url)
      ),
    };
  }

  // ADMIN BYPASS: Admin users have access to everything
  if (profile.role === 'admin') {
    return { error: false, supabase, user };
  }

  // For non-admin users, check if they have role_id (for RBAC system)
  // If they have legacy role but no role_id, still allow (backward compatibility)
  if (!profile.role_id && profile.role) {
    // Legacy role exists, allow access (backward compatibility)
    // But still check permissions if RBAC is set up
    const hasAccess = Array.isArray(requiredPermission)
      ? await hasAnyPermission(supabase, user.id, requiredPermission)
      : await hasPermission(supabase, user.id, requiredPermission);
    
    if (hasAccess) {
      return { error: false, supabase, user };
    }
    // If permission check fails, continue to access denied
  } else if (!profile.role_id && !profile.role) {
    // No role at all, redirect to login
    console.log(`User ${user.id} doesn't have a role, redirecting to login`);
    return {
      error: true,
      response: NextResponse.redirect(
        new URL('/auth/login?error=no_role', request.url)
      ),
    };
  }

  // Check permission(s) for users with role_id (RBAC system)
  const hasAccess = Array.isArray(requiredPermission)
    ? await hasAnyPermission(supabase, user.id, requiredPermission)
    : await hasPermission(supabase, user.id, requiredPermission);

  if (!hasAccess) {
    // Log the permission check failure for debugging
    console.log(`Permission check failed for ${pathname}, user: ${user.id}, role: ${profile.role}, required: ${JSON.stringify(requiredPermission)}`);
    
    return {
      error: true,
      response: NextResponse.redirect(
        new URL('/access-denied', request.url)
      ),
    };
  }

  return { error: false, supabase, user };
}

