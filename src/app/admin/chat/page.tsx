'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserList } from '@/components/chat/UserList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { MessageSquare, Users, Wifi, WifiOff } from 'lucide-react';

// Mock data for demonstration
const mockUsers = [
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

const mockMessages = [
  {
    id: '1',
    sender_id: '2',
    receiver_id: '1',
    content: 'Hi! I have a question about the vehicle inspection process.',
    read: true,
    created_at: '2024-10-17T10:00:00Z',
    sender: mockUsers[1],
  },
  {
    id: '2',
    sender_id: '1',
    receiver_id: '2',
    content: 'Hello! I\'d be happy to help. What specific aspect of the inspection process would you like to know about?',
    read: true,
    created_at: '2024-10-17T10:02:00Z',
    sender: mockUsers[0],
  },
  {
    id: '3',
    sender_id: '2',
    receiver_id: '1',
    content: 'I need to know what documents are required for the ARB filing.',
    read: true,
    created_at: '2024-10-17T10:05:00Z',
    sender: mockUsers[1],
  },
  {
    id: '4',
    sender_id: '1',
    receiver_id: '2',
    content: 'For ARB filing, you\'ll need the vehicle title, inspection report, and any repair documentation. I can send you the complete checklist.',
    read: false,
    created_at: '2024-10-17T10:07:00Z',
    sender: mockUsers[0],
  },
];

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState(mockUsers[1]);
  const [messages, setMessages] = useState(mockMessages);
  const [isConnected] = useState(true);

  const handleSendMessage = (content: string) => {
    const newMessage = {
      id: Date.now().toString(),
      sender_id: '1', // Current user (admin)
      receiver_id: selectedUser.id,
      content,
      read: false,
      created_at: new Date().toISOString(),
      sender: mockUsers[0], // Admin user
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const handleUserSelect = (user: typeof mockUsers[0]) => {
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
            Real-time messaging with your team members.
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
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-400" />
                Team Members
              </CardTitle>
              <CardDescription className="text-slate-400">
                {mockUsers.filter(user => user.isOnline).length} online
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <UserList 
                users={mockUsers}
                selectedUser={selectedUser}
                onUserSelect={handleUserSelect}
              />
            </CardContent>
          </Card>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-3">
          <Card className="glass-card h-full flex flex-col">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-400" />
                {selectedUser.username}
                {selectedUser.isOnline && (
                  <div className="ml-2 w-2 h-2 bg-green-400 rounded-full"></div>
                )}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {selectedUser.isOnline ? 'Online' : `Last seen ${new Date(selectedUser.lastSeen || '').toLocaleTimeString()}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ChatWindow 
                messages={messages.filter(msg => 
                  (msg.sender_id === selectedUser.id && msg.receiver_id === '1') ||
                  (msg.sender_id === '1' && msg.receiver_id === selectedUser.id)
                )}
                currentUserId="1"
              />
              <div className="p-4 border-t border-slate-700/50">
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  placeholder={`Message ${selectedUser.username}...`}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
