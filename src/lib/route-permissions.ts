// Route to permission mapping for route protection
import { PERMISSIONS } from './permissions';

export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  // Dashboard
  '/admin': PERMISSIONS.DASHBOARD.VIEW,
  
  // Tasks
  '/admin/tasks': PERMISSIONS.TASKS.VIEW,
  
  // Inventory
  '/admin/inventory': PERMISSIONS.INVENTORY.VIEW,
  '/admin/inventory/buyer-withdrew': PERMISSIONS.INVENTORY.VIEW,
  
  // Missing Titles
  '/admin/missing-titles': PERMISSIONS.TITLE.MISSING_DASHBOARD,
  
  // ARB
  '/admin/arb': PERMISSIONS.ARB.VIEW,
  
  // Events
  '/admin/events': PERMISSIONS.EVENTS.VIEW,
  
  // Chat
  '/admin/chat': PERMISSIONS.CHAT.VIEW,
  
  // Sold
  '/admin/sold': PERMISSIONS.SOLD.VIEW,
  
  // Accounting (Office Staff should NOT have access)
  '/admin/accounting': PERMISSIONS.ACCOUNTING.VIEW,
  '/admin/accounting/purchases': PERMISSIONS.ACCOUNTING.VIEW,
  '/admin/accounting/sold': PERMISSIONS.ACCOUNTING.VIEW,
  '/admin/accounting/reports': PERMISSIONS.ACCOUNTING.VIEW,
  
  // Missing Titles (Office Staff CAN access)
  '/admin/missing-titles': PERMISSIONS.TITLE.MISSING_DASHBOARD,
  
  // VIN Decode
  '/admin/vin-decode': PERMISSIONS.VIN_DECODE.VIEW,
  
  // User Management
  '/admin/users': PERMISSIONS.SYSTEM.USERS_VIEW,
  
  // Settings
  '/admin/settings': PERMISSIONS.SETTINGS.VIEW,
  '/admin/settings/roles': PERMISSIONS.ROLES.VIEW,
  
  // Car Locations (for transporters)
  '/admin/inventory/[vehicleId]': PERMISSIONS.INVENTORY.LOCATION_UPDATE,
  '/admin/settings/dropdowns': PERMISSIONS.SETTINGS.DROPDOWNS_MANAGE,
  '/admin/settings/staff': PERMISSIONS.SETTINGS.STAFF_MANAGE,
  '/admin/settings/transporter': PERMISSIONS.SETTINGS.TRANSPORTER_MANAGE,
};

/**
 * Get required permission for a route
 */
export function getRoutePermission(pathname: string): string | string[] | null {
  // Exact match first
  if (ROUTE_PERMISSIONS[pathname]) {
    return ROUTE_PERMISSIONS[pathname];
  }
  
  // Check for prefix matches (for nested routes)
  for (const [route, permission] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname.startsWith(route)) {
      return permission;
    }
  }
  
  return null;
}

/**
 * Check if a route requires permission
 */
export function requiresPermission(pathname: string): boolean {
  return getRoutePermission(pathname) !== null;
}

