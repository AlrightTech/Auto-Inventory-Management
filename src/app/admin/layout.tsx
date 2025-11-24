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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
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
