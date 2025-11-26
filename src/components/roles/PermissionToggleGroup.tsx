'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Package, DollarSign, AlertTriangle, FileText, Truck, BarChart3, FileBarChart, Users } from 'lucide-react';
import { RolePermissions } from '@/types/permissions';

interface PermissionToggleGroupProps {
  permissions: RolePermissions;
  onChange: (permissions: RolePermissions) => void;
}

interface ModuleConfig {
  key: keyof RolePermissions;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  permissions: {
    key: string;
    label: string;
    description?: string;
  }[];
}

const moduleConfigs: ModuleConfig[] = [
  {
    key: 'inventory',
    name: 'Inventory Modules',
    icon: Package,
    description: 'Vehicle inventory management',
    permissions: [
      { key: 'view', label: 'View Inventory', description: 'View vehicle list and details' },
      { key: 'add', label: 'Add Vehicles', description: 'Create new vehicle entries' },
      { key: 'edit', label: 'Edit Vehicles', description: 'Modify existing vehicle information' },
      { key: 'upload_photos', label: 'Upload Photos', description: 'Add vehicle images' },
      { key: 'update_location', label: 'Update Location', description: 'Change vehicle location' },
      { key: 'condition_notes', label: 'Condition Notes', description: 'Add condition assessments' },
      { key: 'purchase_details', label: 'Purchase Details', description: 'View/edit purchase information' },
      { key: 'title_status', label: 'Title Status', description: 'Manage title status' },
    ],
  },
  {
    key: 'sold',
    name: 'Sold Section',
    icon: DollarSign,
    description: 'Sold vehicles management',
    permissions: [
      { key: 'view', label: 'View Sold Vehicles', description: 'View sold vehicle list' },
      { key: 'edit', label: 'Edit Sold Vehicles', description: 'Modify sold vehicle details' },
      { key: 'profit_visibility', label: 'Profit Visibility', description: 'See profit calculations' },
      { key: 'expenses_visibility', label: 'Expenses Visibility', description: 'View vehicle expenses' },
      { key: 'transportation_costs', label: 'Transportation Costs', description: 'View/edit transport costs' },
      { key: 'arb', label: 'ARB Access', description: 'Access ARB features in sold section' },
      { key: 'adjust_price', label: 'Adjust Price', description: 'Modify sale prices' },
      { key: 'arb_outcome_history', label: 'ARB Outcome History', description: 'View ARB history' },
    ],
  },
  {
    key: 'arb',
    name: 'ARB Section',
    icon: AlertTriangle,
    description: 'Arbitration management',
    permissions: [
      { key: 'access', label: 'Access ARB', description: 'View ARB management page' },
      { key: 'create', label: 'Create ARB', description: 'Initiate new ARB cases' },
      { key: 'update', label: 'Update ARB', description: 'Modify ARB records' },
      { key: 'enter_outcomes', label: 'Enter Outcomes', description: 'Process ARB outcomes' },
      { key: 'enter_price_adjustment', label: 'Price Adjustments', description: 'Enter price adjustments' },
      { key: 'transportation_details', label: 'Transportation Details', description: 'Manage transport info' },
      { key: 'upload_documents', label: 'Upload Documents', description: 'Add ARB documents' },
    ],
  },
  {
    key: 'title',
    name: 'Title & Documentation',
    icon: FileText,
    description: 'Title status and documents',
    permissions: [
      { key: 'status', label: 'Title Status', description: 'View/edit title status' },
      { key: 'upload_documents', label: 'Upload Documents', description: 'Add title documents' },
      { key: 'missing_titles_dashboard', label: 'Missing Titles Dashboard', description: 'Access missing titles report' },
      { key: 'days_missing_tracker', label: 'Days Missing Tracker', description: 'View days missing tracking' },
    ],
  },
  {
    key: 'transportation',
    name: 'Transportation / Logistics',
    icon: Truck,
    description: 'Vehicle transportation management',
    permissions: [
      { key: 'location_tracking', label: 'Location Tracking', description: 'Track vehicle locations' },
      { key: 'transport_assignment', label: 'Transport Assignment', description: 'Assign transporters' },
      { key: 'transport_notes', label: 'Transport Notes', description: 'Add transport notes' },
      { key: 'transport_cost_entry', label: 'Transport Cost Entry', description: 'Enter transport costs' },
      { key: 'view_history', label: 'View History', description: 'View transport history' },
    ],
  },
  {
    key: 'accounting',
    name: 'Accounting & Financial',
    icon: BarChart3,
    description: 'Financial and accounting features',
    permissions: [
      { key: 'profit_per_car', label: 'Profit Per Car', description: 'View profit per vehicle' },
      { key: 'weekly_profit_summary', label: 'Weekly Profit Summary', description: 'Access weekly summaries' },
      { key: 'monthly_profit_summary', label: 'Monthly Profit Summary', description: 'Access monthly summaries' },
      { key: 'total_pl_summary', label: 'Total P&L Summary', description: 'View P&L reports' },
      { key: 'accounting_page', label: 'Accounting Page', description: 'Access accounting section' },
      { key: 'expenses_section', label: 'Expenses Section', description: 'View/edit expenses' },
      { key: 'price_adjustment_log', label: 'Price Adjustment Log', description: 'View price adjustments' },
      { key: 'export_reports', label: 'Export Reports', description: 'Export financial reports' },
    ],
  },
  {
    key: 'reports',
    name: 'Reports',
    icon: FileBarChart,
    description: 'All report types',
    permissions: [
      { key: 'profit_per_car', label: 'Profit Per Car Report', description: 'View profit per car report' },
      { key: 'weekly_profit_loss', label: 'Weekly Profit/Loss', description: 'Weekly P&L report' },
      { key: 'monthly_profit_loss', label: 'Monthly Profit/Loss', description: 'Monthly P&L report' },
      { key: 'arb_activity', label: 'ARB Activity', description: 'ARB activity reports' },
      { key: 'arb_transportation_cost', label: 'ARB Transportation Cost', description: 'ARB transport cost reports' },
      { key: 'price_adjustment_summary', label: 'Price Adjustment Summary', description: 'Price adjustment reports' },
      { key: 'inventory_summary', label: 'Inventory Summary', description: 'Inventory summary reports' },
      { key: 'sold_cars_weekly_count', label: 'Sold Cars Weekly Count', description: 'Weekly sales count' },
      { key: 'missing_titles', label: 'Missing Titles', description: 'Missing titles report' },
      { key: 'average_transportation_cost', label: 'Average Transportation Cost', description: 'Transport cost averages' },
      { key: 'average_arb_adjustment_percentage', label: 'Average ARB Adjustment %', description: 'ARB adjustment percentages' },
    ],
  },
  {
    key: 'user_management',
    name: 'User Management / System',
    icon: Users,
    description: 'User and system administration',
    permissions: [
      { key: 'view_users', label: 'View Users', description: 'View user list' },
      { key: 'create_roles', label: 'Create Roles', description: 'Create new roles' },
      { key: 'edit_roles', label: 'Edit Roles', description: 'Modify existing roles' },
      { key: 'assign_roles', label: 'Assign Roles', description: 'Assign roles to users' },
      { key: 'activity_logs', label: 'Activity Logs', description: 'View activity logs' },
      { key: 'permission_editing', label: 'Permission Editing', description: 'Edit role permissions' },
    ],
  },
];

export function PermissionToggleGroup({ permissions, onChange }: PermissionToggleGroupProps) {
  const [expandedModules, setExpandedModules] = useState<Set<keyof RolePermissions>>(
    new Set(['inventory', 'sold', 'arb', 'title', 'transportation', 'accounting', 'reports', 'user_management'])
  );

  const toggleModule = (moduleKey: keyof RolePermissions) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleKey)) {
        newSet.delete(moduleKey);
      } else {
        newSet.add(moduleKey);
      }
      return newSet;
    });
  };

  const togglePermission = (moduleKey: keyof RolePermissions, permissionKey: string) => {
    const modulePermissions = permissions[moduleKey] as any;
    const newPermissions = {
      ...permissions,
      [moduleKey]: {
        ...modulePermissions,
        [permissionKey]: !modulePermissions[permissionKey],
      },
    };
    onChange(newPermissions);
  };

  const toggleAllInModule = (moduleKey: keyof RolePermissions, enabled: boolean) => {
    const moduleConfig = moduleConfigs.find(m => m.key === moduleKey);
    if (!moduleConfig) return;

    const modulePermissions = permissions[moduleKey] as any;
    const newModulePermissions: any = {};
    
    moduleConfig.permissions.forEach(perm => {
      newModulePermissions[perm.key] = enabled;
    });

    const newPermissions = {
      ...permissions,
      [moduleKey]: newModulePermissions,
    };
    onChange(newPermissions);
  };

  const getModuleGrantedCount = (moduleKey: keyof RolePermissions): number => {
    const moduleConfig = moduleConfigs.find(m => m.key === moduleKey);
    if (!moduleConfig) return 0;

    const modulePermissions = permissions[moduleKey] as any;
    return moduleConfig.permissions.filter(
      perm => modulePermissions[perm.key] === true
    ).length;
  };

  return (
    <div className="space-y-3">
      {moduleConfigs.map((module) => {
        const Icon = module.icon;
        const isExpanded = expandedModules.has(module.key);
        const modulePermissions = permissions[module.key] as any;
        const grantedCount = getModuleGrantedCount(module.key);
        const totalCount = module.permissions.length;
        const allGranted = grantedCount === totalCount;
        const someGranted = grantedCount > 0 && grantedCount < totalCount;

        return (
          <Card 
            key={module.key}
            className="border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border)'
            }}
          >
            <CardHeader 
              className="cursor-pointer hover:bg-opacity-50 transition-colors"
              onClick={() => toggleModule(module.key)}
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" style={{ color: 'var(--text)' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text)' }} />
                  )}
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                  <div className="flex-1">
                    <CardTitle className="text-base" style={{ color: 'var(--text)' }}>
                      {module.name}
                    </CardTitle>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--subtext)' }}>
                      {module.description} • {grantedCount} of {totalCount} permissions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllInModule(module.key, !allGranted);
                    }}
                    className="text-xs"
                    style={{ color: 'var(--text)' }}
                  >
                    {allGranted ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {module.permissions.map((permission) => {
                    const isChecked = modulePermissions[permission.key] === true;
                    
                    return (
                      <div 
                        key={permission.key}
                        className="flex items-start gap-3 p-2 rounded hover:bg-opacity-50 transition-colors"
                        style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
                      >
                        <Checkbox
                          id={`${module.key}-${permission.key}`}
                          checked={isChecked}
                          onCheckedChange={() => togglePermission(module.key, permission.key)}
                          style={{
                            marginTop: '2px'
                          }}
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`${module.key}-${permission.key}`}
                            className="cursor-pointer font-medium"
                            style={{ color: 'var(--text)' }}
                          >
                            {permission.label}
                          </Label>
                          {permission.description && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--subtext)' }}>
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

