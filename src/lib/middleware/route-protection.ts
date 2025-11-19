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

  // Check if user has a profile with role_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role_id, role')
    .eq('id', user.id)
    .single();

  // If user doesn't have a profile or role, redirect to login
  if (profileError || !profile || (!profile.role_id && !profile.role)) {
    console.log(`User ${user.id} doesn't have a profile or role, redirecting to login`);
    return {
      error: true,
      response: NextResponse.redirect(
        new URL('/auth/login?error=no_profile', request.url)
      ),
    };
  }

  // Check permission(s)
  const hasAccess = Array.isArray(requiredPermission)
    ? await hasAnyPermission(supabase, user.id, requiredPermission)
    : await hasPermission(supabase, user.id, requiredPermission);

  if (!hasAccess) {
    // Log the permission check failure for debugging
    console.log(`Permission check failed for ${pathname}, user: ${user.id}, required: ${JSON.stringify(requiredPermission)}`);
    
    return {
      error: true,
      response: NextResponse.redirect(
        new URL('/access-denied', request.url)
      ),
    };
  }

  return { error: false, supabase, user };
}

