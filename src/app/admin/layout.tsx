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
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    // Check new RBAC system first (Super Admin)
    const isSuperAdmin = profile?.role_id && (profile.role_data as any)?.name === 'Super Admin';
    // Fallback to old role field for backward compatibility
    const isLegacyAdmin = profile?.role === 'admin';
    
    if (!isSuperAdmin && !isLegacyAdmin) {
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
