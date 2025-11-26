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
    status: 'active' as 'active' | 'inactive',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Check if user is Admin
  const userIsAdmin = user?.role === 'admin' || user?.role_data?.name === 'Admin';

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'seller',
        status: user.status || 'active',
      });
    }
  }, [user]);

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
            status: formData.status,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update user');
        }

        toast.success('User updated successfully');
        onUserUpdated();
        onClose();
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to update user');
        throw error;
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
              value={formData.role}
              onValueChange={(value: 'seller' | 'transporter') =>
                setFormData({ ...formData, role: value })
              }
              disabled={isSaving}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="transporter">Transporter</SelectItem>
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
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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

