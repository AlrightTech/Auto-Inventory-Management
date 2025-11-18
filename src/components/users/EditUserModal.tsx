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
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'seller' | 'transporter' | 'office_staff';
  role_id?: string | null;
  created_at: string;
  last_sign_in_at?: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  is_system_role: boolean;
}

interface EditUserModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, isOpen, onClose, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role_id: '',
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Fetch roles
  useEffect(() => {
    async function fetchRoles() {
      try {
        const response = await fetch('/api/roles');
        if (!response.ok) throw new Error('Failed to fetch roles');
        const { data } = await response.json();
        setRoles(data);
      } catch (error) {
        console.error('Error fetching roles:', error);
        toast.error('Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    }
    
    if (isOpen) {
      fetchRoles();
    }
  }, [isOpen]);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role_id: user.role_id || '',
      });
    }
  }, [user]);

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

    try {
      setIsSaving(true);

      // Update user basic info
      const updateResponse = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update user');
      }

      // Assign role if role_id is selected
      if (formData.role_id) {
        const roleResponse = await fetch('/api/users/assign-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: user.id,
            role_id: formData.role_id,
          }),
        });

        if (!roleResponse.ok) {
          const errorData = await roleResponse.json();
          throw new Error(errorData.error || 'Failed to assign role');
        }
      }

      toast.success('User updated successfully');
      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setIsSaving(false);
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
              value={formData.role_id}
              onValueChange={(value) =>
                setFormData({ ...formData, role_id: value })
              }
              disabled={isSaving || loadingRoles}
            >
              <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder={loadingRoles ? "Loading roles..." : "Select role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex items-center gap-2">
                      <span>{role.display_name}</span>
                      {role.is_system_role && (
                        <span className="text-xs opacity-70">(System)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formData.role_id && (
              <p className="text-xs text-slate-400 mt-1">
                {roles.find(r => r.id === formData.role_id)?.description || ''}
              </p>
            )}
          </div>

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

