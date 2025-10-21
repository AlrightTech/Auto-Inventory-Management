'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserList } from '@/components/chat/UserList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageSquare, Users, Wifi, WifiOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MessageWithSender, User } from '@/types';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

export default function AdminChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const supabase = createClient();
  const { markAsRead } = useUnreadMessages(currentUser?.id || null);

  // Function to refresh user list with latest message timestamps
  const refreshUserList = async () => {
    if (!currentUser) return;
    
    try {
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', currentUser.id);

      if (allProfiles) {
        const usersWithStatusAndLatestMessage = await Promise.all(
          allProfiles.map(async (profile: any) => {
            const { data: status } = await supabase
              .from('user_status')
              .select('is_online, last_seen')
              .eq('user_id', profile.id)
              .single();

            // Get the latest message timestamp between current user and this user
            const { data: latestMessage } = await supabase
              .from('messages')
              .select('created_at')
              .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${currentUser.id})`)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            return {
              id: profile.id,
              email: profile.email,
              username: profile.username || profile.email.split('@')[0],
              role: profile.role,
              isOnline: status?.is_online || false,
              lastSeen: status?.last_seen || null,
              created_at: profile.created_at,
              latestMessageAt: latestMessage?.created_at || null,
            };
          })
        );
        
        // Sort users by latest message timestamp (most recent first)
        const sortedUsers = usersWithStatusAndLatestMessage.sort((a, b) => {
          if (!a.latestMessageAt && !b.latestMessageAt) return 0;
          if (!a.latestMessageAt) return 1;
          if (!b.latestMessageAt) return -1;
          return new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime();
        });
        
        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error refreshing user list:', error);
    }
  };

  // Load current user and other users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (profile) {
            setCurrentUser({
              id: user.id,
              email: user.email || '',
              username: profile.username || user.email?.split('@')[0] || 'User',
              role: profile.role,
              isOnline: true,
              lastSeen: null,
              created_at: user.created_at,
            });
          }
        }

        // Get all other users with their latest message timestamps
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('*')
          .neq('id', user?.id);

        if (allProfiles) {
          const usersWithStatusAndLatestMessage = await Promise.all(
            allProfiles.map(async (profile: any) => {
              const { data: status } = await supabase
                .from('user_status')
                .select('is_online, last_seen')
                .eq('user_id', profile.id)
                .single();

              // Get the latest message timestamp between current user and this user
              const { data: latestMessage } = await supabase
                .from('messages')
                .select('created_at')
                .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${profile.id}),and(sender_id.eq.${profile.id},receiver_id.eq.${user?.id})`)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

              return {
                id: profile.id,
                email: profile.email,
                username: profile.username || profile.email.split('@')[0],
                role: profile.role,
                isOnline: status?.is_online || false,
                lastSeen: status?.last_seen || null,
                created_at: profile.created_at,
                latestMessageAt: latestMessage?.created_at || null,
              };
            })
          );
          
          // Sort users by latest message timestamp (most recent first)
          const sortedUsers = usersWithStatusAndLatestMessage.sort((a, b) => {
            if (!a.latestMessageAt && !b.latestMessageAt) return 0;
            if (!a.latestMessageAt) return 1;
            if (!b.latestMessageAt) return -1;
            return new Date(b.latestMessageAt).getTime() - new Date(a.latestMessageAt).getTime();
          });
          
          setUsers(sortedUsers);
          if (sortedUsers.length > 0) {
            setSelectedUser(sortedUsers[0]);
          }
        }
      } catch (error) {
        console.error('Error loading users:', error);
      }
    };

    loadUsers();
  }, [supabase]);

  // Load messages for selected user
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const loadMessages = async () => {
      try {
        const { data: messagesData } = await supabase
          .from('messages')
          .select(`
            *,
            sender:profiles!messages_sender_id_fkey(*)
          `)
          .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${currentUser.id})`)
          .order('created_at', { ascending: true });

        if (messagesData) {
          const messagesWithSender: MessageWithSender[] = messagesData.map((msg: any) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            receiver_id: msg.receiver_id,
            content: msg.content,
            read: msg.read,
            created_at: msg.created_at,
            sender: {
              id: msg.sender.id,
              email: msg.sender.email,
              username: msg.sender.username || msg.sender.email.split('@')[0],
              role: msg.sender.role,
              isOnline: true,
              lastSeen: null,
              created_at: msg.sender.created_at,
            },
          }));
          setMessages(messagesWithSender);
          
          // Mark unread messages as read
          const unreadMessages = messagesWithSender.filter(
            msg => msg.receiver_id === currentUser.id && !msg.read
          );
          
          for (const message of unreadMessages) {
            await markAsRead(message.id);
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    };

    loadMessages();
  }, [selectedUser, currentUser, supabase, markAsRead]);

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUser) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload: any) => {
          const newMessage = payload.new as {
            id: string;
            sender_id: string;
            receiver_id: string;
            content: string;
            read: boolean;
            created_at: string;
          };
          if (
            (newMessage.sender_id === currentUser.id && newMessage.receiver_id === selectedUser?.id) ||
            (newMessage.sender_id === selectedUser?.id && newMessage.receiver_id === currentUser.id)
          ) {
            // Load sender profile
            supabase
              .from('profiles')
              .select('*')
              .eq('id', newMessage.sender_id)
              .single()
              .then(({ data: sender }) => {
                if (sender) {
                  const messageWithSender: MessageWithSender = {
                    id: newMessage.id,
                    sender_id: newMessage.sender_id,
                    receiver_id: newMessage.receiver_id,
                    content: newMessage.content,
                    read: newMessage.read,
                    created_at: newMessage.created_at,
                    sender: {
                      id: sender.id,
                      email: sender.email,
                      username: sender.username || sender.email.split('@')[0],
                      role: sender.role,
                      isOnline: true,
                      lastSeen: null,
                      created_at: sender.created_at,
                    },
                  };
                  setMessages(prev => [...prev, messageWithSender]);
                  
                  // Refresh user list to update sorting
                  refreshUserList();
                }
              });
          }
        }
      )
      .subscribe();

    setIsConnected(true);

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [currentUser, selectedUser, supabase]);

  const handleSendMessage = async (content: string) => {
    if (!selectedUser || !currentUser) return;

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUser.id,
        receiver_id: selectedUser.id,
        content,
        read: false,
      });

      if (error) {
        console.error('Error sending message:', error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Mark messages as read when viewing them
  const markMessagesAsRead = async (senderId: string) => {
    if (!currentUser) return;

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', currentUser.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking messages as read:', error);
    } else {
      // Update local state immediately for better UX
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.sender_id === senderId && msg.receiver_id === currentUser.id && !msg.read
            ? { ...msg, read: true }
            : msg
        )
      );
    }
  };

  // Mark messages as read when user is selected
  useEffect(() => {
    if (selectedUser && currentUser) {
      markMessagesAsRead(selectedUser.id);
    }
  }, [selectedUser, currentUser]);

  // Update messages when they are marked as read
  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const channel = supabase
      .channel(`messages_read_${currentUser.id}_${selectedUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          const updatedMessage = payload.new as MessageWithSender;
          if (updatedMessage.sender_id === selectedUser.id) {
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.id === updatedMessage.id ? updatedMessage : msg
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, selectedUser, supabase]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white glow-text">
            Live Chat
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time messaging with sellers and transporters
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-green-400">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-400">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Chat Interface */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]"
      >
        {/* User List */}
        <div className="lg:col-span-1">
          <Card className="glass-card h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Contacts ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <UserList
                users={users}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="glass-card h-full flex flex-col">
            {selectedUser ? (
              <>
                <CardHeader className="pb-3 border-b border-slate-700/50">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${selectedUser.isOnline ? 'bg-green-400' : 'bg-slate-400'}`} />
                    <div>
                      <CardTitle className="text-lg text-white">
                        {selectedUser.username}
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                        {selectedUser.isOnline ? ' • Online' : ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ChatWindow
                    messages={messages}
                    currentUserId={currentUser?.id || ''}
                  />
                  <div className="p-4 border-t border-slate-700/50">
                    <MessageInput
                      onSendMessage={handleSendMessage}
                      placeholder={`Message ${selectedUser.username}...`}
                    />
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a contact</h3>
                  <p className="text-slate-400">Choose someone to start a conversation</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </motion.div>
    </div>
  );
}