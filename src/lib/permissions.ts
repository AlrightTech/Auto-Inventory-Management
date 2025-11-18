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
  },
  ARB: {
    VIEW: 'arb.view',
    MANAGE: 'arb.manage',
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
    MANAGE: 'sold.manage',
  },
  ACCOUNTING: {
    VIEW: 'accounting.view',
    PURCHASES_VIEW: 'accounting.purchases.view',
    PURCHASES_MANAGE: 'accounting.purchases.manage',
    SOLD_VIEW: 'accounting.sold.view',
    SOLD_MANAGE: 'accounting.sold.manage',
    REPORTS_VIEW: 'accounting.reports.view',
    REPORTS_EXPORT: 'accounting.reports.export',
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

