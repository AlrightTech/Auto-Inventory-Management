import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes
  const protectedRoutes = ['/admin', '/seller', '/transporter'];
  const authRoutes = ['/auth/login', '/auth/register'];
  
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );
  const isAuthRoute = authRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && user) {
    // Get user role from database (check both old role field and new role_id)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id')
      .eq('id', user.id)
      .single();

    // Check new RBAC system first (role_id)
    if (profile?.role_id) {
      try {
        // Fetch role name separately to avoid RLS issues
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', profile.role_id)
          .maybeSingle();
        
        if (!roleError && roleData?.name === 'Super Admin') {
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      } catch (error) {
        console.error('Error fetching role in middleware:', error);
        // Fall through to legacy role check
      }
    }
    
    // Fallback to old role field for backward compatibility
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (profile?.role === 'seller') {
      return NextResponse.redirect(new URL('/seller', request.url));
    } else if (profile?.role === 'transporter') {
      return NextResponse.redirect(new URL('/transporter', request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
