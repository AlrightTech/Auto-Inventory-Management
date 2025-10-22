'use client';

import React, { useState } from 'react';

export const dynamic = 'force-dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const transporterNavigation = [
  {
    name: 'Dashboard',
    href: '/transporter',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Browse Vehicles',
    href: '/transporter/browse',
    icon: 'Search',
  },
  {
    name: 'Favorites',
    href: '/transporter/favorites',
    icon: 'Heart',
  },
  {
    name: 'Purchase',
    href: '/transporter/purchase',
    icon: 'ShoppingCart',
  },
  {
    name: 'Orders',
    href: '/transporter/orders',
    icon: 'Package',
  },
  {
    name: 'Tasks',
    href: '/transporter/tasks',
    icon: 'CheckSquare',
  },
  {
    name: 'Chat',
    href: '/transporter/chat',
    icon: 'MessageCircle',
  },
  {
    name: 'Profile',
    href: '/transporter/profile',
    icon: 'User',
  },
];

export default function TransporterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const { unreadCount } = useUnreadMessages(currentUser?.id || null);

  // Load current user
  React.useEffect(() => {
    const loadCurrentUser = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser({ id: user.id });
      }
    };
    loadCurrentUser();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="grid grid-cols-12 min-h-screen gap-0">
        {/* Sidebar - col-3 on large screens, hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3 h-screen overflow-hidden">
          <Sidebar 
            navigation={transporterNavigation} 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            unreadCount={unreadCount}
          />
        </div>
        
        {/* Main Content - col-9 on large screens, col-12 on mobile */}
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-screen">
          <Header user={currentUser} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10">
            <Sidebar 
              navigation={transporterNavigation} 
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
