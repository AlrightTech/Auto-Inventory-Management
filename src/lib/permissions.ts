// Permission helper functions for backend and frontend

export interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system_role: boolean;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted: boolean;
  permission?: Permission;
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  supabase: any,
  userId: string,
  permissionKey: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('user_has_permission', {
      user_id: userId,
      permission_key: permissionKey,
    });

    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking permission:', error);
    return false;
  }
}

/**
 * Get all permissions for a user
 */
export async function getUserPermissions(
  supabase: any,
  userId: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_id: userId,
    });

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    return data
      .filter((p: { granted: boolean }) => p.granted)
      .map((p: { permission_key: string }) => p.permission_key);
  } catch (error) {
    console.error('Exception fetching user permissions:', error);
    return [];
  }
}

/**
 * Check if user has any of the provided permissions
 */
export async function hasAnyPermission(
  supabase: any,
  userId: string,
  permissionKeys: string[]
): Promise<boolean> {
  for (const key of permissionKeys) {
    if (await hasPermission(supabase, userId, key)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all of the provided permissions
 */
export async function hasAllPermissions(
  supabase: any,
  userId: string,
  permissionKeys: string[]
): Promise<boolean> {
  for (const key of permissionKeys) {
    if (!(await hasPermission(supabase, userId, key))) {
      return false;
    }
  }
  return true;
}

/**
 * Permission keys organized by module for easy reference
 */
export const PERMISSIONS = {
  DASHBOARD: {
    VIEW: 'dashboard.view',
  },
  TASKS: {
    VIEW: 'tasks.view',
    CREATE: 'tasks.create',
    EDIT: 'tasks.edit',
    DELETE: 'tasks.delete',
    ASSIGN: 'tasks.assign',
  },
  INVENTORY: {
    VIEW: 'inventory.view',
    CREATE: 'inventory.create',
    EDIT: 'inventory.edit',
    DELETE: 'inventory.delete',
    VIEW_ALL: 'inventory.view_all',
    PHOTOS_MANAGE: 'inventory.photos.manage',
    LOCATION_UPDATE: 'inventory.location.update',
    NOTES_MANAGE: 'inventory.notes.manage',
    PURCHASE_MANAGE: 'inventory.purchase.manage',
    TITLE_MANAGE: 'inventory.title.manage',
  },
  ARB: {
    VIEW: 'arb.view',
    CREATE: 'arb.create',
    OUTCOME_ENTER: 'arb.outcome.enter',
    PRICE_ADJUST: 'arb.price.adjust',
    TRANSPORT_MANAGE: 'arb.transport.manage',
    DOCUMENTS_UPLOAD: 'arb.documents.upload',
  },
  EVENTS: {
    VIEW: 'events.view',
    CREATE: 'events.create',
    EDIT: 'events.edit',
    DELETE: 'events.delete',
  },
  CHAT: {
    VIEW: 'chat.view',
    SEND: 'chat.send',
  },
  SOLD: {
    VIEW: 'sold.view',
    EDIT: 'sold.edit',
    PROFIT_VIEW: 'sold.profit.view',
    EXPENSES_VIEW: 'sold.expenses.view',
    TRANSPORT_COST: 'sold.transport.cost',
    ARB_VIEW: 'sold.arb.view',
    ARB_ADJUST_PRICE: 'sold.arb.adjust_price',
    ARB_HISTORY: 'sold.arb.history',
  },
  ACCOUNTING: {
    VIEW: 'accounting.view',
    PROFIT_CAR: 'accounting.profit.car',
    PROFIT_WEEKLY: 'accounting.profit.weekly',
    PROFIT_MONTHLY: 'accounting.profit.monthly',
    PNL_SUMMARY: 'accounting.pnl.summary',
    EXPENSES_VIEW: 'accounting.expenses.view',
    PRICE_ADJUSTMENT_LOG: 'accounting.price.adjustment.log',
    REPORTS_EXPORT: 'accounting.reports.export',
    // Legacy permissions (kept for backward compatibility)
    PURCHASES_VIEW: 'accounting.purchases.view',
    PURCHASES_MANAGE: 'accounting.purchases.manage',
    SOLD_VIEW: 'accounting.sold.view',
    SOLD_MANAGE: 'accounting.sold.manage',
    REPORTS_VIEW: 'accounting.reports.view',
  },
  TITLE: {
    STATUS_VIEW: 'title.status.view',
    DOCUMENTS_UPLOAD: 'title.documents.upload',
    MISSING_DASHBOARD: 'title.missing.dashboard',
    MISSING_TRACKER: 'title.missing.tracker',
  },
  TRANSPORTATION: {
    LOCATION_TRACK: 'transport.location.track',
    ASSIGN: 'transport.assign',
    NOTES: 'transport.notes',
    COST_ENTRY: 'transport.cost.entry',
    HISTORY_VIEW: 'transport.history.view',
  },
  REPORTS: {
    PROFIT_CAR: 'reports.profit.car',
    PROFIT_WEEKLY: 'reports.profit.weekly',
    PROFIT_MONTHLY: 'reports.profit.monthly',
    ARB_ACTIVITY: 'reports.arb.activity',
    ARB_TRANSPORT_COST: 'reports.arb.transport.cost',
    PRICE_ADJUSTMENT: 'reports.price.adjustment',
    INVENTORY_SUMMARY: 'reports.inventory.summary',
    SOLD_WEEKLY: 'reports.sold.weekly',
    MISSING_TITLES: 'reports.missing.titles',
    TRANSPORT_AVG_COST: 'reports.transport.avg_cost',
    ARB_ADJUSTMENT_PERCENT: 'reports.arb.adjustment.percent',
  },
  SYSTEM: {
    USERS_VIEW: 'system.users.view',
    ROLES_CREATE: 'system.roles.create',
    ROLES_EDIT: 'system.roles.edit',
    ROLES_ASSIGN: 'system.roles.assign',
    ACTIVITY_LOGS: 'system.activity.logs',
    PERMISSIONS_EDIT: 'system.permissions.edit',
  },
  VIN_DECODE: {
    VIEW: 'vin_decode.view',
    DECODE: 'vin_decode.decode',
  },
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    EDIT: 'users.edit',
    DELETE: 'users.delete',
  },
  SETTINGS: {
    VIEW: 'settings.view',
    MANAGE: 'settings.manage',
    DROPDOWNS_MANAGE: 'settings.dropdowns.manage',
    STAFF_MANAGE: 'settings.staff.manage',
    TRANSPORTER_MANAGE: 'settings.transporter.manage',
  },
  ROLES: {
    VIEW: 'roles.view',
    MANAGE: 'roles.manage',
    PERMISSIONS_MANAGE: 'roles.permissions.manage',
  },
  ASSESSMENTS: {
    VIEW: 'assessments.view',
    CREATE: 'assessments.create',
    EDIT: 'assessments.edit',
    DELETE: 'assessments.delete',
  },
  NOTIFICATIONS: {
    VIEW: 'notifications.view',
    MANAGE: 'notifications.manage',
  },
} as const;

