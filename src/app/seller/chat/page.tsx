'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserList } from '@/components/chat/UserList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageSquare, Users, Wifi, WifiOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { MessageWithSender, User } from '@/types';

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    username: 'Admin User',
    role: 'admin',
    isOnline: true,
    lastSeen: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'seller@example.com',
    username: 'Seller User',
    role: 'seller',
    isOnline: true,
    lastSeen: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    email: 'transporter@example.com',
    username: 'Transporter User',
    role: 'transporter',
    isOnline: false,
    lastSeen: '2024-10-17T10:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    email: 'momina@example.com',
    username: 'Momina',
    role: 'seller',
    isOnline: true,
    lastSeen: null,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '5',
    email: 'aftab@example.com',
    username: 'Aftab',
    role: 'transporter',
    isOnline: false,
    lastSeen: '2024-10-17T09:15:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
];

const mockMessages: MessageWithSender[] = [
  {
    id: '1',
    sender_id: '1',
    receiver_id: '2',
    content: 'Hello! How can I help you today?',
    read: true,
    created_at: '2024-10-17T10:00:00Z',
    sender: mockUsers[0],
  },
  {
    id: '2',
    sender_id: '2',
    receiver_id: '1',
    content: 'Hi! I have a question about my vehicle listing.',
    read: true,
    created_at: '2024-10-17T10:01:00Z',
    sender: mockUsers[1],
  },
  {
    id: '3',
    sender_id: '1',
    receiver_id: '2',
    content: 'Sure, what would you like to know?',
    read: false,
    created_at: '2024-10-17T10:02:00Z',
    sender: mockUsers[0],
  },
];

export default function SellerChatPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(mockUsers[0]);
  const [messages, setMessages] = useState<MessageWithSender[]>(mockMessages);
  const [isConnected] = useState(true);
  const [currentUser] = useState({ id: '2', role: 'seller' }); // Current seller user

  const handleSendMessage = async (content: string) => {
    if (!selectedUser) return;

    const newMessage: MessageWithSender = {
      id: Date.now().toString(),
      sender_id: currentUser.id,
      receiver_id: selectedUser.id,
      content,
      read: false,
      created_at: new Date().toISOString(),
    sender: {
      id: currentUser.id,
      email: 'seller@example.com',
      username: 'You',
      role: 'seller',
      isOnline: true,
      lastSeen: null,
      created_at: '2024-01-01T00:00:00Z',
    },
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // TODO: Send to API
    try {
      const supabase = createClient();
      await supabase.from('messages').insert({
        sender_id: newMessage.sender_id,
        receiver_id: newMessage.receiver_id,
        content: newMessage.content,
        read: newMessage.read,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

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
            Real-time messaging with admin, transporters, and other sellers.
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
                Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <UserList
                users={mockUsers.filter(user => user.id !== currentUser.id)}
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
                        {selectedUser.isOnline ? ' • Online' : ` • Last seen ${selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleTimeString() : 'Unknown'}`}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ChatWindow
                    messages={messages.filter(msg => 
                      (msg.sender_id === currentUser.id && msg.receiver_id === selectedUser.id) ||
                      (msg.sender_id === selectedUser.id && msg.receiver_id === currentUser.id)
                    )}
                    currentUserId={currentUser.id}
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
