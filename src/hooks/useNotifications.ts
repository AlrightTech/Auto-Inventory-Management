'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

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
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tasks' },
        (payload) => {
          const t = payload.new as any;
          // If assigned_to matches user, notify
          if (t.assigned_to === userId) {
            pushNotification({
              id: `task_${t.id}`,
              type: 'task',
              title: 'New Task Assigned',
              message: t.task_name || 'A new task was assigned to you',
              timestamp: new Date().toISOString(),
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
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const pushNotification = (n: { id: string; type: string; title: string; message: string; timestamp: string }) => {
    setNotifications(prev => [{ ...n, read: false }, ...prev.slice(0, 9)]);
    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
      new Notification(n.title, { body: n.message, icon: '/favicon.ico' });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    markAsRead,
    clearAll,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}
