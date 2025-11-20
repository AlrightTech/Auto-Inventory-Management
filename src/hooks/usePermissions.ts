'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setPermissions([]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/permissions', {
        cache: 'no-store', // Always fetch fresh permissions
      });
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }

      const { data } = await response.json();
      setPermissions(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPermissions();

    // Listen for permission refresh events
    const handleRefresh = () => {
      fetchPermissions();
    };

    window.addEventListener('permissions-refresh', handleRefresh);

    // Poll for permission changes every 30 seconds (optional, for real-time updates)
    const interval = setInterval(() => {
      fetchPermissions();
    }, 30000);

    return () => {
      window.removeEventListener('permissions-refresh', handleRefresh);
      clearInterval(interval);
    };
  }, [fetchPermissions]);

  // Expose refresh function
  const refresh = useCallback(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  const hasPermission = (permissionKey: string): boolean => {
    return permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys: string[]): boolean => {
    return permissionKeys.some((key) => permissions.includes(key));
  };

  const hasAllPermissions = (permissionKeys: string[]): boolean => {
    return permissionKeys.every((key) => permissions.includes(key));
  };

  return {
    permissions,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    refresh, // Expose refresh function
  };
}

/**
 * Trigger permission refresh across all components using usePermissions
 * Call this after role/permission changes
 */
export function triggerPermissionRefresh() {
  window.dispatchEvent(new Event('permissions-refresh'));
}

