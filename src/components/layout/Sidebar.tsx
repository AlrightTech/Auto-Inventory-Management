'use client';

import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PERMISSIONS } from '@/lib/permissions';
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
  Users,
  FileText,
  Activity,
  LineChart,
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href?: string;
  icon: string | React.ComponentType<{ className?: string }>;
  children?: { name: string; href: string; permission?: string }[];
  permission?: string | string[];
}

const defaultNavigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    permission: PERMISSIONS.DASHBOARD.VIEW,
  },
  {
    name: 'Task Management',
    href: '/admin/tasks',
    icon: CheckSquare,
    permission: PERMISSIONS.TASKS.VIEW,
  },
  {
    name: 'Inventory',
    icon: Package,
    permission: PERMISSIONS.INVENTORY.VIEW,
    children: [
      { name: 'All', href: '/admin/inventory', permission: PERMISSIONS.INVENTORY.VIEW },
      { name: 'Buyer Withdrew', href: '/admin/inventory/buyer-withdrew', permission: PERMISSIONS.INVENTORY.VIEW },
    ],
  },
  {
    name: 'ARB',
    href: '/admin/arb',
    icon: AlertTriangle,
    permission: PERMISSIONS.ARB.VIEW,
  },
  {
    name: 'Reports',
    icon: LineChart,
    permission: PERMISSIONS.REPORTS.PROFIT_CAR,
    children: [
      { name: 'Profit Per Car', href: '/admin/reports/profit-per-car', permission: PERMISSIONS.REPORTS.PROFIT_CAR },
      { name: 'Weekly Summary', href: '/admin/reports/weekly-summary', permission: PERMISSIONS.REPORTS.PROFIT_WEEKLY },
      { name: 'Monthly Summary', href: '/admin/reports/monthly-summary', permission: PERMISSIONS.REPORTS.PROFIT_MONTHLY },
      { name: 'ARB Reports', href: '/admin/reports/arb', permission: PERMISSIONS.REPORTS.ARB_ACTIVITY },
      { name: 'Sales Reports', href: '/admin/reports/sales', permission: PERMISSIONS.REPORTS.SOLD_WEEKLY },
      { name: 'Missing Titles', href: '/admin/reports/missing-titles', permission: PERMISSIONS.REPORTS.MISSING_TITLES },
    ],
  },
  {
    name: 'Events',
    href: '/admin/events',
    icon: Calendar,
    permission: PERMISSIONS.EVENTS.VIEW,
  },
  {
    name: 'Chat',
    href: '/admin/chat',
    icon: MessageSquare,
    permission: PERMISSIONS.CHAT.VIEW,
  },
  {
    name: 'Sold',
    href: '/admin/sold',
    icon: DollarSign,
    permission: PERMISSIONS.SOLD.VIEW,
  },
  {
    name: 'Accounting',
    icon: BarChart3,
    permission: PERMISSIONS.ACCOUNTING.VIEW,
    children: [
      { name: 'Summary', href: '/admin/accounting', permission: PERMISSIONS.ACCOUNTING.VIEW },
      { name: 'Purchases', href: '/admin/accounting/purchases', permission: PERMISSIONS.ACCOUNTING.VIEW },
      { name: 'Sold', href: '/admin/accounting/sold', permission: PERMISSIONS.ACCOUNTING.VIEW },
      { name: 'Reports', href: '/admin/accounting/reports', permission: PERMISSIONS.ACCOUNTING.VIEW },
    ],
  },
  {
    name: 'VIN Decode',
    href: '/admin/vin-decode',
    icon: Car,
    permission: PERMISSIONS.VIN_DECODE.VIEW,
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: Users,
    permission: PERMISSIONS.SYSTEM.USERS_VIEW,
  },
  {
    name: 'Settings',
    icon: Settings,
    permission: PERMISSIONS.SETTINGS.VIEW,
    children: [
      { name: 'General', href: '/admin/settings', permission: PERMISSIONS.SETTINGS.VIEW },
      { name: 'Roles & Permissions', href: '/admin/settings/roles', permission: PERMISSIONS.ROLES.VIEW },
      { name: 'Dropdowns', href: '/admin/settings/dropdowns', permission: PERMISSIONS.SETTINGS.DROPDOWNS_MANAGE },
      { name: 'Staff', href: '/admin/settings/staff', permission: PERMISSIONS.SETTINGS.STAFF_MANAGE },
      { name: 'Transporter', href: '/admin/settings/transporter', permission: PERMISSIONS.SETTINGS.TRANSPORTER_MANAGE },
    ],
  },
  {
    name: 'Activity Logs',
    href: '/admin/activity-logs',
    icon: Activity,
    permission: PERMISSIONS.SYSTEM.ACTIVITY_LOGS,
  },
];

interface SidebarProps {
  navigation?: NavigationItem[];
  isOpen?: boolean;
  onToggle?: () => void;
  unreadCount?: number;
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
  Users,
  FileText,
  Activity,
  LineChart,
};

// Memoized navigation item component
const NavItem = React.memo(({ 
  item, 
  isActive, 
  isParentActive, 
  expandedItems, 
  toggleExpanded, 
  getIcon,
  unreadCount 
}: {
  item: NavigationItem;
  isActive: (href: string) => boolean;
  isParentActive: (children: { href: string }[]) => boolean;
  expandedItems: string[];
  toggleExpanded: (name: string) => void;
  getIcon: (icon: string | React.ComponentType<{ className?: string }>) => React.ComponentType<{ className?: string }>;
  unreadCount: number;
}) => {
  if (item.children) {
    const parentActive = isParentActive(item.children);
    const isExpanded = expandedItems.includes(item.name);
    
    return (
      <div>
        <button
          onClick={() => toggleExpanded(item.name)}
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg",
            "hover:bg-opacity-80"
          )}
          style={parentActive ? { 
            backgroundColor: 'var(--accent)', 
            color: 'white',
            boxShadow: '0 2px 8px rgba(0, 191, 255, 0.3)',
            borderLeft: '3px solid var(--accent)'
          } : { 
            backgroundColor: 'transparent',
            color: 'var(--text)',
            borderLeft: '3px solid transparent'
          }}
        >
          <div className="flex items-center space-x-3">
            <div style={{ color: parentActive ? 'white' : 'var(--text)' }}>
              {(() => {
                const IconComponent = getIcon(item.icon);
                return <IconComponent className="w-5 h-5" />;
              })()}
            </div>
            <span style={{ color: parentActive ? 'white' : 'var(--text)' }}>{item.name}</span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" style={{ color: parentActive ? 'white' : 'var(--text)' }} />
          ) : (
            <ChevronRight className="w-4 h-4" style={{ color: parentActive ? 'white' : 'var(--text)' }} />
          )}
        </button>
        
        {isExpanded && (
          <div
            className="ml-8 mt-1 space-y-0.5 border-l pl-3"
            style={{ borderColor: 'var(--border)' }}
          >
            {item.children.map((child) => (
              <PermissionGate
                key={child.name}
                permission={child.permission || item.permission || ''}
                fallback={null}
              >
                <Link
                  href={child.href}
                  className={cn(
                    "block px-3 py-2 text-sm rounded-lg",
                    "hover:bg-opacity-80"
                  )}
                  style={isActive(child.href) ? { 
                    backgroundColor: 'var(--accent)', 
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(0, 191, 255, 0.3)',
                    borderLeft: '3px solid var(--accent)',
                    fontWeight: '600'
                  } : { 
                    backgroundColor: 'transparent',
                    color: 'var(--text)',
                    borderLeft: '3px solid transparent'
                  }}
                >
                  {child.name}
                </Link>
              </PermissionGate>
            ))}
          </div>
        )}
      </div>
    );
  }

  const active = isActive(item.href!);
  const IconComponent = getIcon(item.icon);

  return (
    <Link
      href={item.href!}
      className={cn(
        "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg",
        "hover:bg-opacity-80"
      )}
      style={active ? { 
        backgroundColor: 'var(--accent)', 
        color: 'white',
        boxShadow: '0 2px 8px rgba(0, 191, 255, 0.3)',
        borderLeft: '3px solid var(--accent)',
        fontWeight: '600'
      } : { 
        backgroundColor: 'transparent',
        color: 'var(--text)',
        borderLeft: '3px solid transparent'
      }}
    >
      <div className="flex items-center space-x-3">
        <div style={{ color: active ? 'white' : 'var(--text)' }}>
          <IconComponent className="w-5 h-5" />
        </div>
        <span style={{ color: active ? 'white' : 'var(--text)' }}>{item.name}</span>
      </div>
      {item.name === 'Chat' && unreadCount > 0 && (
        <span 
          className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-medium" 
          style={{ boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)' }}
        >
          {unreadCount}
        </span>
      )}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

export function Sidebar({ navigation = defaultNavigation, isOpen = true, onToggle, unreadCount = 0 }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  }, []);

  const isActive = useCallback((href: string) => pathname === href, [pathname]);
  const isParentActive = useCallback((children: { href: string }[]) => 
    children.some(child => pathname === child.href), [pathname]);

  const getIcon = useCallback((icon: string | React.ComponentType<{ className?: string }>) => {
    if (typeof icon === 'string') {
      const IconComponent = iconMap[icon];
      return IconComponent || Package;
    }
    return icon;
  }, []);

  // Auto-expand parent if child is active
  const expandedItemsWithActive = useMemo(() => {
    const activeItems = new Set(expandedItems);
    navigation.forEach(item => {
      if (item.children && isParentActive(item.children)) {
        activeItems.add(item.name);
      }
    });
    return Array.from(activeItems);
  }, [expandedItems, navigation, isParentActive]);

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
        "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col h-full",
        "border-r shadow-lg",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      style={{ 
        backgroundColor: 'var(--card-bg)', 
        borderColor: 'var(--border)',
        transition: 'transform 0.2s ease-in-out'
      }}>
        {/* Logo */}
        <div className="p-6 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--accent)', boxShadow: 'var(--glow)' }}>
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--text)', letterSpacing: '0.5px' }}>Auto Inventory</h1>
              <p className="text-xs" style={{ color: 'var(--subtext)' }}>Dashboard</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
          {navigation.map((item) => (
            <PermissionGate
              key={item.name}
              permission={item.permission || ''}
              fallback={null}
            >
              <NavItem
                item={item}
                isActive={isActive}
                isParentActive={isParentActive}
                expandedItems={expandedItemsWithActive}
                toggleExpanded={toggleExpanded}
                getIcon={getIcon}
                unreadCount={unreadCount}
              />
            </PermissionGate>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="text-xs text-center mb-3" style={{ color: 'var(--subtext)' }}>
            <p>Auto Inventory v1.0</p>
            <p className="mt-1">© 2024 All rights reserved</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 text-xs" style={{ color: 'var(--subtext)' }}>
            <Link href="/about" className="hover:underline" style={{ color: 'var(--accent)' }}>
              About
            </Link>
            <span>|</span>
            <Link href="/privacy-policy" className="hover:underline" style={{ color: 'var(--accent)' }}>
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/licensing" className="hover:underline" style={{ color: 'var(--accent)' }}>
              Licensing
            </Link>
            <span>|</span>
            <Link href="/contact" className="hover:underline" style={{ color: 'var(--accent)' }}>
              Contact
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
