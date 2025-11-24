'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RolePermissions, ProfileWithRole } from '@/types/permissions';
import { hasPermission, isAdmin } from '@/lib/permissions';

interface UsePermissionsReturn {
  permissions: RolePermissions | null;
  profile: ProfileWithRole | null;
  loading: boolean;
  hasPermission: (path: string) => boolean;
  isAdmin: () => boolean;
  refresh: () => Promise<void>;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [profile, setProfile] = useState<ProfileWithRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadPermissions = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPermissions(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      // Get profile with role data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          role_data:roles(*)
        `)
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        setPermissions(null);
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileData as ProfileWithRole);

      // If user has role_data, use its permissions
      // Otherwise, check legacy role and load default permissions
      if (profileData.role_data) {
        setPermissions((profileData.role_data as any).permissions);
      } else if (profileData.role === 'admin') {
        // Load Super Admin role permissions (Admin role was removed)
        const { data: superAdminRole } = await supabase
          .from('roles')
          .select('permissions')
          .eq('name', 'Super Admin')
          .single();
        
        if (superAdminRole) {
          setPermissions(superAdminRole.permissions as RolePermissions);
        }
      } else {
        // No permissions for other legacy roles
        setPermissions(null);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadPermissions();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkPermission = (path: string): boolean => {
    return hasPermission(permissions, path as any);
  };

  const checkIsAdmin = (): boolean => {
    return isAdmin(profile);
  };

  return {
    permissions,
    profile,
    loading,
    hasPermission: checkPermission,
    isAdmin: checkIsAdmin,
    refresh: loadPermissions,
  };
}

