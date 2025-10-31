'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'task' | 'message' | 'event';
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

  useEffect(() => {
    if (!userId) return;

    // Get task link based on role
    const getTaskLink = (): string => {
      if (userRole === 'seller') return '/seller/tasks';
      if (userRole === 'transporter') return '/transporter/tasks';
      if (userRole === 'admin') return '/admin/tasks';
      return '/tasks'; // fallback
    };

    // Combine messages, tasks, and events subscriptions into one channel
    const channel = supabase.channel(`notifications_${userId}`)
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
            link: userRole === 'seller' ? '/seller/chat' : userRole === 'transporter' ? '/transporter/chat' : '/chat',
            metadata: { messageId: m.id },
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const t = payload.new as any;
          // If assigned_to matches user, notify (works for both seller and transporter roles)
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
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'events' },
        (payload) => {
          const e = payload.new as any;
          if (e.assigned_to === userId) {
            pushNotification({
              id: `event_${e.id}`,
              type: 'event',
              title: 'New Event Scheduled',
              message: e.title || 'You have a new event',
              timestamp: new Date().toISOString(),
              read: false,
              link: '/events',
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
  }, [userId, userRole, supabase]);

  const pushNotification = (n: Notification) => {
    setNotifications(prev => [n, ...prev.slice(0, 19)]); // Keep last 20 notifications
    
    // Show browser notification
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(n.title, { 
        body: n.message, 
        icon: '/favicon.ico',
        tag: n.id, // Prevent duplicate notifications
      });
    }

    // Show toast notification for tasks
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
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
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
