'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

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

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="grid grid-cols-12 min-h-screen">
        {/* Sidebar - col-3 on large screens, hidden on mobile */}
        <div className="hidden lg:block lg:col-span-3">
          <Sidebar 
            navigation={transporterNavigation} 
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
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
