'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatTime } from '@/lib/utils';
import { MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender?: {
    username: string;
    role: string;
  };
}

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
}

export function ChatWindow({ messages, currentUserId }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence>
        {messages.map((message, index) => {
          const isCurrentUser = message.sender_id === currentUserId;
          
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-[70%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src="" alt={message.sender?.username} />
                  <AvatarFallback className={`${getRoleColor(message.sender?.role || 'user')} text-white text-xs`}>
                    {getInitials(message.sender?.username || 'U')}
                  </AvatarFallback>
                </Avatar>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-4 py-2 rounded-2xl`}
                    style={{
                      backgroundColor: isCurrentUser 
                        ? (isDarkMode ? '#3b82f6' : '#dbeafe')
                        : (isDarkMode ? '#334155' : '#e5e7eb'),
                      color: isDarkMode ? '#ffffff' : '#1E1E1E',
                      borderRadius: isCurrentUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px'
                    }}
                  >
                    <p className="text-sm font-medium" style={{ 
                      color: isDarkMode ? '#ffffff' : '#1E1E1E' 
                    }}>
                      {!isCurrentUser && message.sender?.username && (
                        <span className="font-semibold mr-2" style={{ 
                          color: isDarkMode ? '#ffffff' : '#1E1E1E' 
                        }}>
                          {message.sender.username}:
                        </span>
                      )}
                      {message.content}
                    </p>
                  </div>
                  
                  {/* Timestamp */}
                  <div className={`flex items-center space-x-1 mt-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <span className="text-xs" style={{ color: 'var(--subtext)' }}>
                      {formatTime(message.created_at)}
                    </span>
                    {isCurrentUser && (
                      <div className="flex items-center space-x-1">
                        {message.read ? (
                          <div className="flex items-center space-x-0.5">
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          </div>
                        ) : (
                          <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Empty State */}
      {messages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full text-center"
        >
          <MessageCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">No messages yet</h3>
          <p className="text-slate-400">Start a conversation by sending a message below.</p>
        </motion.div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
