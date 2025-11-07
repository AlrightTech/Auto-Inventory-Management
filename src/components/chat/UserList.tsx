'use client';

import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

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
          className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            selectedUser?.id === user.id 
              ? 'bg-blue-500/20 border border-blue-500/30' 
              : ''
          }`}
          style={{
            backgroundColor: selectedUser?.id === user.id 
              ? 'rgba(59, 130, 246, 0.1)' 
              : 'transparent',
            borderColor: selectedUser?.id === user.id 
              ? 'rgba(59, 130, 246, 0.3)' 
              : 'var(--border)',
            borderWidth: '1px',
            borderStyle: 'solid'
          }}
          onMouseEnter={(e) => {
            if (selectedUser?.id !== user.id) {
              e.currentTarget.style.backgroundColor = 'var(--muted)';
            }
          }}
          onMouseLeave={(e) => {
            if (selectedUser?.id !== user.id) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
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
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 rounded-full" style={{ borderColor: 'var(--card-bg)' }}></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                  {user.username}
                </p>
                {user.isOnline && (
                  <span className="text-xs" style={{ color: '#10b981' }}>Online</span>
                )}
              </div>
              
              <div className="flex items-center space-x-2 mt-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getRoleColor(user.role)} border-current text-white`}
                >
                  {user.role}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
