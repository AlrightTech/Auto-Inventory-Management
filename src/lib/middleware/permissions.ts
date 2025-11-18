// Permission middleware for API routes
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hasPermission } from '@/lib/permissions';

/**
 * Middleware to check if user has required permission
 * Usage: export async function GET(request: NextRequest) {
 *   const authResult = await requirePermission(request, 'inventory.view');
 *   if (authResult.error) return authResult.response;
 *   const { supabase, user } = authResult;
 *   // ... rest of handler
 * }
 */
export async function requirePermission(
  request: NextRequest,
  permissionKey: string
): Promise<
  | { error: false; supabase: any; user: any }
  | { error: true; response: NextResponse }
> {
  const supabase = await createClient();

  // Get current user
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

  // Check permission
  const hasAccess = await hasPermission(supabase, user.id, permissionKey);

  if (!hasAccess) {
    return {
      error: true,
      response: NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      ),
    };
  }

  return { error: false, supabase, user };
}

/**
 * Middleware to check if user has any of the provided permissions
 */
export async function requireAnyPermission(
  request: NextRequest,
  permissionKeys: string[]
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

  // Check if user has any of the permissions
  for (const key of permissionKeys) {
    if (await hasPermission(supabase, user.id, key)) {
      return { error: false, supabase, user };
    }
  }

  return {
    error: true,
    response: NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    ),
  };
}

/**
 * Middleware to check if user is admin
 */
export async function requireAdmin(
  request: NextRequest
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

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    return {
      error: true,
      response: NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      ),
    };
  }

  return { error: false, supabase, user };
}

