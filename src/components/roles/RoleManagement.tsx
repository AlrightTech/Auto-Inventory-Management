'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Save,
  Plus,
  Trash2,
  Shield,
  Users,
  Search,
  Filter,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Permission {
  id: string;
  key: string;
  name: string;
  description: string | null;
  module: string;
  granted: boolean;
  role_permission_id?: string | null;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system_role: boolean;
  permissions?: Permission[];
}

export function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
  });

  // Group permissions by module
  const permissionsByModule = useMemo(() => {
    return permissions.reduce((acc, perm) => {
      if (!acc[perm.module]) {
        acc[perm.module] = [];
      }
      acc[perm.module].push(perm);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [permissions]);

  // Get unique modules
  const modules = useMemo(() => {
    return Object.keys(permissionsByModule).sort();
  }, [permissionsByModule]);

  // Filter permissions based on search and module
  const filteredPermissionsByModule = useMemo(() => {
    const filtered: Record<string, Permission[]> = {};
    
    Object.entries(permissionsByModule).forEach(([module, perms]) => {
      if (selectedModule !== 'all' && module !== selectedModule) {
        return;
      }
      
      const filteredPerms = perms.filter((perm) => {
        const query = searchQuery.toLowerCase();
        return (
          perm.name.toLowerCase().includes(query) ||
          perm.key.toLowerCase().includes(query) ||
          (perm.description && perm.description.toLowerCase().includes(query))
        );
      });
      
      if (filteredPerms.length > 0) {
        filtered[module] = filteredPerms;
      }
    });
    
    return filtered;
  }, [permissionsByModule, searchQuery, selectedModule]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = permissions.length;
    const granted = permissions.filter((p) => p.granted).length;
    const percentage = total > 0 ? Math.round((granted / total) * 100) : 0;
    return { total, granted, percentage };
  }, [permissions]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      if (!response.ok) throw new Error('Failed to fetch roles');
      const { data } = await response.json();
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        await selectRole(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions');
      if (!response.ok) throw new Error('Failed to fetch permissions');
      const { data } = await response.json();
      setPermissions(
        data.map((p: Permission) => ({ ...p, granted: false }))
      );
    } catch (error) {
      console.error('Error fetching permissions:', error);
      toast.error('Failed to load permissions');
    }
  };

  const selectRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`);
      if (!response.ok) throw new Error('Failed to fetch role');
      const { data } = await response.json();
      setSelectedRole(data);
      if (data.permissions && Array.isArray(data.permissions)) {
        setPermissions(data.permissions);
        // Expand all modules when loading role
        setExpandedModules(new Set(Object.keys(permissionsByModule)));
      } else {
        const permResponse = await fetch('/api/permissions');
        if (permResponse.ok) {
          const { data: perms } = await permResponse.json();
          setPermissions(perms.map((p: Permission) => ({ ...p, granted: false })));
        }
      }
    } catch (error) {
      console.error('Error fetching role:', error);
      toast.error('Failed to load role details');
    }
  };

  const togglePermission = (permissionId: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === permissionId ? { ...p, granted: !p.granted } : p
      )
    );
  };

  const toggleModule = (module: string, grant: boolean) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.module === module ? { ...p, granted: grant } : p
      )
    );
  };

  const toggleAllPermissions = (grant: boolean) => {
    setPermissions((prev) =>
      prev.map((p) => ({ ...p, granted: grant }))
    );
  };

  const toggleModuleExpanded = (module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const expandAllModules = () => {
    setExpandedModules(new Set(Object.keys(filteredPermissionsByModule)));
  };

  const collapseAllModules = () => {
    setExpandedModules(new Set());
  };

  const savePermissions = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      const permissionsToSave = permissions.map((p) => ({
        permission_id: p.id,
        granted: p.granted,
      }));

      const response = await fetch(
        `/api/roles/${selectedRole.id}/permissions`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ permissions: permissionsToSave }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save permissions');
      }

      toast.success('Permissions saved successfully');
      await selectRole(selectedRole.id);
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to save permissions'
      );
    } finally {
      setSaving(false);
    }
  };

  const createRole = async () => {
    if (!newRole.name || !newRole.display_name) {
      toast.error('Name and display name are required');
      return;
    }

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
      }

      toast.success('Role created successfully');
      setIsCreateDialogOpen(false);
      setNewRole({ name: '', display_name: '', description: '' });
      await fetchRoles();
    } catch (error) {
      console.error('Error creating role:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to create role'
      );
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/roles/${roleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      toast.success('Role deleted successfully');
      await fetchRoles();
      if (selectedRole?.id === roleId) {
        setSelectedRole(null);
        setPermissions([]);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete role'
      );
    }
  };

  const getModuleStats = (module: string) => {
    const modulePerms = permissionsByModule[module] || [];
    const granted = modulePerms.filter((p) => p.granted).length;
    return { total: modulePerms.length, granted };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg" style={{ color: 'var(--text)' }}>
          Loading roles...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Role & Permission Management
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--subtext)' }}>
            Manage roles and their permissions. Toggle permissions ON/OFF for
            each role.
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
              }}
            >
              <Plus className="w-4 h-4" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-w-md"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border)',
            }}
          >
            <DialogHeader>
              <DialogTitle style={{ color: 'var(--text)' }}>
                Create New Role
              </DialogTitle>
              <DialogDescription style={{ color: 'var(--subtext)' }}>
                Create a custom role with specific permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="role-name" style={{ color: 'var(--text)' }}>
                  Role Name (unique identifier)
                </Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, name: e.target.value })
                  }
                  placeholder="e.g., custom_role_1"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="role-display-name"
                  style={{ color: 'var(--text)' }}
                >
                  Display Name
                </Label>
                <Input
                  id="role-display-name"
                  value={newRole.display_name}
                  onChange={(e) =>
                    setNewRole({ ...newRole, display_name: e.target.value })
                  }
                  placeholder="e.g., Custom Role 1"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div>
                <Label
                  htmlFor="role-description"
                  style={{ color: 'var(--text)' }}
                >
                  Description
                </Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) =>
                    setNewRole({ ...newRole, description: e.target.value })
                  }
                  placeholder="Role description..."
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={createRole}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                }}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Roles List */}
        <div
          className="lg:col-span-1 space-y-2"
          style={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1rem',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
          }}
        >
          <h2
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <Users className="w-5 h-5" />
            Roles ({roles.length})
          </h2>
          <div className="space-y-1">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;
              return (
                <motion.button
                  key={role.id}
                  onClick={() => selectRole(role.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg transition-all',
                    'flex items-center justify-between group'
                  )}
                  style={
                    isSelected
                      ? {
                          backgroundColor: 'var(--accent)',
                          color: 'white',
                        }
                      : {
                          backgroundColor: 'transparent',
                          color: 'var(--text)',
                        }
                  }
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {role.is_system_role ? (
                      <Lock className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <Shield className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">
                        {role.display_name}
                      </div>
                      {role.is_system_role && (
                        <div className="text-xs opacity-70">System Role</div>
                      )}
                    </div>
                  </div>
                  {!role.is_system_role && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteRole(role.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
                      style={{ color: isSelected ? 'white' : 'var(--text)' }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-3">
          {selectedRole ? (
            <div
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '1.5rem',
              }}
            >
              {/* Header with Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2
                      className="text-2xl font-bold"
                      style={{ color: 'var(--text)' }}
                    >
                      {selectedRole.display_name}
                    </h2>
                    {selectedRole.is_system_role && (
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: 'rgba(0, 191, 255, 0.2)',
                          color: 'var(--accent)',
                        }}
                      >
                        System Role
                      </span>
                    )}
                  </div>
                  {selectedRole.description && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: 'var(--subtext)' }}
                    >
                      {selectedRole.description}
                    </p>
                  )}
                  {/* Statistics */}
                  <div className="flex items-center gap-4 mt-3">
                    <div
                      className="flex items-center gap-2 text-sm"
                      style={{ color: 'var(--subtext)' }}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>
                        {stats.granted} / {stats.total} permissions ({stats.percentage}%)
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={savePermissions}
                  disabled={saving}
                  className="flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white',
                  }}
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Permissions'}
                </Button>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                    style={{ color: 'var(--subtext)' }}
                  />
                  <Input
                    placeholder="Search permissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--subtext)' }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <Select
                  value={selectedModule}
                  onValueChange={setSelectedModule}
                >
                  <SelectTrigger
                    className="w-full sm:w-[200px]"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modules</SelectItem>
                    {modules.map((module) => (
                      <SelectItem key={module} value={module}>
                        {module.charAt(0).toUpperCase() + module.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bulk Actions */}
              <div className="flex flex-wrap items-center gap-2 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                <span className="text-sm" style={{ color: 'var(--text)' }}>
                  Bulk Actions:
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllPermissions(true)}
                  className="flex items-center gap-1"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <CheckSquare className="w-3 h-3" />
                  Grant All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleAllPermissions(false)}
                  className="flex items-center gap-1"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  <Square className="w-3 h-3" />
                  Revoke All
                </Button>
                <div className="flex-1" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={expandAllModules}
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Expand All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAllModules}
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                >
                  Collapse All
                </Button>
              </div>

              {/* Permissions List */}
              <div
                className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                }}
              >
                {Object.keys(filteredPermissionsByModule).length === 0 ? (
                  <div
                    className="text-center py-12"
                    style={{ color: 'var(--subtext)' }}
                  >
                    <p>No permissions found matching your search.</p>
                  </div>
                ) : (
                  Object.entries(filteredPermissionsByModule).map(
                    ([module, modulePermissions]) => {
                      const isExpanded = expandedModules.has(module);
                      const moduleStats = getModuleStats(module);
                      const allGranted = modulePermissions.every((p) => p.granted);
                      const someGranted = modulePermissions.some((p) => p.granted);

                      return (
                        <div
                          key={module}
                          className="space-y-2"
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            padding: '0.75rem',
                          }}
                        >
                          {/* Module Header */}
                          <button
                            onClick={() => toggleModuleExpanded(module)}
                            className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-opacity-50 transition-colors"
                            style={{
                              backgroundColor: isExpanded
                                ? 'rgba(0, 191, 255, 0.1)'
                                : 'transparent',
                            }}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4" style={{ color: 'var(--text)' }} />
                              ) : (
                                <ChevronRight className="w-4 h-4" style={{ color: 'var(--text)' }} />
                              )}
                              <h3
                                className="text-base font-semibold capitalize"
                                style={{ color: 'var(--text)' }}
                              >
                                {module.replace('_', ' ')}
                              </h3>
                              <span
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'var(--background)',
                                  color: 'var(--subtext)',
                                }}
                              >
                                {moduleStats.granted}/{moduleStats.total}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModule(module, true);
                                }}
                                className="flex items-center gap-1"
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)',
                                }}
                              >
                                <CheckSquare className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleModule(module, false);
                                }}
                                className="flex items-center gap-1"
                                style={{
                                  borderColor: 'var(--border)',
                                  color: 'var(--text)',
                                }}
                              >
                                <Square className="w-3 h-3" />
                              </Button>
                            </div>
                          </button>

                          {/* Module Permissions */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-2 pl-6"
                              >
                                {modulePermissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className="flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors"
                                    style={{
                                      backgroundColor: permission.granted
                                        ? 'rgba(0, 191, 255, 0.1)'
                                        : 'transparent',
                                      borderLeft: permission.granted
                                        ? '3px solid var(--accent)'
                                        : '3px solid transparent',
                                    }}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="font-medium"
                                          style={{ color: 'var(--text)' }}
                                        >
                                          {permission.name}
                                        </div>
                                        {permission.granted && (
                                          <Unlock className="w-3 h-3" style={{ color: 'var(--accent)' }} />
                                        )}
                                      </div>
                                      {permission.description && (
                                        <div
                                          className="text-sm mt-1"
                                          style={{ color: 'var(--subtext)' }}
                                        >
                                          {permission.description}
                                        </div>
                                      )}
                                      <div
                                        className="text-xs mt-1 font-mono opacity-70"
                                        style={{ color: 'var(--subtext)' }}
                                      >
                                        {permission.key}
                                      </div>
                                    </div>
                                    <Switch
                                      checked={permission.granted}
                                      onCheckedChange={() =>
                                        togglePermission(permission.id)
                                      }
                                      className="ml-4"
                                    />
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center h-64 rounded-lg"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
              }}
            >
              <p style={{ color: 'var(--subtext)' }}>
                Select a role to manage permissions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
