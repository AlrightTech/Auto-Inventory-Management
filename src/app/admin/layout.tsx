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

    // Check if user is admin (legacy or RBAC)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, role_id, role_data:roles(name)')
      .eq('id', user.id)
      .single();

    if (!profile) {
      redirect('/auth/login');
    }

    // Check admin status - handle both legacy and RBAC
    const isLegacyAdmin = profile.role === 'admin';
    const isRbacAdmin = profile.role_data?.name === 'Admin';
    const isAdmin = isLegacyAdmin || isRbacAdmin;

    if (!isAdmin) {
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
