# RBAC System Implementation Guide

## Overview

This document describes the comprehensive Role-Based Access Control (RBAC) system implemented for the Auto Inventory Management application. The system supports predefined roles, unlimited custom roles, and granular permission controls for every module and sub-module.

## Architecture

### Database Schema

1. **roles table**: Stores role definitions with JSONB permissions
2. **profiles table**: Updated to include `role_id` foreign key
3. **Predefined system roles**: Admin, Office Staff, Transporter

### Permission Structure

Permissions are organized into 8 main modules (A-H):

- **A. Inventory Modules**: View, Add, Edit, Upload Photos, Update Location, etc.
- **B. Sold Section**: View, Edit, Profit Visibility, Expenses, ARB, etc.
- **C. ARB Section**: Access, Create, Update, Enter Outcomes, etc.
- **D. Title & Documentation**: Status, Upload Documents, Missing Titles, etc.
- **E. Transportation / Logistics**: Location Tracking, Transport Assignment, etc.
- **F. Accounting & Financial**: Profit Per Car, Weekly/Monthly Summaries, etc.
- **G. Reports Section**: All report types (Profit, ARB, Inventory, etc.)
- **H. User Management / System**: View Users, Create/Edit Roles, etc.

## Predefined Roles

### 1. Admin
- **Full system access** with all permissions enabled
- Can create, edit, and delete custom roles
- Can assign roles to users
- System role (cannot be deleted)

### 2. Office Staff
- Access to everything **except** profit and accounting
- **Hidden**: Profit per car, all accounting pages, financial reports, expenses visibility
- **Visible**: Inventory, Sold (without profit), Title tracking, Transportation (limited)

### 3. Transporter
- **Restricted operational role**
- **Can only**: Access Inventory, Update vehicle locations
- **Hidden**: Sold section, ARB, Accounting, Expenses, Price Adjustments, Financial summaries, Reports, User Management
- System role (cannot be deleted)

## Usage

### For Developers

#### 1. Check Permissions in Components

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, isAdmin } = usePermissions();
  
  // Check specific permission
  if (hasPermission('inventory.add')) {
    // Show add button
  }
  
  // Check if admin
  if (isAdmin()) {
    // Show admin-only features
  }
}
```

#### 2. Protect Routes

**Client-side:**
```typescript
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyPage() {
  return (
    <ProtectedRoute requiredPermission="inventory.view">
      <PageContent />
    </ProtectedRoute>
  );
}
```

**Server-side:**
```typescript
import { requirePermission } from '@/lib/route-protection';

export default async function MyPage() {
  await requirePermission('inventory.view');
  // Page content
}
```

#### 3. Filter Navigation

The Sidebar automatically filters navigation items based on permissions. Add `permission` property to navigation items:

```typescript
{
  name: 'Inventory',
  href: '/admin/inventory',
  permission: 'inventory.view',
  icon: Package,
}
```

#### 4. Hide UI Elements

```typescript
const { hasPermission } = usePermissions();

{hasPermission('accounting.profit_per_car') && (
  <ProfitDisplay />
)}
```

### For Administrators

#### Creating a New Role

1. Navigate to **Role Management** (`/admin/roles`)
2. Click **Create Role**
3. Enter role name and description
4. Toggle permissions for each module
5. Click **Create Role**

#### Editing a Role

1. Navigate to **Role Management**
2. Click **Edit** on the desired role
3. Modify permissions as needed
4. Click **Update Role**

**Note**: System roles (Admin, Office Staff, Transporter) cannot be modified.

#### Assigning Roles to Users

1. Navigate to **User Management** (`/admin/users`)
2. Find the user
3. Select a role from the dropdown
4. Role is applied immediately

## API Endpoints

### Roles

- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/[roleId]` - Get single role
- `PATCH /api/roles/[roleId]` - Update role
- `DELETE /api/roles/[roleId]` - Delete role

### User Role Assignment

- `PATCH /api/users/[userId]/role` - Assign role to user

## Permission Paths

Permission paths follow the format: `module.permission`

Examples:
- `inventory.view` - View inventory list
- `inventory.add` - Add new vehicle
- `sold.profit_visibility` - See profit information
- `accounting.accounting_page` - Access accounting pages
- `user_management.create_roles` - Create new roles

## Implementation Files

### Core Files
- `src/types/permissions.ts` - TypeScript types
- `src/lib/permissions.ts` - Permission checking utilities
- `src/lib/navigation-permissions.ts` - Navigation filtering
- `src/lib/route-protection.ts` - Server-side route protection
- `src/hooks/usePermissions.ts` - React hook for permissions

### Components
- `src/components/auth/ProtectedRoute.tsx` - Route protection wrapper
- `src/components/layout/Sidebar.tsx` - Updated with permission filtering

### Pages
- `src/app/admin/roles/page.tsx` - Role management UI

### API Routes
- `src/app/api/roles/route.ts` - Role CRUD operations
- `src/app/api/roles/[roleId]/route.ts` - Single role operations
- `src/app/api/users/[userId]/role/route.ts` - User role assignment

### Database
- `supabase/migrations/20241221_create_rbac_system.sql` - Database schema

## Best Practices

1. **Always check permissions server-side** for API routes
2. **Use client-side checks** for UI visibility only
3. **Don't rely solely on UI hiding** - protect routes and APIs
4. **Test with different roles** to ensure proper access control
5. **Document custom permissions** when adding new modules

## Migration

To apply the RBAC system:

1. Run the migration: `supabase/migrations/20241221_create_rbac_system.sql`
2. Existing admin users will be automatically assigned the Admin role
3. Update user roles as needed through the UI

## Future Enhancements

- Activity logging for permission changes
- Role templates for common configurations
- Bulk role assignment
- Permission inheritance
- Time-based permissions
- IP-based restrictions


