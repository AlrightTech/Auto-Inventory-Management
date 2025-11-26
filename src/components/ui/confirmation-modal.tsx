'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  onClose: () => void;
}

export function ConfirmationModal({ isOpen, options, onClose }: ConfirmationModalProps) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = React.useState(false);

  if (!options) return null;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await options.onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (options.onCancel) {
      options.onCancel();
    }
    onClose();
  };

  const variant = options.variant || 'danger';
  const confirmText = options.confirmText || 'Confirm';
  const cancelText = options.cancelText || 'Cancel';

  // Color scheme based on variant
  const variantStyles = {
    danger: {
      iconColor: '#ef4444', // red-500
      confirmBg: '#ef4444',
      confirmHover: '#dc2626',
      borderColor: 'rgba(239, 68, 68, 0.3)',
    },
    warning: {
      iconColor: '#f59e0b', // amber-500
      confirmBg: '#f59e0b',
      confirmHover: '#d97706',
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    info: {
      iconColor: '#3b82f6', // blue-500
      confirmBg: '#3b82f6',
      confirmHover: '#2563eb',
      borderColor: 'rgba(59, 130, 246, 0.3)',
    },
  };

  const styles = variantStyles[variant];

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent 
        className="max-w-md"
        style={{
          backgroundColor: theme === 'dark' ? 'var(--card-bg)' : '#ffffff',
          borderColor: styles.borderColor,
          borderWidth: '1px',
          zIndex: 102,
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `${styles.iconColor}15`,
              }}
            >
              <AlertTriangle 
                className="w-5 h-5" 
                style={{ color: styles.iconColor }}
              />
            </div>
            <DialogTitle
              style={{
                color: theme === 'dark' ? 'var(--foreground)' : 'var(--foreground)',
                fontSize: '1.25rem',
                fontWeight: '600',
              }}
            >
              {options.title}
            </DialogTitle>
          </div>
          <DialogDescription
            style={{
              color: theme === 'dark' ? 'var(--muted-foreground)' : 'var(--muted-foreground)',
              marginTop: '0.5rem',
              lineHeight: '1.5',
            }}
          >
            {options.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 mt-6">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            style={{
              borderColor: 'var(--border)',
              color: theme === 'dark' ? 'var(--foreground)' : 'var(--foreground)',
              backgroundColor: 'transparent',
            }}
            className="hover:bg-opacity-10"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            style={{
              backgroundColor: styles.confirmBg,
              color: '#ffffff',
              border: 'none',
            }}
            className="hover:opacity-90 transition-opacity"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.confirmHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.confirmBg;
            }}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

