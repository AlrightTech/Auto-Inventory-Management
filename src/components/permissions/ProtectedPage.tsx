'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';

interface ProtectedPageProps {
  permission: string | string[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedPage component - Wraps pages to check permissions
 * Redirects to access-denied if user doesn't have permission
 */
export function ProtectedPage({
  permission,
  requireAll = false,
  children,
  fallback,
}: ProtectedPageProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg" style={{ color: 'var(--text)' }}>
          Loading...
        </div>
      </div>
    );
  }

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    useEffect(() => {
      router.push('/access-denied');
    }, [router]);
    
    return fallback || (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg" style={{ color: 'var(--text)' }}>
          Redirecting...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

