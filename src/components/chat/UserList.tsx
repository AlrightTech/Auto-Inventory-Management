'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

import { User } from '@/types';

interface UserListProps {
  users: User[];
  selectedUser: User | null;
  onUserSelect: (user: User) => void;
}

export function UserList({ users, selectedUser, onUserSelect }: UserListProps) {
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-500';
      case 'seller':
        return 'bg-green-500';
      case 'transporter':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-2 p-4">
      {users.map((user, index) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onUserSelect(user)}
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-slate-700/50 ${
            selectedUser?.id === user.id 
              ? 'bg-blue-500/20 border border-blue-500/30' 
              : 'hover:border-slate-600'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={user.username} />
                <AvatarFallback className={`${getRoleColor(user.role)} text-white text-sm`}>
                  {getInitials(user.username)}
                </AvatarFallback>
              </Avatar>
              {user.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate">
                  {user.username}
                </p>
                {!user.isOnline && user.lastSeen && (
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRoleColor(user.role)} border-current text-white`}
                >
                  {user.role}
                </Badge>
                {user.isOnline && (
                  <span className="text-xs text-green-400">Online</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
