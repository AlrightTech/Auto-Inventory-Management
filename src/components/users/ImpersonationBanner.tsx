'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function ImpersonationBanner() {
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if we're impersonating by checking cookie
    const checkImpersonation = async () => {
      try {
        const response = await fetch('/api/users/check-impersonation');
        if (response.ok) {
          const data = await response.json();
          if (data.isImpersonating) {
            setIsImpersonating(true);
            setAdminUsername(data.adminUsername);
          }
        }
      } catch (error) {
        console.error('Error checking impersonation:', error);
      }
    };

    checkImpersonation();
  }, []);

  const handleRestoreAdmin = async () => {
    try {
      const response = await fetch('/api/users/restore-admin', {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to restore admin session');
      }

      toast.success('Admin session restored');
      setIsImpersonating(false);
      setAdminUsername(null);
      router.refresh();
    } catch (error) {
      console.error('Error restoring admin session:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to restore admin session');
    }
  };

  if (!isImpersonating) return null;

  return (
    <Alert 
      className="border-yellow-500/50 bg-yellow-500/10 mb-4"
      style={{
        borderColor: '#eab308',
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
      }}
    >
      <Shield className="h-4 w-4" style={{ color: '#eab308' }} />
      <AlertDescription className="flex items-center justify-between">
        <span style={{ color: 'var(--text)' }}>
          You are viewing this account as: <strong>{adminUsername || 'User'}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestoreAdmin}
          style={{
            borderColor: '#eab308',
            color: '#eab308',
          }}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Return to Admin
        </Button>
      </AlertDescription>
    </Alert>
  );
}

