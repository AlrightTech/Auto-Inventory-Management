// Permission checking utilities

import { RolePermissions, PermissionPath } from '@/types/permissions';

/**
 * Check if a permission is granted
 */
export function hasPermission(
  permissions: RolePermissions | null | undefined,
  path: PermissionPath
): boolean {
  if (!permissions) return false;

  const [module, permission] = path.split('.') as [keyof RolePermissions, string];
  const modulePermissions = permissions[module];

  if (!modulePermissions || typeof modulePermissions !== 'object') {
    return false;
  }

  return (modulePermissions as any)[permission] === true;
}

/**
 * Check multiple permissions (all must be true)
 */
export function hasAllPermissions(
  permissions: RolePermissions | null | undefined,
  paths: PermissionPath[]
): boolean {
  return paths.every(path => hasPermission(permissions, path));
}

/**
 * Check multiple permissions (at least one must be true)
 */
export function hasAnyPermission(
  permissions: RolePermissions | null | undefined,
  paths: PermissionPath[]
): boolean {
  return paths.some(path => hasPermission(permissions, path));
}

/**
 * Get default permissions structure (all false)
 */
export function getDefaultPermissions(): RolePermissions {
  return {
    inventory: {
      view: false,
      add: false,
      edit: false,
      upload_photos: false,
      update_location: false,
      condition_notes: false,
      purchase_details: false,
      title_status: false,
    },
    sold: {
      view: false,
      edit: false,
      profit_visibility: false,
      expenses_visibility: false,
      transportation_costs: false,
      arb: false,
      adjust_price: false,
      arb_outcome_history: false,
    },
    arb: {
      access: false,
      create: false,
      update: false,
      enter_outcomes: false,
      enter_price_adjustment: false,
      transportation_details: false,
      upload_documents: false,
    },
    title: {
      status: false,
      upload_documents: false,
      missing_titles_dashboard: false,
      days_missing_tracker: false,
    },
    transportation: {
      location_tracking: false,
      transport_assignment: false,
      transport_notes: false,
      transport_cost_entry: false,
      view_history: false,
    },
    accounting: {
      profit_per_car: false,
      weekly_profit_summary: false,
      monthly_profit_summary: false,
      total_pl_summary: false,
      accounting_page: false,
      expenses_section: false,
      price_adjustment_log: false,
      export_reports: false,
    },
    reports: {
      profit_per_car: false,
      weekly_profit_loss: false,
      monthly_profit_loss: false,
      arb_activity: false,
      arb_transportation_cost: false,
      price_adjustment_summary: false,
      inventory_summary: false,
      sold_cars_weekly_count: false,
      missing_titles: false,
      average_transportation_cost: false,
      average_arb_adjustment_percentage: false,
    },
    user_management: {
      view_users: false,
      create_roles: false,
      edit_roles: false,
      assign_roles: false,
      activity_logs: false,
      permission_editing: false,
    },
  };
}

/**
 * Check if user is admin (legacy role or Admin role)
 */
export function isAdmin(profile: { role?: string; role_data?: { name: string } | null } | null): boolean {
  if (!profile) return false;
  return profile.role === 'admin' || profile.role_data?.name === 'Admin';
}

