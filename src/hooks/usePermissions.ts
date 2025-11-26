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
          
          if (roleError) {
            // Only log if there's a meaningful error (not just missing data - PGRST116)
            // First check if error is actually an empty object
            const errorKeys = Object.keys(roleError);
            const isEmptyObject = errorKeys.length === 0;
            const isNotFoundError = roleError?.code === 'PGRST116';
            
            // Skip logging if error is empty object or "not found" error
            if (!isEmptyObject && !isNotFoundError) {
              // Check if error has meaningful content
              const hasCode = roleError?.code && roleError.code !== 'PGRST116';
              const hasMessage = roleError?.message && typeof roleError.message === 'string' && roleError.message.trim().length > 0;
              const hasDetails = roleError?.details && (typeof roleError.details === 'string' || (typeof roleError.details === 'object' && Object.keys(roleError.details).length > 0));
              
              // Only log if there's actual meaningful error content
              if (hasCode || hasMessage || hasDetails) {
                const errorInfo: any = {};
                if (hasCode) errorInfo.code = roleError.code;
                if (hasMessage) errorInfo.message = roleError.message;
                if (hasDetails) errorInfo.details = roleError.details;
                
                // Final check: only log if we have at least one meaningful property
                if (Object.keys(errorInfo).length > 0) {
                  console.error('Error fetching role:', errorInfo);
                }
              }
            }
            // If error is empty or just "not found", silently continue without logging
            // Fall through to legacy role check
            if (profileData.role === 'admin') {
              // Load Admin role permissions
              const { data: adminRole } = await supabase
                .from('roles')
                .select('permissions')
                .eq('name', 'Admin')
                .maybeSingle();
              
              if (adminRole) {
                setPermissions(adminRole.permissions as RolePermissions);
              }
            } else {
              // No role found and not admin - set empty permissions
              setPermissions(null);
            }
          } else if (roleData) {
            setPermissions(roleData.permissions as RolePermissions);
            // Update profile with role data for isAdmin check
            setProfile({ ...profileData, role_data: roleData } as ProfileWithRole);
          } else {
            // Role not found - fall through to legacy role check
            if (profileData.role === 'admin') {
              // Load Admin role permissions
              const { data: adminRole } = await supabase
                .from('roles')
                .select('permissions')
                .eq('name', 'Admin')
                .maybeSingle();
              
              if (adminRole) {
                setPermissions(adminRole.permissions as RolePermissions);
              }
            } else {
              // No role found and not admin - set empty permissions
              setPermissions(null);
            }
          }
        } catch (error: any) {
          // Only log meaningful errors - skip empty objects or undefined
          if (error) {
            const errorMessage = error?.message || (typeof error === 'string' ? error : null);
            const errorCode = error?.code;
            const hasContent = errorMessage || errorCode;
            
            // Only log if there's actual error content
            if (hasContent) {
              console.error('Error loading role permissions:', {
                message: errorMessage || 'Unknown error',
                code: errorCode || 'unknown'
              });
            }
          }
          // Fall through to legacy role check
          if (profileData.role === 'admin') {
            // Load Admin role permissions
            const { data: adminRole } = await supabase
              .from('roles')
              .select('permissions')
              .eq('name', 'Admin')
              .maybeSingle();
            
            if (adminRole) {
              setPermissions(adminRole.permissions as RolePermissions);
            }
          } else {
            setPermissions(null);
          }
        }
      } else if (profileData.role === 'admin') {
        // Load Admin role permissions
        const { data: adminRole } = await supabase
          .from('roles')
          .select('permissions')
          .eq('name', 'Admin')
          .maybeSingle();
        
        if (adminRole) {
          setPermissions(adminRole.permissions as RolePermissions);
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
    // Admin always has all permissions
    if (isAdmin(profile)) {
      return true;
    }
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

