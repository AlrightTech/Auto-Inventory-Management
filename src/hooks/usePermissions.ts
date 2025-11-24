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

      // Get profile with role data (handle RLS gracefully)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
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

      // If user has role_id, fetch role permissions separately
      if (profileData.role_id) {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('permissions, name')
            .eq('id', profileData.role_id)
            .maybeSingle();
          
          if (!roleError && roleData) {
            setPermissions(roleData.permissions as RolePermissions);
            // Update profile with role data for isAdmin check
            setProfile({ ...profileData, role_data: roleData } as ProfileWithRole);
          } else {
            console.error('Error fetching role:', roleError);
            // Fall through to legacy role check
            if (profileData.role === 'admin') {
              // Load Super Admin role permissions
              const { data: superAdminRole } = await supabase
                .from('roles')
                .select('permissions')
                .eq('name', 'Super Admin')
                .maybeSingle();
              
              if (superAdminRole) {
                setPermissions(superAdminRole.permissions as RolePermissions);
              }
            }
          }
        } catch (error) {
          console.error('Error loading role permissions:', error);
          // Fall through to legacy role check
          if (profileData.role === 'admin') {
            // Load Super Admin role permissions
            const { data: superAdminRole } = await supabase
              .from('roles')
              .select('permissions')
              .eq('name', 'Super Admin')
              .maybeSingle();
            
            if (superAdminRole) {
              setPermissions(superAdminRole.permissions as RolePermissions);
            }
          }
        }
      } else if (profileData.role === 'admin') {
        // Load Super Admin role permissions (Admin role was removed)
        const { data: superAdminRole } = await supabase
          .from('roles')
          .select('permissions')
          .eq('name', 'Super Admin')
          .maybeSingle();
        
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

