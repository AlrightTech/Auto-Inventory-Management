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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="grid grid-cols-12 min-h-screen">
        {/* Sidebar - col-3 on large screens, hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3 h-screen overflow-hidden">
          <Sidebar unreadCount={unreadCount} />
        </div>
        
        {/* Main Content - col-12 on mobile, col-9 on large screens */}
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-screen">
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
