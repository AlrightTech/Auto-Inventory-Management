'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ImpersonationBanner } from '@/components/users/ImpersonationBanner';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

interface User {
  id: string;
  email?: string;
}

interface AdminLayoutClientProps {
  user: User;
  children: React.ReactNode;
}

export function AdminLayoutClient({ user, children }: AdminLayoutClientProps) {
  const { unreadCount } = useUnreadMessages(user.id);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="flex h-screen">
        {/* Sidebar - fixed width on large screens, hidden on mobile */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <Sidebar unreadCount={unreadCount} />
        </div>
        
        {/* Main Content - flex-1 to take remaining space */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header user={user} />
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-full">
              <ImpersonationBanner />
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
