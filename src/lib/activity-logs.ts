/**
 * Activity Logging Helper
 * Logs system activities for audit trail
 */

import { createClient } from '@/lib/supabase/server';

export interface ActivityLogDetails {
  [key: string]: any;
}

/**
 * Log an activity
 */
export async function logActivity(
  supabase: any,
  userId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: ActivityLogDetails,
  request?: Request
): Promise<void> {
  try {
    // Get IP address and user agent from request if available
    let ipAddress: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      // Try to get IP from various headers
      ipAddress =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        null;
      userAgent = request.headers.get('user-agent') || null;
    }

    // Call the database function to log activity
    const { error } = await supabase.rpc('log_activity', {
      p_user_id: userId,
      p_action: action,
      p_entity_type: entityType,
      p_entity_id: entityId || null,
      p_details: details ? JSON.stringify(details) : null,
      p_ip_address: ipAddress,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error('Error logging activity:', error);
      // Don't throw - logging failures shouldn't break the main operation
    }
  } catch (error) {
    console.error('Error in logActivity:', error);
    // Don't throw - logging failures shouldn't break the main operation
  }
}

/**
 * Activity action constants
 */
export const ACTIVITY_ACTIONS = {
  // Role actions
  ROLE_CREATED: 'role.created',
  ROLE_UPDATED: 'role.updated',
  ROLE_DELETED: 'role.deleted',
  ROLE_PERMISSIONS_UPDATED: 'role.permissions.updated',
  
  // Permission actions
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_REVOKED: 'permission.revoked',
  
  // User actions
  USER_ROLE_ASSIGNED: 'user.role.assigned',
  USER_ROLE_REMOVED: 'user.role.removed',
  
  // System actions
  SYSTEM_SETTINGS_UPDATED: 'system.settings.updated',
} as const;

