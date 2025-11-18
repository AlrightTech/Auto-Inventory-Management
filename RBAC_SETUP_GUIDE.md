# RBAC System Setup Guide

## Quick Start

### 1. Run Database Migration

Execute the SQL migration file in your Supabase SQL Editor:

```sql
-- File: supabase/migrations/20250103_create_rbac_system.sql
```

This will:
- ✅ Drop existing RBAC tables (if any)
- ✅ Create permissions, roles, and role_permissions tables
- ✅ Insert 80+ permissions
- ✅ Create system roles: admin, seller, transporter, office_staff
- ✅ Set default permissions for each role
- ✅ Create helper functions

### 2. Assign Roles to Users

After migration, assign roles to users:

```sql
-- Assign Office Staff role
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'office_staff')
WHERE email = 'staff@example.com';

-- Assign Transporter role
UPDATE profiles 
SET role_id = (SELECT id FROM roles WHERE name = 'transporter')
WHERE email = 'transporter@example.com';
```

Or use the Admin UI at `/admin/users` to assign roles.

### 3. Verify Permissions

Check if permissions are working:

```sql
-- Check Office Staff permissions (should NOT include accounting)
SELECT p.key, p.name 
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE r.name = 'office_staff' AND rp.granted = TRUE
ORDER BY p.module, p.name;

-- Check Transporter permissions (should only be inventory.view and inventory.location.update)
SELECT p.key, p.name 
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON r.id = rp.role_id
WHERE r.name = 'transporter' AND rp.granted = TRUE;
```

## Role Configurations

### Office Staff
**Has Access To:**
- ✅ Dashboard
- ✅ Tasks
- ✅ Inventory (all features)
- ✅ Missing Titles
- ✅ ARB
- ✅ Events
- ✅ Chat
- ✅ Sold (without profit)
- ✅ VIN Decode
- ✅ User Management
- ✅ Settings
- ✅ All other modules

**Does NOT Have Access To:**
- ❌ Accounting section (entire section hidden)
- ❌ Profit visibility
- ❌ Financial reports
- ❌ Expenses visibility
- ❌ Transportation costs in sold section

### Transporter
**Has Access To:**
- ✅ Inventory (view only)
- ✅ Update car locations

**Does NOT Have Access To:**
- ❌ Everything else

## Testing the System

### Test Office Staff
1. Login as Office Staff user
2. Verify Accounting menu item is hidden
3. Verify profit data is not visible in Sold section
4. Verify Missing Titles is accessible
5. Try accessing `/admin/accounting` directly → should redirect to `/access-denied`

### Test Transporter
1. Login as Transporter user
2. Verify only Inventory menu item is visible
3. Verify can update car locations
4. Try accessing `/admin/sold` → should redirect to `/access-denied`
5. Try accessing `/admin/arb` → should redirect to `/access-denied`

### Test Admin
1. Login as Admin
2. Go to `/admin/settings/roles`
3. Create a new role
4. Toggle permissions ON/OFF
5. Assign role to a user
6. Verify changes apply immediately

## Common Issues

### Issue: Permissions not working
**Solution:**
1. Check if user has `role_id` assigned in profiles table
2. Verify role exists in roles table
3. Check role_permissions table for granted permissions
4. Test permission function: `SELECT user_has_permission('user-id', 'permission.key');`

### Issue: Office Staff can see Accounting
**Solution:**
1. Verify Office Staff role has `accounting.view` permission set to FALSE
2. Check role_permissions table
3. Re-run the Office Staff permission assignment in migration

### Issue: Transporter sees more than Inventory
**Solution:**
1. Verify Transporter role only has `inventory.view` and `inventory.location.update`
2. Check if user has multiple roles assigned
3. Verify role_id in profiles table

## Adding New Permissions

1. Add permission to migration file:
```sql
INSERT INTO permissions (key, name, description, module) VALUES
  ('new_module.action', 'New Action', 'Description', 'new_module');
```

2. Add to PERMISSIONS constant in `src/lib/permissions.ts`:
```typescript
NEW_MODULE: {
  ACTION: 'new_module.action',
}
```

3. Use in code:
```typescript
const canDoAction = useCan(PERMISSIONS.NEW_MODULE.ACTION);
```

## Maintenance

### View All Permissions
```sql
SELECT module, key, name, description 
FROM permissions 
ORDER BY module, name;
```

### View Role Permissions
```sql
SELECT r.name, r.display_name, p.key, p.name, rp.granted
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'office_staff'
ORDER BY p.module, p.name;
```

### Reset Role Permissions
```sql
-- Remove all permissions from a role
DELETE FROM role_permissions WHERE role_id = 'role-id';

-- Then reassign via UI or SQL
```

## Support

For issues or questions:
1. Check the migration file for correct setup
2. Verify database functions are created
3. Check browser console for permission errors
4. Review `RBAC_FINAL_IMPLEMENTATION.md` for details

