'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    if (!userId) return;

    // Subscribe to new messages
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          const newMessage = payload.new;
          
          // Create notification
          const notification = {
            id: `msg_${newMessage.id}`,
            type: 'message',
            title: 'New Message',
            message: `You received a new message`,
            timestamp: new Date().toISOString(),
            read: false,
          };

          setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 notifications
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: 'You received a new message',
              icon: '/favicon.ico',
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
