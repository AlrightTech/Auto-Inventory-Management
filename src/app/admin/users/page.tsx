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
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Trash2,
  User,
  Mail,
  Shield,
  Plus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { UserTable } from '@/components/users/UserTable';
import { UserDetailsModal } from '@/components/users/UserDetailsModal';
import { useConfirmation } from '@/contexts/ConfirmationContext';
import { useRouter } from 'next/navigation';

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

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const supabase = createClient();
  const { confirm } = useConfirmation();

  // Load users from database
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/users');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to load users');
        }

        const { data: usersData } = await response.json();
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Apply search filter
  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    const confirmed = await confirm({
      title: 'Delete User',
      description: `Are you sure you want to delete user "${userEmail}"? This action cannot be undone and will permanently remove all user data.`,
      variant: 'danger',
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setIsDeleting(userId);
          
          const response = await fetch(`/api/users/${userId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete user');
          }
          
          // Update local state
          setUsers(prev => prev.filter(user => user.id !== userId));
          toast.success('User deleted successfully');
        } catch (error) {
          console.error('Error deleting user:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to delete user');
          throw error; // Re-throw to prevent modal from closing on error
        } finally {
          setIsDeleting(null);
        }
      },
    });

    if (!confirmed) {
      setIsDeleting(null);
    }
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = async () => {
    // Reload users after update
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load users');
      }

      const { data: usersData } = await response.json();
      setUsers(usersData || []);
      
      // Update selected user if modal is still open
      if (selectedUser) {
        const updatedUser = usersData?.find((u: UserProfile) => u.id === selectedUser.id);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to reload users');
    }
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
          <h1 className="text-3xl font-bold text-white glow-text">
            User Management
          </h1>
          <p className="text-slate-400 mt-1">
            Manage all user accounts and permissions
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            className="gradient-primary hover:opacity-90"
            onClick={() => router.push('/admin/users/add')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-800/50 border-slate-600 text-black placeholder:text-black/70 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-400" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-slate-400">
              Manage user accounts and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-slate-400">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">No users found</h3>
                <p className="text-slate-400">
                  {searchTerm ? 'Try adjusting your search criteria' : 'No users have been registered yet'}
                </p>
              </div>
            ) : (
              <UserTable
                users={filteredUsers}
                onViewUser={handleViewUser}
                onDeleteUser={handleDeleteUser}
                isDeleting={isDeleting}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* User Details Modal */}
      <UserDetailsModal
        user={selectedUser}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
