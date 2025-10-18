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
      <Sidebar 
        navigation={transporterNavigation} 
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
