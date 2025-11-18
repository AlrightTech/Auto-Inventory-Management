'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGateProps {
  permission: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * PermissionGate component - Conditionally renders children based on permissions
 * 
 * @example
 * <PermissionGate permission="inventory.view">
 *   <InventoryComponent />
 * </PermissionGate>
 * 
 * @example
 * <PermissionGate permission={["inventory.view", "inventory.edit"]} requireAll>
 *   <EditButton />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } =
    usePermissions();

  if (loading) {
    return null; // Or a loading spinner
  }

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
    : hasPermission(permission);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

