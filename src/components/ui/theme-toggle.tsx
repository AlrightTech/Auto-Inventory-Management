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
      className="relative overflow-hidden rounded-xl border border-border bg-card hover:bg-accent/10 transition-all duration-300 hover:border-neon-blue/50 hover:shadow-neon group instrument-panel"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -180, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex items-center justify-center relative z-10"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 text-foreground group-hover:text-neon-blue transition-colors duration-300" />
          ) : (
            <Sun className="h-4 w-4 text-foreground group-hover:text-neon-blue transition-colors duration-300" />
          )}
        </motion.div>
      </AnimatePresence>
      
      {/* Neon glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-blue/0 via-neon-blue/10 to-neon-blue/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
