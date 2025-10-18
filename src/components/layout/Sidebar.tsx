'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckSquare,
  Package,
  AlertTriangle,
  Calendar,
  MessageSquare,
  MessageCircle,
  DollarSign,
  Car,
  Settings,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Search,
  Heart,
  ShoppingCart,
  User,
  TrendingUp,
} from 'lucide-react';

const defaultNavigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Task Management',
    href: '/admin/tasks',
    icon: CheckSquare,
  },
  {
    name: 'Inventory',
    icon: Package,
    children: [
      { name: 'All', href: '/admin/inventory' },
      { name: 'Buyer Withdrew', href: '/admin/inventory/buyer-withdrew' },
    ],
  },
  {
    name: 'ARB',
    href: '/admin/arb',
    icon: AlertTriangle,
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: Calendar,
  },
  {
    name: 'Chat',
    href: '/admin/chat',
    icon: MessageSquare,
  },
  {
    name: 'Sold',
    href: '/admin/sold',
    icon: DollarSign,
  },
  {
    name: 'Accounting',
    icon: BarChart3,
    children: [
      { name: 'Summary', href: '/admin/accounting' },
      { name: 'Purchases', href: '/admin/accounting/purchases' },
      { name: 'Sold', href: '/admin/accounting/sold' },
      { name: 'Reports', href: '/admin/accounting/reports' },
    ],
  },
  {
    name: 'VIN Decode',
    href: '/admin/vin-decode',
    icon: Car,
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'My Account', href: '/admin/settings' },
      { name: 'Staff', href: '/admin/settings/staff' },
      { name: 'Transporter', href: '/admin/settings/transporter' },
    ],
  },
];

interface NavigationItem {
  name: string;
  href?: string;
  icon: string | React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string }[];
}

interface SidebarProps {
  navigation?: NavigationItem[];
  isOpen?: boolean;
  onToggle?: () => void;
}

// Icon mapping for string-based icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CheckSquare,
  Package,
  AlertTriangle,
  Calendar,
  MessageSquare,
  MessageCircle,
  DollarSign,
  Car,
  Settings,
  BarChart3,
  Search,
  Heart,
  ShoppingCart,
  User,
  TrendingUp,
};

export function Sidebar({ navigation = defaultNavigation, isOpen = true, onToggle }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: { href: string }[]) => 
    children.some(child => pathname === child.href);

  const getIcon = (icon: string | React.ComponentType<{ className?: string }>) => {
    if (typeof icon === 'string') {
      const IconComponent = iconMap[icon];
      return IconComponent || Package; // fallback icon
    }
    return icon;
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isOpen && onToggle && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}
      
      <div className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card-strong border-r border-slate-700/50 flex flex-col transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-slate-700/50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white glow-text">Auto Inventory</h1>
              <p className="text-xs text-slate-400">Dashboard</p>
            </div>
          </motion.div>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {item.children ? (
              <div>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-slate-700/50",
                    isParentActive(item.children)
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-slate-300 hover:text-white"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    {React.createElement(getIcon(item.icon), { className: "w-5 h-5" })}
                    <span>{item.name}</span>
                  </div>
                  {expandedItems.includes(item.name) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                
                <AnimatePresence>
                  {expandedItems.includes(item.name) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-2 space-y-1"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            "block px-3 py-2 text-sm rounded-lg transition-all duration-200 hover:bg-slate-700/50",
                            isActive(child.href)
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "text-slate-400 hover:text-white"
                          )}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href={item.href!}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-slate-700/50",
                  isActive(item.href!)
                    ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 glow-border"
                    : "text-slate-300 hover:text-white"
                )}
              >
                {React.createElement(getIcon(item.icon), { className: "w-5 h-5" })}
                <span>{item.name}</span>
              </Link>
            )}
          </motion.div>
        ))}
      </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-500 text-center">
            <p>Auto Inventory v1.0</p>
            <p className="mt-1">© 2024 All rights reserved</p>
          </div>
        </div>
      </div>
    </>
  );
}
