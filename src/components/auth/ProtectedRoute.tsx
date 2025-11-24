'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import { Loader2 } from 'lucide-react';
import { PermissionPath } from '@/types/permissions';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionPath;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requireAdmin = false,
  redirectTo = '/admin',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { permissions, isAdmin, loading } = usePermissions();

  useEffect(() => {
    if (loading) return;

    // Check admin requirement
    if (requireAdmin && !isAdmin()) {
      router.push(redirectTo);
      return;
    }

    // Check permission requirement
    if (requiredPermission) {
      const hasAccess = isAdmin() || (permissions && 
        (permissions as any)[requiredPermission.split('.')[0]]?.[requiredPermission.split('.')[1]] === true
      );

      if (!hasAccess) {
        router.push(redirectTo);
        return;
      }
    }
  }, [loading, permissions, isAdmin, requiredPermission, requireAdmin, redirectTo, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  // Check access
  if (requireAdmin && !isAdmin()) {
    return null;
  }

  if (requiredPermission) {
    const hasAccess = isAdmin() || (permissions && 
      (permissions as any)[requiredPermission.split('.')[0]]?.[requiredPermission.split('.')[1]] === true
    );

    if (!hasAccess) {
      return null;
    }
  }

  return <>{children}</>;
}

