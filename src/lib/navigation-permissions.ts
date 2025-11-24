// Navigation to permission mapping for RBAC

import { RolePermissions } from '@/types/permissions';
import { hasPermission } from './permissions';

export interface NavigationItem {
  name: string;
  href?: string;
  icon: string | React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string; permission?: string }[];
  permission?: string; // Permission path to check
}

/**
 * Check if a navigation item should be visible based on permissions
 */
export function shouldShowNavigationItem(
  item: NavigationItem,
  permissions: RolePermissions | null | undefined
): boolean {
  // If no permission required, always show
  if (!item.permission) {
    // Check children permissions
    if (item.children) {
      return item.children.some(child => 
        !child.permission || hasPermission(permissions, child.permission as any)
      );
    }
    return true;
  }

  // Check main permission
  return hasPermission(permissions, item.permission as any);
}

/**
 * Filter navigation items based on permissions
 */
export function filterNavigationByPermissions(
  navigation: NavigationItem[],
  permissions: RolePermissions | null | undefined
): NavigationItem[] {
  return navigation
    .filter(item => shouldShowNavigationItem(item, permissions))
    .map(item => {
      // Filter children if they exist
      if (item.children) {
        const filteredChildren = item.children.filter(child =>
          !child.permission || hasPermission(permissions, child.permission as any)
        );
        return { ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined };
      }
      return item;
    })
    .filter(item => {
      // Remove items with no children if they had children before
      if (item.children === undefined && navigation.find(n => n.name === item.name)?.children) {
        return false;
      }
      return true;
    });
}

