'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'task' | 'message' | 'event' | 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  metadata?: any;
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const supabase = createClient();

  // Load user role once
  useEffect(() => {
    if (!userId) return;

    const loadUserRole = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      if (profile) {
        setUserRole(profile.role);
      }
    };

    loadUserRole();
  }, [userId, supabase]);

  // Load existing notifications from database
  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      if (data) {
        const dbNotifications: Notification[] = data.map((n: any) => ({
          id: n.id,
          type: n.type as Notification['type'],
          title: n.title,
          message: n.message,
          timestamp: n.created_at,
          read: n.read,
          metadata: {},
        }));
        setNotifications(dbNotifications);
      }
    };

    loadNotifications();
  }, [userId, supabase]);

  // Define pushNotification function before using it in subscriptions
  const pushNotification = React.useCallback((n: Notification) => {
    setNotifications(prev => [n, ...prev.slice(0, 49)]); // Keep last 50 notifications
    
    // Show browser notification
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(n.title, { 
        body: n.message, 
        icon: '/favicon.ico',
        tag: n.id, // Prevent duplicate notifications
      });
    }

    // Show toast notification based on type
    if (n.type === 'task') {
      toast.success(n.title, {
        description: n.message,
        duration: 5000,
        action: n.link ? {
          label: 'View Task',
          onClick: () => {
            if (typeof window !== 'undefined' && n.link) {
              window.location.href = n.link;
            }
          },
        } : undefined,
      });
    } else if (n.type === 'message') {
      toast.info(n.title, {
        description: n.message,
        duration: 4000,
      });
    } else if (n.type === 'event') {
      toast.info(n.title, {
        description: n.message,
        duration: 4000,
      });
    } else if (n.type === 'success') {
      toast.success(n.title, {
        description: n.message,
        duration: 4000,
      });
    } else if (n.type === 'warning') {
      toast.warning(n.title, {
        description: n.message,
        duration: 4000,
      });
    } else if (n.type === 'error') {
      toast.error(n.title, {
        description: n.message,
        duration: 5000,
      });
    } else {
      // Default for 'info' type
      toast.info(n.title, {
        description: n.message,
        duration: 4000,
      });
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    // Get task link based on role
    const getTaskLink = (): string => {
      if (userRole === 'seller') return '/seller/tasks';
      if (userRole === 'transporter') return '/transporter/tasks';
      if (userRole === 'admin') return '/admin/tasks';
      return '/tasks'; // fallback
    };

    // Get chat link based on role
    const getChatLink = (): string => {
      if (userRole === 'seller') return '/seller/chat';
      if (userRole === 'transporter') return '/transporter/chat';
      if (userRole === 'admin') return '/admin/chat';
      return '/chat';
    };

    // Combine messages, tasks, events, and database notifications subscriptions into one channel
    const channel = supabase.channel(`notifications_${userId}`)
      // Subscribe to database notifications table
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          const n = payload.new as any;
          const notification: Notification = {
            id: n.id,
            type: n.type as Notification['type'],
            title: n.title,
            message: n.message,
            timestamp: n.created_at,
            read: n.read,
            metadata: {},
          };
          pushNotification(notification);
        }
      )
      // Subscribe to message updates
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
        (payload) => {
          const m = payload.new as any;
          pushNotification({
            id: `msg_${m.id}`,
            type: 'message',
            title: 'New Message',
            message: 'You received a new message',
            timestamp: new Date().toISOString(),
            read: false,
            link: getChatLink(),
            metadata: { messageId: m.id },
          });
        }
      )
      // Subscribe to task assignments
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const t = payload.new as any;
          // If assigned_to matches user, notify (works for admin, seller, and transporter roles)
          if (t.assigned_to === userId) {
            const taskLink = getTaskLink();
            const dueDate = t.due_date ? new Date(t.due_date).toLocaleDateString() : '';
            const categoryLabel = t.category 
              ? t.category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              : '';
            
            const taskMessage = t.task_name 
              ? `${t.task_name}${dueDate ? ` (Due: ${dueDate})` : ''}${categoryLabel ? ` - ${categoryLabel}` : ''}`
              : 'A new task was assigned to you';

            pushNotification({
              id: `task_${t.id}`,
              type: 'task',
              title: 'New Task Assigned',
              message: taskMessage,
              timestamp: new Date().toISOString(),
              read: false,
              link: taskLink,
              metadata: { 
                taskId: t.id, 
                taskName: t.task_name,
                dueDate: t.due_date,
                category: t.category,
                vehicleId: t.vehicle_id,
              },
            });
          }
        }
      )
      // Subscribe to event assignments
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          const e = payload.new as any;
          if (e.assigned_to === userId) {
            const eventLink = userRole === 'admin' ? '/admin/events' : '/events';
            pushNotification({
              id: `event_${e.id}`,
              type: 'event',
              title: 'New Event Scheduled',
              message: e.title || 'You have a new event',
              timestamp: new Date().toISOString(),
              read: false,
              link: eventLink,
              metadata: { eventId: e.id },
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if (typeof window !== 'undefined' && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, userRole, supabase, pushNotification]);

  const markAsRead = async (notificationId: string) => {
    // Update local state immediately
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );

    // Update in database if it's a database notification (not a generated one)
    if (notificationId.startsWith('msg_') || notificationId.startsWith('task_') || notificationId.startsWith('event_')) {
      // These are generated notifications, no need to update database
      return;
    }

    // Update database notification
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Update local state immediately
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );

    // Update all unread database notifications
    if (userId) {
      try {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userId)
          .eq('read', false);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}
