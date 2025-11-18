import { RoleManagement } from '@/components/roles/RoleManagement';
import { requireAdmin } from '@/lib/middleware/permissions';
import { redirect } from 'next/navigation';

export default async function RolesPage() {
  // This is a server component, so we'll check permissions in the component
  // For now, we'll rely on the middleware and client-side checks
  return (
    <div className="container mx-auto p-6">
      <RoleManagement />
    </div>
  );
}

