'use client';

import { useState } from 'react';
import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, LogOut, Bell, Search, Menu } from 'lucide-react';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface User {
  id: string;
  email?: string;
}

interface HeaderProps {
  user?: User;
  onMenuClick?: () => void;
}

export function Header({ user, onMenuClick }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const router = useRouter();
  const { unreadCount } = useUnreadMessages(user?.id || null);
  const { notifications, markAsRead, markAllAsRead, unreadCount: notificationUnreadCount } = useNotifications(user?.id || null);
  
  // Total unread count from both messages and notifications
  const totalUnreadCount = unreadCount + notificationUnreadCount;

  // Load user role to determine correct task link and display role
  React.useEffect(() => {
    const loadUserRole = async () => {
      if (!user?.id) return;
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (profile) {
        setCurrentRole(profile.role);
      }
    };
    loadUserRole();
  }, [user?.id]);

  const getRoleDisplay = (role: string | null) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      router.push('/auth/login');
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email
      .split('@')[0]
      .split('.')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b border-gray-200 dark:border-slate-700 px-6 py-4 shadow-md" style={{ backgroundColor: 'var(--card-bg)' }}>
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and Search */}
        <div className="flex items-center space-x-4 flex-1">
          {/* Menu button for mobile */}
          {onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden control-panel"
              style={{ color: 'var(--text)' }}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            {isSearchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="flex items-center space-x-2"
              >
                <Input
                  placeholder="Search vehicles, tasks, events..."
                  className="control-panel"
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)', 
                    color: 'var(--text)' 
                  }}
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSearchOpen(false)}
                  className="control-panel"
                  style={{ color: 'var(--text)' }}
                >
                  ×
                </Button>
              </motion.div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(true)}
                className="control-panel"
                style={{ color: 'var(--text)' }}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            )}
          </motion.div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative control-panel"
                  style={{ color: 'var(--text)' }}
                >
                  <Bell className="w-5 h-5" />
                  {notificationUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                      {notificationUnreadCount > 9 ? '9+' : notificationUnreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 shadow-lg max-h-[500px] overflow-y-auto" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border)' }} align="end" forceMount>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <DropdownMenuLabel className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    Notifications {notificationUnreadCount > 0 && `(${notificationUnreadCount})`}
                  </DropdownMenuLabel>
                  {notificationUnreadCount > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllAsRead();
                      }}
                      className="text-xs hover:underline"
                      style={{ color: 'var(--accent)' }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <DropdownMenuSeparator style={{ backgroundColor: 'var(--border)' }} />
                {notifications.length === 0 && (
                  <div className="p-4 text-center" style={{ color: 'var(--subtext)' }}>No notifications</div>
                )}
                {notifications.slice(0, 10).map(n => {
                  // Determine correct link based on role and notification type
                  let link = n.link;
                  if (n.type === 'task' && link === '/tasks') {
                    if (currentRole === 'seller') {
                      link = '/seller/tasks';
                    } else if (currentRole === 'transporter') {
                      link = '/transporter/tasks';
                    } else if (currentRole === 'admin') {
                      link = '/admin/tasks';
                    }
                  }

                  return (
                    <DropdownMenuItem 
                      key={n.id} 
                      className="cursor-pointer" 
                      style={{ 
                        color: 'var(--text)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                      onClick={() => {
                        if (link && typeof window !== 'undefined') {
                          router.push(link);
                        }
                        if (!n.read) {
                          markAsRead(n.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="mt-1 flex-shrink-0">
                          <span className={`inline-block w-2 h-2 rounded-full ${n.read ? 'bg-gray-400 dark:bg-gray-500' : 'bg-blue-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-medium ${!n.read ? 'font-semibold' : ''}`} style={{ color: 'var(--text)' }}>
                            {n.title}
                          </div>
                          <div className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--subtext)' }}>{n.message}</div>
                          <div className="text-xs mt-1" style={{ color: 'var(--subtext)' }}>
                            {new Date(n.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                {notifications.length > 10 && (
                  <>
                    <DropdownMenuSeparator style={{ backgroundColor: 'var(--border)' }} />
                    <div className="p-2 text-center text-xs" style={{ color: 'var(--subtext)' }}>
                      Showing 10 of {notifications.length} notifications
                    </div>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>

          {/* User Menu */}
          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user.email || 'User'} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 shadow-lg" 
                  style={{ 
                    backgroundColor: 'var(--card-bg)', 
                    borderColor: 'var(--border)',
                    color: 'var(--text)'
                  }} 
                  align="end" 
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal" style={{ color: 'var(--text)' }}>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none" style={{ color: 'var(--text)' }}>
                        {user.email || 'User'}
                      </p>
                      <p className="text-xs leading-none" style={{ color: 'var(--subtext)' }}>
                        {getRoleDisplay(currentRole)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ backgroundColor: 'var(--border)' }} />
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    style={{ 
                      color: 'var(--text)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    style={{ 
                      color: 'var(--text)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ backgroundColor: 'var(--border)' }} />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="cursor-pointer"
                    style={{ 
                      color: '#ef4444',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
