import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Wait a moment for the profile to be created by trigger
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get user role from profiles table (include role_id for RBAC system)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, role_id')
          .eq('id', user.id)
          .single();

        // If profile doesn't exist, create it
        if (profileError && profileError.code === 'PGRST116') {
          console.log('Profile not found in callback, creating...');
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              role: 'transporter', // Default role
              username: user.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString()
            });

          if (createError) {
            console.error('Error creating profile in callback:', createError);
            return NextResponse.redirect(`${origin}/auth/login?error=profile_creation_failed`);
          }

          // Redirect to transporter dashboard
          return NextResponse.redirect(`${origin}/transporter`);
        }

        // Check new RBAC system first (role_id)
        if (profile?.role_id) {
          const { data: roleData } = await supabase
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();
          
          if (roleData?.name === 'Super Admin') {
            return NextResponse.redirect(`${origin}/admin`);
          }
        }
        
        // Fallback to old role field for backward compatibility
        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}/admin`);
        } else if (profile?.role === 'seller') {
          return NextResponse.redirect(`${origin}/seller`);
        } else if (profile?.role === 'transporter') {
          return NextResponse.redirect(`${origin}/transporter`);
        }
        
        // If no profile found, redirect to login with error
        return NextResponse.redirect(`${origin}/auth/login?error=profile_not_found`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
