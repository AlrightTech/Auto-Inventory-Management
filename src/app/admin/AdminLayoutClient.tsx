'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
