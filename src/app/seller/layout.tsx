'use client';

import React, { useState } from 'react';

export const dynamic = 'force-dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

const sellerNavigation = [
  {
    name: 'Dashboard',
    href: '/seller',
    icon: 'LayoutDashboard',
  },
  {
    name: 'Inventory',
    href: '/seller/inventory',
    icon: 'Package',
    children: [
      { name: 'All Vehicles', href: '/seller/inventory' },
      { name: 'Add Vehicle', href: '/seller/inventory/add' },
    ],
  },
  {
    name: 'Tasks',
    href: '/seller/tasks',
    icon: 'CheckSquare',
  },
  {
    name: 'Sales',
    href: '/seller/sales',
    icon: 'TrendingUp',
    children: [
      { name: 'Orders', href: '/seller/sales/orders' },
      { name: 'Analytics', href: '/seller/sales/analytics' },
    ],
  },
  {
    name: 'Chat',
    href: '/seller/chat',
    icon: 'MessageCircle',
  },
  {
    name: 'Profile',
    href: '/seller/profile',
    icon: 'User',
  },
];

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const unreadCount = useUnreadMessages(currentUser?.id || null);

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
    <div className="min-h-screen bg-slate-900">
      <div className="grid grid-cols-12 min-h-screen">
        {/* Sidebar - col-3 on large screens, hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <Sidebar 
            navigation={sellerNavigation} 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            unreadCount={unreadCount}
          />
        </div>
        
        {/* Main Content - col-9 on large screens, col-12 on mobile */}
        <div className="col-span-12 lg:col-span-9">
          <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="p-6">
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
              navigation={sellerNavigation} 
              isOpen={sidebarOpen}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
