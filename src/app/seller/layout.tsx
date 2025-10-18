'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

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

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar 
        navigation={sellerNavigation} 
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
