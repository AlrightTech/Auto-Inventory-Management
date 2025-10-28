'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative overflow-hidden bg-transparent hover:bg-transparent border border-white/10 dark:border-white/10 rounded-full p-2 transition-all duration-300 hover:border-audi-neon/50 hover:shadow-audi-glow"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 text-audi-text-light dark:text-audi-text-dark transition-colors duration-300" />
          ) : (
            <Sun className="h-4 w-4 text-audi-text-light dark:text-audi-text-dark transition-colors duration-300" />
          )}
          
          {/* Audi EV Dashboard Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: theme === 'dark' 
                ? '0 0 20px rgba(0, 224, 255, 0.3), inset 0 0 20px rgba(0, 224, 255, 0.1)'
                : '0 0 10px rgba(0, 0, 0, 0.1)'
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Background glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full opacity-0"
        animate={{
          opacity: theme === 'dark' ? 0.1 : 0,
          background: 'radial-gradient(circle, rgba(0, 224, 255, 0.2) 0%, transparent 70%)'
        }}
        transition={{ duration: 0.3 }}
      />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
