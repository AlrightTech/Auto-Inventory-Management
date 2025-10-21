'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Mail,
  Shield,
  User,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'seller' | 'transporter';
  created_at: string;
  last_sign_in_at?: string;
}

interface UserTableProps {
  users: UserProfile[];
  onViewUser: (user: UserProfile) => void;
  onDeleteUser: (userId: string, userEmail: string) => void;
  isDeleting: string | null;
}

export function UserTable({ users, onViewUser, onDeleteUser, isDeleting }: UserTableProps) {
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-700/50">
            <th className="text-left p-4 text-slate-300 font-medium">Name</th>
            <th className="text-left p-4 text-slate-300 font-medium">Email</th>
            <th className="text-left p-4 text-slate-300 font-medium">Role</th>
            <th className="text-left p-4 text-slate-300 font-medium">Created</th>
            <th className="text-left p-4 text-slate-300 font-medium">Last Sign In</th>
            <th className="text-left p-4 text-slate-300 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <motion.tr
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
            >
              <td className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.username?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-white font-medium">
                      {user.username || 'No username'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300">{user.email}</span>
                </div>
              </td>
              <td className="p-4">
                <Badge 
                  variant="outline" 
                  className={`${getRoleColor(user.role)} border-current flex items-center space-x-1 w-fit`}
                >
                  {getRoleIcon(user.role)}
                  <span className="capitalize">{user.role}</span>
                </Badge>
              </td>
              <td className="p-4">
                <span className="text-slate-300">
                  {formatDate(user.created_at)}
                </span>
              </td>
              <td className="p-4">
                <span className="text-slate-300">
                  {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                </span>
              </td>
              <td className="p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-white"
                      disabled={isDeleting === user.id}
                    >
                      {isDeleting === user.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      ) : (
                        <MoreHorizontal className="w-4 h-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card-strong border-slate-700" align="end">
                    <DropdownMenuItem 
                      className="text-slate-200 hover:bg-slate-700/50"
                      onClick={() => onViewUser(user)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-400 hover:bg-red-500/10"
                      onClick={() => onDeleteUser(user.id, user.email)}
                      disabled={user.role === 'admin'} // Prevent deleting admin users
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

