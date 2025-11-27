'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';
import { PermissionToggleGroup } from '@/components/roles/PermissionToggleGroup';
import { useConfirmation } from '@/contexts/ConfirmationContext';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateRoleModal({ isOpen, onClose, onSuccess }: CreateRoleModalProps) {
  const { confirm } = useConfirmation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<RolePermissions>(getDefaultPermissions());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      const confirmed = await confirm({
        title: 'Create New Role',
        description: `Are you sure you want to create the role "${name.trim()}"? This will create a new role with the selected permissions that can be assigned to users.`,
        variant: 'info',
        confirmText: 'Create Role',
        cancelText: 'Cancel',
        onConfirm: async () => {
          setIsSubmitting(true);
          try {
            const response = await fetch('/api/roles', {
              method: 'POST',
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
              throw new Error(error.error || 'Failed to create role');
            }

            const { data } = await response.json();
            
            // Show success message with role name
            toast.success(`Role "${data.name}" created successfully!`, {
              duration: 3000,
            });
            
            // Reset form
            setName('');
            setDescription('');
            setPermissions(getDefaultPermissions());
            
            // Close modal and refresh list
            onSuccess();
            onClose();
          } catch (error: any) {
            console.error('Error creating role:', error);
            toast.error(error.message || 'Failed to create role');
            // Don't throw error - let user try again
          } finally {
            setIsSubmitting(false);
          }
        },
      });
      
      // If user cancelled, do nothing
      if (!confirmed) {
        return;
      }
    } catch (error: any) {
      // Handle any errors from the confirmation dialog
      console.error('Error in confirmation:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setDescription('');
      setPermissions(getDefaultPermissions());
      onClose();
    }
  };

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
            Create New Role
          </DialogTitle>
          <DialogDescription style={{ color: 'var(--subtext)' }}>
            Define a new role with custom permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Role Name */}
          <div>
            <Label htmlFor="role-name" style={{ color: 'var(--text)' }}>
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Manager, Viewer, etc."
              className="mt-1"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="role-description" style={{ color: 'var(--text)' }}>
              Description
            </Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this role can do..."
              rows={2}
              className="mt-1"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--border)',
                color: 'var(--text)'
              }}
            />
          </div>

          {/* Permissions */}
          <div>
            <Label style={{ color: 'var(--text)', marginBottom: '1rem', display: 'block' }}>
              Permissions
            </Label>
            <PermissionToggleGroup
              permissions={permissions}
              onChange={setPermissions}
            />
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
              disabled={isSubmitting || !name.trim()}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Role'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

