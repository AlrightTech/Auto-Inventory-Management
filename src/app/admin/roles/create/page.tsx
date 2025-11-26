'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { RolePermissions } from '@/types/permissions';
import { getDefaultPermissions } from '@/lib/permissions';
import { PermissionToggleGroup } from '@/components/roles/PermissionToggleGroup';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function CreateRolePageContent() {
  const router = useRouter();
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

          toast.success('Role created successfully');
          // Navigate back to roles list
          router.push('/admin/roles');
        } catch (error: any) {
          console.error('Error creating role:', error);
          toast.error(error.message || 'Failed to create role');
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleCancel = () => {
    router.push('/admin/roles');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{ color: 'var(--text)' }}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Roles
          </Button>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                Create New Role
              </h1>
              <p style={{ color: 'var(--subtext)' }} className="mt-1">
                Define a new role with custom permissions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--accent)' }}>
                Role Information
              </CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Enter the role name and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
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
                  disabled={isSubmitting}
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
                  rows={3}
                  className="mt-1"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Permissions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle style={{ color: 'var(--accent)' }}>
                Permissions
              </CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Select the permissions for this role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionToggleGroup
                permissions={permissions}
                onChange={setPermissions}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-3 mt-6"
        >
          <Button
            variant="outline"
            onClick={handleCancel}
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
              'Save Role'
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function CreateRolePage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <CreateRolePageContent />
    </ProtectedRoute>
  );
}

