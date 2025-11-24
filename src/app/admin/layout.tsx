import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminLayoutClient } from './AdminLayoutClient';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect('/auth/login');
    }

    // Check if user is admin (check both old role and new RBAC system)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      redirect('/auth/login');
    }

    // Check new RBAC system first (Super Admin)
    let isSuperAdmin = false;
    if (profile.role_id) {
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', profile.role_id)
          .maybeSingle();
        
        if (!roleError && roleData?.name === 'Super Admin') {
          isSuperAdmin = true;
        }
      } catch (error) {
        console.error('Error fetching role in admin layout:', error);
        // Fall through to legacy role check
      }
    }
    
    // Fallback to old role field for backward compatibility
    const isLegacyAdmin = profile?.role === 'admin';
    
    if (!isSuperAdmin && !isLegacyAdmin) {
      console.log('Access denied - User is not admin:', {
        role: profile.role,
        role_id: profile.role_id,
        isSuperAdmin,
        isLegacyAdmin
      });
      redirect('/auth/login');
    }

    return (
      <AdminLayoutClient user={user}>
        {children}
      </AdminLayoutClient>
    );
  } catch (error) {
    console.error('Admin layout error:', error);
    redirect('/auth/login');
  }
}
