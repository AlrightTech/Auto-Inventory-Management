'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Role, RolePermissions } from '@/types/permissions';
import { PermissionToggleGroup } from '@/components/roles/PermissionToggleGroup';
import { useConfirmation } from '@/contexts/ConfirmationContext';

interface EditRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: Role;
}

export function EditRoleModal({ isOpen, onClose, onSuccess, role }: EditRoleModalProps) {
  const { confirm } = useConfirmation();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || '');
  const [permissions, setPermissions] = useState<RolePermissions>(role.permissions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update state when role changes
  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
      setPermissions(role.permissions);
    }
  }, [role]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    // Prevent editing Admin role
    if (role.name === 'Admin' || role.is_system_role) {
      toast.error('System roles cannot be edited');
      return;
    }

    // Check if permissions have changed
    const permissionsChanged = JSON.stringify(permissions) !== JSON.stringify(role.permissions);
    
    if (permissionsChanged) {
      const confirmed = await confirm({
        title: 'Change Role Permissions',
        description: `You are about to change permissions for role "${name}". This will immediately affect all users assigned to this role. Are you sure you want to continue?`,
        variant: 'warning',
        confirmText: 'Update Permissions',
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
      setIsSubmitting(true);
      try {
        const response = await fetch(`/api/roles/${role.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || null,
            permissions,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to update role');
        }

        toast.success('Role updated successfully');
        onSuccess();
      } catch (error: any) {
        console.error('Error updating role:', error);
        toast.error(error.message || 'Failed to update role');
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset to original values
      setName(role.name);
      setDescription(role.description || '');
      setPermissions(role.permissions);
      onClose();
    }
  };

  const isSystemRole = role.name === 'Admin' || role.is_system_role;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto" 
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border)',
          color: 'var(--text)',
          zIndex: 101
        }}
      >
        <DialogHeader>
          <DialogTitle style={{ color: 'var(--accent)' }}>
            Edit Role: {role.name}
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            {isSystemRole 
              ? 'System roles cannot be edited'
              : 'Update role permissions and settings'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Role Name */}
          <div>
            <Label htmlFor="edit-role-name" style={{ color: 'var(--text)' }}>
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSystemRole}
              className="mt-1"
              style={{
                backgroundColor: isSystemRole ? 'rgba(107, 114, 128, 0.2)' : 'var(--card-bg)',
                borderColor: 'var(--border)',
                color: isSystemRole ? 'var(--subtext)' : 'var(--text)',
                cursor: isSystemRole ? 'not-allowed' : 'text'
              }}
            />
            {isSystemRole && (
              <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
                System roles cannot be renamed
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="edit-role-description" style={{ color: 'var(--text)' }}>
              Description
            </Label>
            <Textarea
              id="edit-role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSystemRole}
              rows={2}
              className="mt-1"
              style={{
                backgroundColor: isSystemRole ? 'rgba(107, 114, 128, 0.2)' : 'var(--card-bg)',
                borderColor: 'var(--border)',
                color: isSystemRole ? 'var(--subtext)' : 'var(--text)',
                cursor: isSystemRole ? 'not-allowed' : 'text'
              }}
            />
          </div>

          {/* Permissions */}
          <div>
            <Label style={{ color: 'var(--text)', marginBottom: '1rem', display: 'block' }}>
              Permissions
            </Label>
            {isSystemRole ? (
              <div className="p-4 rounded-lg border" style={{ 
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                borderColor: 'var(--border)'
              }}>
                <p style={{ color: 'var(--subtext)' }}>
                  System role permissions cannot be modified
                </p>
              </div>
            ) : (
              <PermissionToggleGroup
                permissions={permissions}
                onChange={setPermissions}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || isSystemRole}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

