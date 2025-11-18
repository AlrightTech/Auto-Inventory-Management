# Comprehensive RBAC Permissions Guide

## Overview

This document provides a complete reference for all granular permissions in the Auto Inventory Management system. The system now includes **80+ permissions** organized across 12 modules.

## Permission Modules

### 1. Dashboard
- `dashboard.view` - View Dashboard

### 2. Tasks
- `tasks.view` - View Tasks
- `tasks.create` - Create Tasks
- `tasks.edit` - Edit Tasks
- `tasks.delete` - Delete Tasks
- `tasks.assign` - Assign Tasks

### 3. Inventory (10 permissions)
- `inventory.view` - View Inventory List
- `inventory.create` - Add New Inventory Car
- `inventory.edit` - Edit Inventory Car Details
- `inventory.delete` - Delete Vehicles
- `inventory.view_all` - View All Inventory
- `inventory.photos.manage` - Upload/Edit Photos
- `inventory.location.update` - Update Car Location
- `inventory.notes.manage` - Condition / Mechanical Notes
- `inventory.purchase.manage` - Purchase Details (buy price, seller info)
- `inventory.title.manage` - Title Status in Inventory

### 4. Sold Section (8 permissions)
- `sold.view` - View Sold Cars
- `sold.edit` - Edit Sold Car Details
- `sold.profit.view` - **Profit Visibility** (Most restricted)
- `sold.expenses.view` - Expenses Visibility
- `sold.transport.cost` - Transportation Costs (sold section)
- `sold.arb.view` - ARB for Sold Cars
- `sold.arb.adjust_price` - Adjust Price (sold ARB)
- `sold.arb.history` - View ARB Outcome History

### 5. ARB Section (6 permissions)
- `arb.view` - Access to ARB dashboard
- `arb.create` - Create / Update ARB Cases
- `arb.outcome.enter` - Enter ARB Outcome (Denied, Price Adjusted, Withdrawn)
- `arb.price.adjust` - Enter Price Adjustment Amount
- `arb.transport.manage` - Enter Transportation Details/Cost (for withdrawn cases)
- `arb.documents.upload` - Upload ARB Documents

### 6. Title & Documentation (4 permissions)
- `title.status.view` - Title Status (all sections)
- `title.documents.upload` - Upload Title Documents
- `title.missing.dashboard` - Missing Titles Dashboard
- `title.missing.tracker` - Days Missing Title Tracker

### 7. Transportation / Logistics (5 permissions)
- `transport.location.track` - Location Tracking (Inventory)
- `transport.assign` - Transport Assignment
- `transport.notes` - Transport Notes
- `transport.cost.entry` - Transport Cost Entry
- `transport.history.view` - View Transport History

### 8. Accounting & Financial (8 permissions)
- `accounting.view` - Accounting Page
- `accounting.profit.car` - Profit Per Car (visible/invisible)
- `accounting.profit.weekly` - Weekly Profit Summary
- `accounting.profit.monthly` - Monthly Profit Summary
- `accounting.pnl.summary` - Total P&L Summary Dashboard
- `accounting.expenses.view` - Expenses Section
- `accounting.price.adjustment.log` - Price Adjustment Log
- `accounting.reports.export` - Export Financial Reports

### 9. Reports Section (11 permissions - Each can be hidden/shown)
- `reports.profit.car` - Profit Per Car Report
- `reports.profit.weekly` - Weekly Profit/Loss Report
- `reports.profit.monthly` - Monthly Profit/Loss Report
- `reports.arb.activity` - ARB Activity Report (count, outcome)
- `reports.arb.transport.cost` - ARB Transportation Cost Report
- `reports.price.adjustment` - Price Adjustment Summary
- `reports.inventory.summary` - Inventory Summary Report
- `reports.sold.weekly` - Sold Cars Weekly Count
- `reports.missing.titles` - Missing Titles Report
- `reports.transport.avg_cost` - Average Transportation Cost
- `reports.arb.adjustment.percent` - Average ARB Adjustment Percentage

### 10. User Management / System (6 permissions)
- `system.users.view` - User Accounts (view)
- `system.roles.create` - Create Roles
- `system.roles.edit` - Edit Roles
- `system.roles.assign` - Assign Roles
- `system.activity.logs` - Activity Logs
- `system.permissions.edit` - Permission Editing (hide/show UI)

### 11. Events
- `events.view` - View Events
- `events.create` - Create Events
- `events.edit` - Edit Events
- `events.delete` - Delete Events

### 12. Chat
- `chat.view` - View Chat
- `chat.send` - Send Messages

### 13. VIN Decode
- `vin_decode.view` - View VIN Decode
- `vin_decode.decode` - Decode VIN

### 14. Users
- `users.view` - View Users
- `users.create` - Create Users
- `users.edit` - Edit Users
- `users.delete` - Delete Users

### 15. Settings
- `settings.view` - View Settings
- `settings.manage` - Manage Settings
- `settings.dropdowns.manage` - Manage Dropdowns
- `settings.staff.manage` - Manage Staff
- `settings.transporter.manage` - Manage Transporter Settings

### 16. Roles
- `roles.view` - View Roles
- `roles.manage` - Manage Roles
- `roles.permissions.manage` - Manage Permissions

### 17. Assessments
- `assessments.view` - View Assessments
- `assessments.create` - Create Assessments
- `assessments.edit` - Edit Assessments
- `assessments.delete` - Delete Assessments

### 18. Notifications
- `notifications.view` - View Notifications
- `notifications.manage` - Manage Notifications

## Usage Examples

### Backend API Protection

```typescript
import { requirePermission } from '@/lib/middleware/permissions';
import { PERMISSIONS } from '@/lib/permissions';

// Protect profit visibility (most restricted)
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(
    request, 
    PERMISSIONS.SOLD.PROFIT_VIEW
  );
  if (authResult.error) return authResult.response;
  // ... return profit data
}

// Protect ARB outcome entry
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(
    request, 
    PERMISSIONS.ARB.OUTCOME_ENTER
  );
  if (authResult.error) return authResult.response;
  // ... handle ARB outcome
}
```

### Frontend Component Protection

```typescript
import { useCan } from '@/components/permissions/useCan';
import { PERMISSIONS } from '@/lib/permissions';

function SoldCarDetails({ car }) {
  const canViewProfit = useCan(PERMISSIONS.SOLD.PROFIT_VIEW);
  const canEdit = useCan(PERMISSIONS.SOLD.EDIT);
  const canViewExpenses = useCan(PERMISSIONS.SOLD.EXPENSES_VIEW);

  return (
    <div>
      <CarBasicInfo car={car} />
      
      {canViewProfit && (
        <ProfitSection car={car} />
      )}
      
      {canViewExpenses && (
        <ExpensesSection car={car} />
      )}
      
      {canEdit && (
        <EditButton onClick={handleEdit} />
      )}
    </div>
  );
}
```

### Conditional Report Display

```typescript
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PERMISSIONS } from '@/lib/permissions';

function ReportsPage() {
  return (
    <div>
      <h1>Reports</h1>
      
      <PermissionGate permission={PERMISSIONS.REPORTS.PROFIT_CAR}>
        <ProfitPerCarReport />
      </PermissionGate>
      
      <PermissionGate permission={PERMISSIONS.REPORTS.PROFIT_WEEKLY}>
        <WeeklyProfitReport />
      </PermissionGate>
      
      <PermissionGate permission={PERMISSIONS.REPORTS.ARB_ACTIVITY}>
        <ARBActivityReport />
      </PermissionGate>
      
      {/* ... other reports */}
    </div>
  );
}
```

## Permission Priority

### Most Restricted Permissions
1. **`sold.profit.view`** - Profit Visibility (Most restricted)
2. **`accounting.profit.car`** - Profit Per Car
3. **`accounting.pnl.summary`** - Total P&L Summary
4. **`system.permissions.edit`** - Permission Editing

### Standard Permissions
- Most view permissions are standard
- Edit/create permissions require appropriate access
- Delete permissions are typically admin-only

## Default Role Permissions

### Admin
- ✅ All permissions granted by default

### Seller
- ✅ Dashboard, Tasks, Inventory (full), Events, Chat
- ✅ Sold (view, edit, expenses, transport cost)
- ✅ ARB (view, create, update)
- ✅ Title (view, upload)
- ✅ Transportation (location, notes, cost entry)
- ❌ Profit visibility (most restricted)
- ❌ System management
- ❌ Reports (configurable)

### Transporter
- ✅ Dashboard, Tasks (view), Inventory (view), Events (view), Chat
- ❌ All edit/create permissions
- ❌ Financial data
- ❌ System management

## Managing Permissions

1. Navigate to `/admin/settings/roles`
2. Select the role to modify
3. Toggle permissions ON/OFF
4. Click "Save Permissions"

## Best Practices

1. **Use granular permissions** - Don't rely on broad permissions like `inventory.edit` for all operations
2. **Protect sensitive data** - Always check `sold.profit.view` before showing profit information
3. **Hide UI elements** - Use `PermissionGate` or `useCan` to hide unavailable features
4. **Backend validation** - Always validate permissions on the backend, even if frontend hides features
5. **Test thoroughly** - Verify permissions work correctly for each role

## Permission Groups

### Financial Data (Most Sensitive)
- `sold.profit.view`
- `accounting.profit.*`
- `accounting.pnl.summary`
- `reports.profit.*`

### Administrative
- `system.*`
- `roles.*`
- `users.*`

### Operational
- `inventory.*`
- `sold.*` (except profit)
- `arb.*`
- `transport.*`

### Reporting
- `reports.*` (all 11 report permissions)

## Migration Notes

When running the migration:
1. All new permissions are added automatically
2. Existing permissions are preserved
3. Default role permissions are set
4. Custom roles need manual permission assignment

## Troubleshooting

If a permission isn't working:

1. Check if permission exists: `SELECT * FROM permissions WHERE key = 'permission.key';`
2. Check role assignment: `SELECT * FROM role_permissions WHERE role_id = 'role-id';`
3. Check user's role: `SELECT * FROM profiles WHERE id = 'user-id';`
4. Test permission function: `SELECT user_has_permission('user-id', 'permission.key');`

