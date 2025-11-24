'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Loader2, 
  Shield, 
  Users,
  CheckSquare,
  Square
} from 'lucide-react';
import { toast } from 'sonner';
import { Role, RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGroup {
  module: string;
  label: string;
  permissions: {
    key: string;
    label: string;
    description?: string;
  }[];
}

const permissionGroups: PermissionGroup[] = [
  {
    module: 'inventory',
    label: 'A. Inventory Modules',
    permissions: [
      { key: 'view', label: 'View Inventory List' },
      { key: 'add', label: 'Add New Inventory Car' },
      { key: 'edit', label: 'Edit Inventory Car Details' },
      { key: 'upload_photos', label: 'Upload/Edit Photos' },
      { key: 'update_location', label: 'Update Car Location' },
      { key: 'condition_notes', label: 'Condition / Mechanical Notes' },
      { key: 'purchase_details', label: 'Purchase Details (buy price, seller info)' },
      { key: 'title_status', label: 'Title Status in Inventory' },
    ],
  },
  {
    module: 'sold',
    label: 'B. Sold Section',
    permissions: [
      { key: 'view', label: 'View Sold Cars' },
      { key: 'edit', label: 'Edit Sold Car Details' },
      { key: 'profit_visibility', label: 'Profit Visibility (most restricted)' },
      { key: 'expenses_visibility', label: 'Expenses Visibility' },
      { key: 'transportation_costs', label: 'Transportation Costs' },
      { key: 'arb', label: 'ARB for Sold Cars' },
      { key: 'adjust_price', label: 'Adjust Price (sold ARB)' },
      { key: 'arb_outcome_history', label: 'View ARB Outcome History' },
    ],
  },
  {
    module: 'arb',
    label: 'C. ARB Section',
    permissions: [
      { key: 'access', label: 'Access ARB dashboard' },
      { key: 'create', label: 'Create / Update ARB Cases' },
      { key: 'update', label: 'Update ARB Cases' },
      { key: 'enter_outcomes', label: 'Enter ARB Outcomes (Denied, Price Adjusted, Withdrawn)' },
      { key: 'enter_price_adjustment', label: 'Enter Price Adjustment Amount' },
      { key: 'transportation_details', label: 'Transportation Details/Cost' },
      { key: 'upload_documents', label: 'Upload ARB Documents' },
    ],
  },
  {
    module: 'title',
    label: 'D. Title & Documentation',
    permissions: [
      { key: 'status', label: 'Title Status (in all sections)' },
      { key: 'upload_documents', label: 'Upload Title Documents' },
      { key: 'missing_titles_dashboard', label: 'Missing Titles Dashboard' },
      { key: 'days_missing_tracker', label: 'Days Missing Title Tracker' },
    ],
  },
  {
    module: 'transportation',
    label: 'E. Transportation / Logistics',
    permissions: [
      { key: 'location_tracking', label: 'Location Tracking (Inventory)' },
      { key: 'transport_assignment', label: 'Transport Assignment' },
      { key: 'transport_notes', label: 'Transport Notes' },
      { key: 'transport_cost_entry', label: 'Transport Cost Entry' },
      { key: 'view_history', label: 'View Transport History' },
    ],
  },
  {
    module: 'accounting',
    label: 'F. Accounting & Financial',
    permissions: [
      { key: 'profit_per_car', label: 'Profit Per Car (visible/invisible)' },
      { key: 'weekly_profit_summary', label: 'Weekly Profit Summary' },
      { key: 'monthly_profit_summary', label: 'Monthly Profit Summary' },
      { key: 'total_pl_summary', label: 'Total P&L Summary' },
      { key: 'accounting_page', label: 'Accounting Page' },
      { key: 'expenses_section', label: 'Expenses Section' },
      { key: 'price_adjustment_log', label: 'Price Adjustment Log' },
      { key: 'export_reports', label: 'Export Financial Reports' },
    ],
  },
  {
    module: 'reports',
    label: 'G. Reports Section',
    permissions: [
      { key: 'profit_per_car', label: 'Profit Per Car Report' },
      { key: 'weekly_profit_loss', label: 'Weekly Profit/Loss Report' },
      { key: 'monthly_profit_loss', label: 'Monthly Profit/Loss Report' },
      { key: 'arb_activity', label: 'ARB Activity Report' },
      { key: 'arb_transportation_cost', label: 'ARB Transportation Cost Report' },
      { key: 'price_adjustment_summary', label: 'Price Adjustment Summary' },
      { key: 'inventory_summary', label: 'Inventory Summary Report' },
      { key: 'sold_cars_weekly_count', label: 'Sold Cars Weekly Count' },
      { key: 'missing_titles', label: 'Missing Titles Report' },
      { key: 'average_transportation_cost', label: 'Average Transportation Cost' },
      { key: 'average_arb_adjustment_percentage', label: 'Average ARB Adjustment Percentage' },
    ],
  },
  {
    module: 'user_management',
    label: 'H. User Management / System',
    permissions: [
      { key: 'view_users', label: 'User Accounts (View)' },
      { key: 'create_roles', label: 'Create Roles' },
      { key: 'edit_roles', label: 'Edit Roles' },
      { key: 'assign_roles', label: 'Assign Roles' },
      { key: 'activity_logs', label: 'Activity Logs' },
      { key: 'permission_editing', label: 'Permission Editing (hide/show UI items)' },
    ],
  },
];

export default function RolesPage() {
  const router = useRouter();
  const { isAdmin, loading: permissionsLoading } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: getDefaultPermissions(),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (permissionsLoading) return;
    
    if (!isAdmin()) {
      router.push('/admin');
      toast.error('Access denied. Admin privileges required.');
      return;
    }
    
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsLoading]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch('/api/roles', {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to load roles (${response.status})`);
      }
      
      const result = await response.json();
      setRoles(result.data || []);
      
      // Show warning if table doesn't exist or other issues
      if (result.error) {
        if (result.error.includes('table not found') || result.error.includes('migration')) {
          toast.warning('Roles table not found. Please run database migration: supabase/migrations/20241221_create_rbac_system.sql', {
            duration: 10000,
          });
        } else if (result.error.includes('timeout')) {
          toast.warning('Request timed out. Please check your database connection.');
        }
      }
    } catch (error: any) {
      console.error('Error loading roles:', error);
      
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please check your connection and try again.');
      } else {
        toast.error(error.message || 'Failed to load roles');
      }
      
      // Set empty array so UI doesn't break
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description || '',
        permissions: role.permissions,
      });
    } else {
      setEditingRole(null);
      setFormData({
        name: '',
        description: '',
        permissions: getDefaultPermissions(),
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: getDefaultPermissions(),
    });
  };

  const togglePermission = (module: string, permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: {
          ...prev.permissions[module as keyof RolePermissions],
          [permission]: !(prev.permissions[module as keyof RolePermissions] as any)[permission],
        },
      },
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      setSaving(true);
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save role');
      }

      toast.success(`Role ${editingRole ? 'updated' : 'created'} successfully`);
      handleCloseDialog();
      loadRoles();
    } catch (error: any) {
      console.error('Error saving role:', error);
      toast.error(error.message || 'Failed to save role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.is_system_role) {
      toast.error('Cannot delete system roles');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${role.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/roles/${role.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete role');
      }

      toast.success('Role deleted successfully');
      loadRoles();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast.error(error.message || 'Failed to delete role');
    }
  };

  if (permissionsLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
            Role Management
          </h1>
          <p style={{ color: 'var(--subtext)' }}>
            Create and manage roles with granular permission controls
          </p>
        </div>
        <Button
          onClick={() => handleOpenDialog()}
          className="control-panel neon-glow"
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            borderRadius: '25px',
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </motion.div>

      {/* Roles List */}
      {roles.length === 0 && !loading ? (
        <Card className="dashboard-card neon-glow instrument-cluster" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
          <CardContent className="p-12 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--subtext)', opacity: 0.5 }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>No Roles Found</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--subtext)' }}>
              {roles.length === 0 
                ? 'The roles table may not exist. Please run the database migration: supabase/migrations/20241221_create_rbac_system.sql'
                : 'No roles have been created yet. Click "Create Role" to get started.'}
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
          <Card
            key={role.id}
            className="dashboard-card neon-glow instrument-cluster"
            style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <CardTitle style={{ color: 'var(--text)' }}>{role.name}</CardTitle>
                </div>
                {role.is_system_role && (
                  <span className="text-xs px-2 py-1 rounded" style={{ 
                    backgroundColor: 'var(--accent)', 
                    color: 'white',
                    opacity: 0.8
                  }}>
                    System
                  </span>
                )}
              </div>
              {role.description && (
                <CardDescription style={{ color: 'var(--subtext)' }}>
                  {role.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenDialog(role)}
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)'
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {!role.is_system_role && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(role)}
                    style={{ 
                      backgroundColor: 'var(--card-bg)', 
                      borderColor: 'var(--border)', 
                      color: '#ef4444'
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        </div>
      )}

      {/* Create/Edit Role Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border)',
        }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--text)' }}>
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--subtext)' }}>
              Configure permissions for this role. Toggle each permission on or off.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" style={{ color: 'var(--text)' }}>
                  Role Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Sales Manager"
                  disabled={editingRole?.is_system_role}
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
              <div>
                <Label htmlFor="description" style={{ color: 'var(--text)' }}>
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this role"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)',
                  }}
                />
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                Permissions
              </h3>
              {permissionGroups.map((group) => (
                <Card key={group.module} style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                }}>
                  <CardHeader>
                    <CardTitle className="text-base" style={{ color: 'var(--text)' }}>
                      {group.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {group.permissions.map((permission) => {
                      const modulePerms = formData.permissions[group.module as keyof RolePermissions] as any;
                      const isChecked = modulePerms?.[permission.key] === true;

                      return (
                        <div
                          key={permission.key}
                          className="flex items-center gap-3 p-2 rounded hover:bg-opacity-50"
                          style={{ backgroundColor: 'var(--bg)', opacity: 0.5 }}
                        >
                          <button
                            type="button"
                            onClick={() => togglePermission(group.module, permission.key)}
                            className="flex items-center gap-2 flex-1 text-left"
                            disabled={editingRole?.is_system_role}
                          >
                            {isChecked ? (
                              <CheckSquare className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                            ) : (
                              <Square className="w-5 h-5" style={{ color: 'var(--subtext)' }} />
                            )}
                            <div>
                              <div className="font-medium" style={{ color: 'var(--text)' }}>
                                {permission.label}
                              </div>
                              {permission.description && (
                                <div className="text-sm" style={{ color: 'var(--subtext)' }}>
                                  {permission.description}
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                disabled={saving}
                style={{
                  backgroundColor: 'transparent',
                  borderColor: 'var(--border)',
                  color: 'var(--text)',
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || editingRole?.is_system_role}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editingRole ? 'Update Role' : 'Create Role'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

