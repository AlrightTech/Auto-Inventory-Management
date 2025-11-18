# Role-Based Access Control (RBAC) System

## Overview

This document describes the complete RBAC system implementation for the Auto Inventory Management application. The system allows administrators to control access to features and modules through granular permissions assigned to roles.

## Architecture

### Database Schema

The RBAC system consists of three main tables:

1. **permissions** - Stores all available permissions in the system
2. **roles** - Stores role definitions (admin, seller, transporter, and custom roles)
3. **role_permissions** - Pivot table linking roles to permissions with ON/OFF toggle

### Key Features

- ✅ Granular permission control per feature
- ✅ ON/OFF toggles for each permission per role
- ✅ Support for system roles (admin, seller, transporter) and custom roles
- ✅ Backend middleware for API route protection
- ✅ Frontend hooks and components for UI permission checks
- ✅ Modular structure for easy permission addition

## Database Setup

### Migration

Run the migration file to set up the RBAC tables:

```sql
-- Located at: supabase/migrations/20250103_create_rbac_system.sql
```

This migration:
- Creates `permissions`, `roles`, and `role_permissions` tables
- Adds `role_id` column to `profiles` table
- Inserts default system roles (admin, seller, transporter)
- Inserts all system permissions
- Creates helper functions: `get_user_permissions()` and `user_has_permission()`
- Sets up default permissions for system roles

### Default Permissions

The system includes permissions for all major modules:

- **Dashboard**: `dashboard.view`
- **Tasks**: `tasks.view`, `tasks.create`, `tasks.edit`, `tasks.delete`, `tasks.assign`
- **Inventory**: `inventory.view`, `inventory.create`, `inventory.edit`, `inventory.delete`, `inventory.view_all`
- **ARB**: `arb.view`, `arb.manage`
- **Events**: `events.view`, `events.create`, `events.edit`, `events.delete`
- **Chat**: `chat.view`, `chat.send`
- **Sold**: `sold.view`, `sold.manage`
- **Accounting**: Multiple permissions for purchases, sold records, and reports
- **VIN Decode**: `vin_decode.view`, `vin_decode.decode`
- **Users**: `users.view`, `users.create`, `users.edit`, `users.delete`
- **Settings**: Various settings management permissions
- **Roles**: `roles.view`, `roles.manage`, `roles.permissions.manage`
- **Assessments**: `assessments.view`, `assessments.create`, `assessments.edit`, `assessments.delete`
- **Notifications**: `notifications.view`, `notifications.manage`

## Backend Implementation

### Permission Helpers

Located in `src/lib/permissions.ts`:

```typescript
import { hasPermission, getUserPermissions, PERMISSIONS } from '@/lib/permissions';

// Check single permission
const canView = await hasPermission(supabase, userId, PERMISSIONS.INVENTORY.VIEW);

// Get all user permissions
const permissions = await getUserPermissions(supabase, userId);
```

### Middleware

Located in `src/lib/middleware/permissions.ts`:

```typescript
import { requirePermission, requireAdmin } from '@/lib/middleware/permissions';

// Protect API route with permission check
export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.INVENTORY.VIEW);
  if (authResult.error) return authResult.response;
  const { supabase, user } = authResult;
  // ... rest of handler
}
```

### API Routes

#### Roles Management

- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `GET /api/roles/[id]` - Get role with permissions
- `PATCH /api/roles/[id]` - Update role
- `DELETE /api/roles/[id]` - Delete role (cannot delete system roles)
- `PUT /api/roles/[id]/permissions` - Update role permissions

#### Permissions

- `GET /api/permissions` - List all permissions
- `GET /api/users/permissions` - Get current user's permissions

## Frontend Implementation

### Hooks

#### usePermissions Hook

Located in `src/hooks/usePermissions.ts`:

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();
  
  if (hasPermission('inventory.view')) {
    // Show inventory
  }
}
```

#### useCan Hook

Located in `src/components/permissions/useCan.ts`:

```typescript
import { useCan } from '@/components/permissions/useCan';

function MyComponent() {
  const canView = useCan('inventory.view');
  const canEdit = useCan(['inventory.edit', 'inventory.create'], { requireAll: false });
  
  return (
    <>
      {canView && <InventoryView />}
      {canEdit && <EditButton />}
    </>
  );
}
```

### Components

#### PermissionGate Component

Located in `src/components/permissions/PermissionGate.tsx`:

```typescript
import { PermissionGate } from '@/components/permissions/PermissionGate';

<PermissionGate permission="inventory.view">
  <InventoryComponent />
</PermissionGate>

<PermissionGate 
  permission={["inventory.view", "inventory.edit"]} 
  requireAll
  fallback={<div>Access Denied</div>}
>
  <EditButton />
</PermissionGate>
```

#### RoleManagement Component

Located in `src/components/roles/RoleManagement.tsx`:

Full-featured UI for managing roles and permissions with:
- Role list sidebar
- Permission toggles organized by module
- Create/delete roles
- Save permissions

Accessible at: `/admin/settings/roles`

## Usage Examples

### Backend API Route Protection

```typescript
// src/app/api/inventory/route.ts
import { requirePermission } from '@/lib/middleware/permissions';
import { PERMISSIONS } from '@/lib/permissions';

export async function GET(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.INVENTORY.VIEW);
  if (authResult.error) return authResult.response;
  const { supabase, user } = authResult;
  
  // Your code here
}

export async function POST(request: NextRequest) {
  const authResult = await requirePermission(request, PERMISSIONS.INVENTORY.CREATE);
  if (authResult.error) return authResult.response;
  const { supabase, user } = authResult;
  
  // Your code here
}
```

### Frontend Component Protection

```typescript
// Hide/show buttons based on permissions
import { useCan } from '@/components/permissions/useCan';

function InventoryPage() {
  const canCreate = useCan('inventory.create');
  const canEdit = useCan('inventory.edit');
  const canDelete = useCan('inventory.delete');
  
  return (
    <div>
      {canCreate && <Button onClick={handleCreate}>Add Vehicle</Button>}
      {canEdit && <Button onClick={handleEdit}>Edit</Button>}
      {canDelete && <Button onClick={handleDelete}>Delete</Button>}
    </div>
  );
}
```

### Conditional Rendering

```typescript
import { PermissionGate } from '@/components/permissions/PermissionGate';

function Sidebar() {
  return (
    <nav>
      <PermissionGate permission="dashboard.view">
        <Link href="/admin">Dashboard</Link>
      </PermissionGate>
      
      <PermissionGate permission="inventory.view">
        <Link href="/admin/inventory">Inventory</Link>
      </PermissionGate>
      
      <PermissionGate permission="roles.view">
        <Link href="/admin/settings/roles">Roles & Permissions</Link>
      </PermissionGate>
    </nav>
  );
}
```

## Adding New Permissions

### Step 1: Add Permission to Database

Add the permission to the migration file or run:

```sql
INSERT INTO permissions (key, name, description, module) VALUES
  ('new_feature.view', 'View New Feature', 'Access to new feature', 'new_feature');
```

### Step 2: Add to PERMISSIONS Constant

Update `src/lib/permissions.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions
  NEW_FEATURE: {
    VIEW: 'new_feature.view',
    CREATE: 'new_feature.create',
  },
} as const;
```

### Step 3: Use in Code

```typescript
// Backend
const authResult = await requirePermission(request, PERMISSIONS.NEW_FEATURE.VIEW);

// Frontend
const canView = useCan(PERMISSIONS.NEW_FEATURE.VIEW);
```

## Role Management UI

Access the Role Management interface at `/admin/settings/roles` (admin only).

Features:
- View all roles (system and custom)
- Create new custom roles
- Delete custom roles (system roles cannot be deleted)
- Toggle permissions ON/OFF for each role
- Permissions organized by module
- Real-time save functionality

## System Roles

### Admin
- Full access to all permissions by default
- Can manage roles and permissions
- Can view and manage all data

### Seller
Default permissions:
- Dashboard view
- Task management (view, create, edit)
- Inventory management (own vehicles)
- Events (view, create, edit)
- Chat
- View sold vehicles
- Assessments (view, create, edit)
- View notifications

### Transporter
Default permissions:
- Dashboard view
- View tasks
- View inventory (read-only)
- View events
- Chat
- View assessments
- View notifications

## Best Practices

1. **Always check permissions on both frontend and backend**
   - Frontend checks improve UX (hide unavailable features)
   - Backend checks ensure security

2. **Use PermissionGate for conditional rendering**
   - Cleaner than manual checks
   - Consistent permission checking

3. **Use PERMISSIONS constant**
   - Avoid typos in permission keys
   - Easy refactoring

4. **Group related permissions by module**
   - Easier to manage
   - Better organization in UI

5. **Test permission changes**
   - Verify both allowed and denied access
   - Test with different roles

## Troubleshooting

### Permission not working?

1. Check if permission exists in database:
   ```sql
   SELECT * FROM permissions WHERE key = 'your.permission.key';
   ```

2. Check if role has permission:
   ```sql
   SELECT rp.*, p.key 
   FROM role_permissions rp
   JOIN permissions p ON p.id = rp.permission_id
   WHERE rp.role_id = 'role-id' AND rp.granted = true;
   ```

3. Check user's role:
   ```sql
   SELECT p.*, r.name as role_name
   FROM profiles p
   LEFT JOIN roles r ON r.id = p.role_id
   WHERE p.id = 'user-id';
   ```

4. Verify backend function:
   ```sql
   SELECT user_has_permission('user-id', 'your.permission.key');
   ```

## Security Notes

- All permission checks use database functions for consistency
- Backend middleware ensures API routes are protected
- RLS policies protect database access
- System roles cannot be deleted
- Roles assigned to users cannot be deleted

## Future Enhancements

Potential improvements:
- Permission inheritance
- Permission groups
- Time-based permissions
- IP-based restrictions
- Audit logging for permission changes

