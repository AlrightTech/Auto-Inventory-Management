'use client';

import { ShieldX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AccessDeniedPage() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="text-center space-y-6 p-8" style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        maxWidth: '500px',
      }}>
        <div className="flex justify-center">
          <div className="p-4 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            <ShieldX className="w-16 h-16" style={{ color: '#ef4444' }} />
          </div>
        </div>
        
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            Access Denied
          </h1>
          <p className="text-lg" style={{ color: 'var(--subtext)' }}>
            You don't have permission to access this page.
          </p>
        </div>
        
        <p className="text-sm" style={{ color: 'var(--subtext)' }}>
          If you believe this is an error, please contact your administrator.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/admin">
            <Button
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
              }}
            >
              Go to Dashboard
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text)',
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
