'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  placeholder?: string;
}

export function MessageInput({ onSendMessage, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Simulate typing indicator
    if (e.target.value && !isTyping) {
      setIsTyping(true);
    } else if (!e.target.value && isTyping) {
      setIsTyping(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="flex items-end space-x-3"
    >

      {/* Message Input */}
      <div className="flex-1 relative">
        <Textarea
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="min-h-[40px] max-h-32 resize-none pr-12"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--border)',
            color: 'var(--text)',
            borderRadius: '12px'
          }}
          rows={1}
        />
        
        {/* Emoji Button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
        >
          <Smile className="w-4 h-4" />
        </Button>
      </div>

      {/* Send Button */}
      <Button
        type="submit"
        disabled={!message.trim()}
        className="h-10 w-10 p-0 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--accent)',
          color: 'white',
          borderRadius: '12px'
        }}
      >
        <Send className="w-4 h-4" />
      </Button>
    </motion.form>
  );
}
