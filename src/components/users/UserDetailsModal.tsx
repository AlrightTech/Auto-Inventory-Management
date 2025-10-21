'use client';

import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Mail,
  Shield,
  Calendar,
  Clock,
  X,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'seller' | 'transporter';
  created_at: string;
  last_sign_in_at?: string;
}

interface UserDetailsModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsModal({ user, isOpen, onClose }: UserDetailsModalProps) {
  if (!user) return null;

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400 border-red-500';
      case 'seller':
        return 'bg-green-500/20 text-green-400 border-green-500';
      case 'transporter':
        return 'bg-blue-500/20 text-blue-400 border-blue-500';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'seller':
        return <User className="w-4 h-4" />;
      case 'transporter':
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Full system access with administrative privileges';
      case 'seller':
        return 'Can manage inventory, tasks, and sales';
      case 'transporter':
        return 'Can browse vehicles and manage orders';
      default:
        return 'Standard user access';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card-strong border-slate-700 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span>User Details</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            View detailed information about this user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-card border-slate-700/50">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                    {user.username?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">
                      {user.username || 'No username'}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {user.email}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${getRoleColor(user.role)} border-current flex items-center space-x-1 w-fit`}
                  >
                    {getRoleIcon(user.role)}
                    <span className="capitalize">{user.role}</span>
                  </Badge>
                  <span className="text-slate-400 text-sm">
                    {getRoleDescription(user.role)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="glass-card border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Email Address</p>
                      <p className="text-white font-medium">{user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Username</p>
                      <p className="text-white font-medium">
                        {user.username || 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Account Created</p>
                      <p className="text-white font-medium">
                        {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-400">Last Sign In</p>
                      <p className="text-white font-medium">
                        {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end space-x-3"
          >
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Close
            </Button>
            <Button
              className="gradient-primary hover:opacity-90"
              onClick={() => {
                // TODO: Implement edit user functionality
                console.log('Edit user:', user.id);
              }}
            >
              Edit User
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




