'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2, Shield, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Role, RolePermissions } from '@/types/permissions';
import { PermissionToggleGroup } from '@/components/roles/PermissionToggleGroup';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function EditRolePageContent() {
  const router = useRouter();
  const params = useParams();
  const roleId = params?.roleId as string;

  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalPermissions, setOriginalPermissions] = useState<RolePermissions | null>(null);

  // Load role data
  useEffect(() => {
    if (roleId) {
      loadRole();
    }
  }, [roleId]);

  const loadRole = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/roles/${roleId}`);

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 404) {
          toast.error('Role not found');
          router.push('/admin/roles');
          return;
        }
        throw new Error(error.error || 'Failed to load role');
      }

      const { data } = await response.json();
      setRole(data);
      setName(data.name);
      setDescription(data.description || '');
      setPermissions(data.permissions);
      setOriginalPermissions(data.permissions);
    } catch (error: any) {
      console.error('Error loading role:', error);
      toast.error(error.message || 'Failed to load role');
      router.push('/admin/roles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!role) {
      toast.error('Role data not loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/roles/${roleId}`, {
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

      const { data } = await response.json();
      
      // Show success toast notification
      toast.success('Role updated successfully!', {
        description: `The role "${data.name}" has been updated.`,
        duration: 4000,
      });
      
      // Navigate back to roles list after a short delay to show the toast
      setTimeout(() => {
        router.push('/admin/roles');
        router.refresh(); // Ensure fresh data is loaded
      }, 500);
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role', {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/roles');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
          <p style={{ color: 'var(--subtext)' }}>Loading role...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8" style={{ color: 'var(--subtext)' }} />
          <p style={{ color: 'var(--subtext)' }}>Role not found</p>
          <Button onClick={handleCancel} style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
            Back to Roles
          </Button>
        </div>
      </div>
    );
  }

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
                Edit Role: {role.name}
              </h1>
              <p style={{ color: 'var(--subtext)' }} className="mt-1">
                Update role details and permissions
              </p>
            </div>
          </div>
        </motion.div>

        <>
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
                    Update the role name and description
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
            {permissions && (
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
                      Update the permissions for this role
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
            )}

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
                    Updating...
                  </>
                ) : (
                  'Update Role'
                )}
              </Button>
            </motion.div>
        </>
      </div>
    </div>
  );
}

export default function EditRolePage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <EditRolePageContent />
    </ProtectedRoute>
  );
}

