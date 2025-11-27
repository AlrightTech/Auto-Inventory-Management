'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Role, RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { useRouter } from 'next/navigation';

export default function RoleManagementPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { confirm } = useConfirmation();

  // Load roles
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/roles');
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle 403 Forbidden specifically
        if (response.status === 403) {
          toast.error(errorData.details || errorData.error || 'You do not have permission to view roles');
          console.error('Forbidden error details:', errorData);
        } else {
          throw new Error(errorData.error || 'Failed to load roles');
        }
        return;
      }

      const { data } = await response.json();
      setRoles(data || []);
    } catch (error: any) {
      console.error('Error loading roles:', error);
      // Only show toast if it's not a 403 (already handled above)
      if (error.message && !error.message.includes('Forbidden')) {
        toast.error(error.message || 'Failed to load roles');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Apply search filter
  useEffect(() => {
    let filtered = [...roles];

    if (searchTerm) {
      filtered = filtered.filter(role =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRoles(filtered);
  }, [roles, searchTerm]);

  const handleEdit = (role: Role) => {
    // Navigate to edit page
    router.push(`/admin/roles/edit/${role.id}`);
  };

  const handleDelete = async (role: Role) => {
    try {
      const confirmed = await confirm({
        title: 'Delete Role',
        description: 'Are you sure you want to delete this role? This action cannot be undone.',
        variant: 'danger',
        confirmText: 'Delete Role',
        cancelText: 'Cancel',
        onConfirm: async () => {
          setIsDeleting(role.id);
          
          try {
            const response = await fetch(`/api/roles/${role.id}`, {
              method: 'DELETE',
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to delete role');
            }

            // Optimistically remove the role from the list
            setRoles(prevRoles => prevRoles.filter(r => r.id !== role.id));
            setFilteredRoles(prevFiltered => prevFiltered.filter(r => r.id !== role.id));
            
            // Show success message
            toast.success('Role deleted successfully', {
              description: `The role "${role.name}" has been removed.`,
              duration: 4000,
            });
          } catch (error: any) {
            console.error('Error deleting role:', error);
            toast.error(error.message || 'Failed to delete role', {
              duration: 4000,
            });
            // Reload roles to ensure UI is in sync
            loadRoles();
            // Don't re-throw - error is handled via toast, modal should close
          } finally {
            setIsDeleting(null);
          }
        },
      });

      // If user cancelled, do nothing
      if (!confirmed) {
        return;
      }
    } catch (error: any) {
      // Handle any errors from the confirmation dialog
      console.error('Error in delete confirmation:', error);
      // Don't show error toast here - it's already handled in onConfirm
      // Just ensure the UI state is reset
      setIsDeleting(null);
    }
  };

  const getPermissionCount = (permissions: RolePermissions): { granted: number; total: number } => {
    let granted = 0;
    let total = 0;

    Object.values(permissions).forEach((module) => {
      Object.values(module).forEach((value) => {
        total++;
        if (value === true) granted++;
      });
    });

    return { granted, total };
  };

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
          <p style={{ color: 'var(--subtext)' }} className="mt-1">
            Create and manage roles with granular permission controls
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/roles/create')}
          style={{ backgroundColor: 'var(--accent)', color: 'white' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--subtext)' }} />
              <Input
                placeholder="Search roles by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--border)',
                  color: 'var(--text)'
                }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Roles List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
              Roles ({filteredRoles.length})
            </CardTitle>
            <CardDescription style={{ color: 'var(--subtext)' }}>
              Manage role permissions and access controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="ml-2" style={{ color: 'var(--subtext)' }}>Loading roles...</span>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--subtext)' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>No roles found</h3>
                <p style={{ color: 'var(--subtext)' }}>
                  {roles.length === 0 
                    ? "No roles have been created yet. Create your first role to get started."
                    : "No roles match your search criteria."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRoles.map((role, index) => {
                  const { granted, total } = getPermissionCount(role.permissions);
                  const isSystemRole = role.name === 'Admin' || role.is_system_role;
                  
                  return (
                    <motion.div
                      key={role.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border transition-colors"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--border)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                              {role.name}
                            </h3>
                            {isSystemRole && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                System Role
                              </Badge>
                            )}
                          </div>
                          {role.description && (
                            <p className="text-sm mb-3" style={{ color: 'var(--subtext)' }}>
                              {role.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />
                              <span style={{ color: 'var(--subtext)' }}>
                                {granted} of {total} permissions granted
                              </span>
                            </div>
                            <div style={{ color: 'var(--subtext)' }}>
                              Created: {new Date(role.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(role)}
                            style={{
                              borderColor: 'var(--border)',
                              color: 'var(--text)'
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(role)}
                            disabled={isDeleting === role.id}
                            style={{
                              borderColor: '#ef4444',
                              color: '#ef4444'
                            }}
                          >
                            {isDeleting === role.id ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

