'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
import { toast } from 'sonner';
import { Save, Plus, Trash2, Edit2, Shield, Users } from 'lucide-react';
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
  const [newRole, setNewRole] = useState({
    name: '',
    display_name: '',
    description: '',
  });

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

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
      // Set permissions from the role data
      if (data.permissions && Array.isArray(data.permissions)) {
        setPermissions(data.permissions);
      } else {
        // If permissions not in response, fetch all permissions and set granted to false
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
      await selectRole(selectedRole.id); // Refresh
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Role Management
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
          }}
        >
          <h2
            className="text-lg font-semibold mb-4 flex items-center gap-2"
            style={{ color: 'var(--text)' }}
          >
            <Users className="w-5 h-5" />
            Roles
          </h2>
          <div className="space-y-1">
            {roles.map((role) => (
              <motion.button
                key={role.id}
                onClick={() => selectRole(role.id)}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-lg transition-all',
                  'flex items-center justify-between group'
                )}
                style={
                  selectedRole?.id === role.id
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
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{role.display_name}</div>
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: 'var(--text)' }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </motion.button>
            ))}
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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: 'var(--text)' }}
                  >
                    {selectedRole.display_name}
                  </h2>
                  {selectedRole.description && (
                    <p
                      className="mt-1 text-sm"
                      style={{ color: 'var(--subtext)' }}
                    >
                      {selectedRole.description}
                    </p>
                  )}
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

              <div className="space-y-6 max-h-[600px] overflow-y-auto">
                {Object.entries(permissionsByModule).map(
                  ([module, modulePermissions]) => (
                    <div key={module} className="space-y-3">
                      <h3
                        className="text-lg font-semibold capitalize"
                        style={{ color: 'var(--text)' }}
                      >
                        {module.replace('_', ' ')}
                      </h3>
                      <div
                        className="space-y-2 pl-4"
                        style={{
                          borderLeft: '2px solid var(--border)',
                        }}
                      >
                        {modulePermissions.map((permission) => (
                          <div
                            key={permission.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-opacity-50 transition-colors"
                            style={{
                              backgroundColor: permission.granted
                                ? 'rgba(0, 191, 255, 0.1)'
                                : 'transparent',
                            }}
                          >
                            <div className="flex-1">
                              <div
                                className="font-medium"
                                style={{ color: 'var(--text)' }}
                              >
                                {permission.name}
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
                                className="text-xs mt-1 font-mono"
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
                            />
                          </div>
                        ))}
                      </div>
                    </div>
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

