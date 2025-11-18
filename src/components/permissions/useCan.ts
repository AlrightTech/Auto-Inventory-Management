'use client';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook for checking permissions in components
 * 
 * @example
 * const canViewInventory = useCan('inventory.view');
 * const canEdit = useCan(['inventory.edit', 'inventory.create'], { requireAll: false });
 */
export function useCan(
  permission: string | string[],
  options?: { requireAll?: boolean }
) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  const requireAll = options?.requireAll ?? false;

  if (Array.isArray(permission)) {
    return requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  }

  return hasPermission(permission);
}

