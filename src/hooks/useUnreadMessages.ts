'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUnreadMessages(userId: string | null) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('id', messageId)
      .eq('receiver_id', userId);

    if (!error) {
      // Refetch count after marking as read
      const { data } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .eq('read', false);
      
      if (data) {
        setUnreadCount(data.length);
      }
    }
  };

  useEffect(() => {
    if (!userId) return;

    const fetchUnreadCount = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id')
        .eq('receiver_id', userId)
        .eq('read', false);

      if (data) {
        setUnreadCount(data.length);
      }
    };

    fetchUnreadCount();

    // Subscribe to all message changes (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('unread_messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Message change detected:', payload);
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return { unreadCount, markAsRead };
}
