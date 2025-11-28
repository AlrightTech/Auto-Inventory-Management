'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X, Key, Power, PowerOff } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useConfirmation } from '@/contexts/ConfirmationContext';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'seller' | 'transporter';
  role_id?: string | null;
  role_data?: { name: string; is_system_role?: boolean } | null;
  status?: 'active' | 'inactive';
  created_at: string;
  last_sign_in_at?: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role?: boolean;
}

interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  const { isAdmin } = usePermissions();
  const { confirm } = useConfirmation();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'seller' as 'admin' | 'seller' | 'transporter',
    role_id: null as string | null,
    status: 'active' as 'active' | 'inactive',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Check if user is Admin
  const userIsAdmin = user?.role === 'admin' || user?.role_data?.name === 'Admin';

  // Load roles from API
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await fetch('/api/roles');
        if (response.ok) {
          const { data } = await response.json();
          // Filter out Admin role - exclude roles with name "Admin" (case-insensitive)
          const filteredRoles = (data || []).filter(
            (role: Role) => role.name.toLowerCase() !== 'admin'
          );
          setRoles(filteredRoles);
        } else {
          console.error('Failed to load roles');
          // Fallback to legacy roles if API fails
          setRoles([]);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
        setRoles([]);
      } finally {
        setIsLoadingRoles(false);
      }
    };

    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      // Determine the role to use - prefer role_id if available, otherwise use legacy role
      let initialRole = user.role || 'seller';
      let initialRoleId = user.role_id || null;

      // If user has a role_data but no role_id, try to find matching role
      if (user.role_data?.name && !initialRoleId && roles.length > 0) {
        const matchingRole = roles.find(r => r.name === user.role_data.name);
        if (matchingRole) {
          initialRoleId = matchingRole.id;
        }
      }

      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: initialRole as 'admin' | 'seller' | 'transporter',
        role_id: initialRoleId,
        status: user.status || 'active',
      });
    }
  }, [user, roles]);

  // Prevent editing admin
  if (userIsAdmin) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    // Validate form
    if (!formData.username.trim()) {
      toast.error('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Check if status is being changed to inactive
    const originalStatus = user.status || 'active';
    const statusChanged = formData.status !== originalStatus;
    const isDeactivating = statusChanged && formData.status === 'inactive';

    if (isDeactivating) {
      const confirmed = await confirm({
        title: 'Deactivate User Account',
        description: `Are you sure you want to deactivate "${user.username || user.email}"? This will prevent them from logging in until the account is reactivated.`,
        variant: 'warning',
        confirmText: 'Deactivate',
        cancelText: 'Cancel',
        onConfirm: async () => {
          await performUpdate();
        },
      });
      if (!confirmed) return;
    } else {
      await performUpdate();
    }

    async function performUpdate() {
      try {
        setIsSaving(true);

        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username.trim(),
            email: formData.email.trim(),
            role: formData.role,
            role_id: formData.role_id,
            status: formData.status,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to update user';
          const errorDetails = errorData.details ? ` Details: ${errorData.details}` : '';
          throw new Error(`${errorMessage}${errorDetails}`);
        }

        const result = await response.json();
        
        // Show success toast with details about what was updated
        const updatedFields = [];
        if (formData.username !== (user.username || '')) updatedFields.push('name');
        if (formData.email !== user.email) updatedFields.push('email');
        if (formData.status !== (user.status || 'active')) updatedFields.push('status');
        if (formData.role !== user.role || formData.role_id !== user.role_id) updatedFields.push('role');
        
        const updateMessage = updatedFields.length > 0 
          ? `User ${updatedFields.join(', ')} updated successfully`
          : 'User updated successfully';
        
        toast.success(updateMessage, {
          description: result.data ? `User "${result.data.username || result.data.email}" has been updated.` : undefined,
          duration: 4000,
        });
        
        onUserUpdated();
        onClose();
      } catch (error) {
        console.error('Error updating user:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
        toast.error(errorMessage, {
          duration: 5000,
        });
        // Don't re-throw to prevent modal from closing on error
      }
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card-strong border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Edit User</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Update user information and role
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-slate-300">
              Username
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              placeholder="Enter username"
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
              placeholder="Enter email address"
              disabled={isSaving}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-300">
              Role
            </Label>
            <Select
              value={
                formData.role_id || 
                (roles.length > 0 
                  ? roles.find(r => 
                      r.name.toLowerCase().includes(formData.role.toLowerCase())
                    )?.id 
                  : formData.role) || 
                ''
              }
              onValueChange={(value: string) => {
                // Find the selected role
                const selectedRole = roles.find(r => r.id === value);
                if (selectedRole) {
                  // Map role name to legacy role for API compatibility
                  let legacyRole: 'seller' | 'transporter' = 'seller';
                  if (selectedRole.name.toLowerCase().includes('transporter')) {
                    legacyRole = 'transporter';
                  } else if (selectedRole.name.toLowerCase().includes('seller')) {
                    legacyRole = 'seller';
                  }
                  
                  setFormData({ 
                    ...formData, 
                    role: legacyRole,
                    role_id: selectedRole.id 
                  });
                } else {
                  // Fallback to legacy role system
                  setFormData({ 
                    ...formData, 
                    role: value as 'seller' | 'transporter',
                    role_id: null 
                  });
                }
              }}
              disabled={isSaving || isLoadingRoles}
            >
              <SelectTrigger 
                id="role"
                className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}
              >
                <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select role"} />
              </SelectTrigger>
              <SelectContent 
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)',
                  zIndex: 9999
                }}
              >
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <SelectItem 
                      key={role.id} 
                      value={role.id}
                      style={{ color: 'var(--text)' }}
                    >
                      {role.name}
                    </SelectItem>
                  ))
                ) : (
                  // Fallback to legacy roles if no roles loaded
                  <>
                    <SelectItem value="seller" style={{ color: 'var(--text)' }}>Seller</SelectItem>
                    <SelectItem value="transporter" style={{ color: 'var(--text)' }}>Transporter</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-400">Note: Admin role cannot be assigned via this form</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-slate-300">
              Account Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'active' | 'inactive') =>
                setFormData({ ...formData, status: value })
              }
              disabled={isSaving}
            >
              <SelectTrigger 
                id="status"
                className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20"
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)', 
                  color: 'var(--text)' 
                }}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent 
                style={{ 
                  backgroundColor: 'var(--card-bg)', 
                  borderColor: 'var(--border)',
                  zIndex: 9999
                }}
              >
                <SelectItem value="active" style={{ color: 'var(--text)' }}>Active</SelectItem>
                <SelectItem value="inactive" style={{ color: 'var(--text)' }}>Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password Reset Section */}
          {isAdmin() && (
            <div className="space-y-2 border-t border-slate-700 pt-4">
              <Label className="text-slate-300">Password Reset</Label>
              {!showPasswordReset ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPasswordReset(true)}
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
                  disabled={isSaving}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Reset Password
                </Button>
              ) : (
                <div className="space-y-2">
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 8 characters)"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20"
                    disabled={isResettingPassword}
                    minLength={8}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        if (!newPassword || newPassword.length < 8) {
                          toast.error('Password must be at least 8 characters');
                          return;
                        }
                        
                        const confirmed = await confirm({
                          title: 'Reset User Password',
                          description: `Are you sure you want to reset the password for "${user.username || user.email}"? They will need to use the new password to log in.`,
                          variant: 'warning',
                          confirmText: 'Reset Password',
                          cancelText: 'Cancel',
                          onConfirm: async () => {
                            try {
                              setIsResettingPassword(true);
                              const response = await fetch(`/api/users/${user.id}/reset-password`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ newPassword }),
                              });
                              if (!response.ok) {
                                const error = await response.json();
                                throw new Error(error.error || 'Failed to reset password');
                              }
                              toast.success('Password reset successfully');
                              setNewPassword('');
                              setShowPasswordReset(false);
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : 'Failed to reset password');
                              throw error;
                            } finally {
                              setIsResettingPassword(false);
                            }
                          },
                        });
                      }}
                      className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={isResettingPassword || !newPassword || newPassword.length < 8}
                    >
                      {isResettingPassword ? 'Resetting...' : 'Reset'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordReset(false);
                        setNewPassword('');
                      }}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      disabled={isResettingPassword}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary hover:opacity-90"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

