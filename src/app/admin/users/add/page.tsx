'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

interface Role {
  id: string;
  name: string;
  description?: string;
}

function AddUserPageContent() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'seller' | 'transporter'>('seller');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  // Load roles for dropdown (if using RBAC system)
  useEffect(() => {
    const loadRoles = async () => {
      try {
        setIsLoadingRoles(true);
        const response = await fetch('/api/roles');
        if (response.ok) {
          const { data } = await response.json();
          setRoles(data || []);
        }
      } catch (error) {
        console.error('Error loading roles:', error);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    loadRoles();
  }, []);

  const handleSubmit = async () => {
    // Validation
    if (!fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!password.trim()) {
      toast.error('Password is required');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!role) {
      toast.error('Role must be selected');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role,
          username: fullName.trim(),
          status: status,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        // Handle duplicate email
        if (error.error?.includes('already exists') || error.error?.includes('already registered')) {
          toast.error('A user with this email already exists');
          return;
        }
        throw new Error(error.error || 'Failed to create user');
      }

      const { data } = await response.json();
      
      // Show success toast notification
      toast.success('User created successfully!', {
        description: `The user "${data.username || data.email}" has been created and can now sign in.`,
        duration: 4000,
      });
      
      // Navigate back to users list after a short delay to show the toast
      setTimeout(() => {
        router.push('/admin/users');
        router.refresh(); // Ensure fresh data is loaded
      }, 500);
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user', {
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/users');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto p-6">
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
            Back to Users
          </Button>
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8" style={{ color: 'var(--accent)' }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', letterSpacing: '0.5px' }}>
                Add New User
              </h1>
              <p style={{ color: 'var(--subtext)' }} className="mt-1">
                Create a new user account with role and permissions
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
                User Information
              </CardTitle>
              <CardDescription style={{ color: 'var(--subtext)' }}>
                Enter the user's details and assign a role
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name */}
              <div>
                <Label htmlFor="full-name" style={{ color: 'var(--text)' }}>
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full-name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="mt-1"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" style={{ color: 'var(--text)' }}>
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., john.doe@example.com"
                  className="mt-1"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password" style={{ color: 'var(--text)' }}>
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min. 6 characters)"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)',
                      paddingRight: '2.5rem'
                    }}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isSubmitting}
                    style={{ color: 'var(--subtext)' }}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
                  Password must be at least 6 characters long
                </p>
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role" style={{ color: 'var(--text)' }}>
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={role}
                  onValueChange={(value: 'admin' | 'seller' | 'transporter') => setRole(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="role"
                    className="mt-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <SelectItem value="admin" style={{ color: 'var(--text)' }}>
                      Admin
                    </SelectItem>
                    <SelectItem value="seller" style={{ color: 'var(--text)' }}>
                      Seller
                    </SelectItem>
                    <SelectItem value="transporter" style={{ color: 'var(--text)' }}>
                      Transporter
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" style={{ color: 'var(--text)' }}>
                  Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={status}
                  onValueChange={(value: 'active' | 'inactive') => setStatus(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger
                    id="status"
                    className="mt-1"
                    style={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text)'
                    }}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }}>
                    <SelectItem value="active" style={{ color: 'var(--text)' }}>
                      Active
                    </SelectItem>
                    <SelectItem value="inactive" style={{ color: 'var(--text)' }}>
                      Inactive
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
                  Active users can sign in immediately. Inactive users cannot access the system.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            disabled={isSubmitting || !fullName.trim() || !email.trim() || !password.trim() || !role}
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
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create User
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default function AddUserPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <AddUserPageContent />
    </ProtectedRoute>
  );
}

