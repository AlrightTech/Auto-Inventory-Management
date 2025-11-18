# Inventory Module Permissions Guide

## Overview

The Inventory module now has granular permissions that allow fine-grained control over what users can do with vehicle inventory.

## Available Permissions

### 1. View Inventory List
- **Permission Key**: `inventory.view`
- **Constant**: `PERMISSIONS.INVENTORY.VIEW`
- **Description**: Allows users to view the vehicle inventory list
- **Default**: Admin, Seller, Transporter

### 2. Add New Inventory Car
- **Permission Key**: `inventory.create`
- **Constant**: `PERMISSIONS.INVENTORY.CREATE`
- **Description**: Allows users to add new vehicles to inventory
- **Default**: Admin, Seller

### 3. Edit Inventory Car Details
- **Permission Key**: `inventory.edit`
- **Constant**: `PERMISSIONS.INVENTORY.EDIT`
- **Description**: Allows users to edit existing vehicle details (basic information)
- **Default**: Admin, Seller

### 4. Upload/Edit Photos
- **Permission Key**: `inventory.photos.manage`
- **Constant**: `PERMISSIONS.INVENTORY.PHOTOS_MANAGE`
- **Description**: Allows users to upload and edit vehicle photos
- **Default**: Admin, Seller

### 5. Update Car Location
- **Permission Key**: `inventory.location.update`
- **Constant**: `PERMISSIONS.INVENTORY.LOCATION_UPDATE`
- **Description**: Allows users to update vehicle location information
- **Default**: Admin, Seller

### 6. Condition / Mechanical Notes
- **Permission Key**: `inventory.notes.manage`
- **Constant**: `PERMISSIONS.INVENTORY.NOTES_MANAGE`
- **Description**: Allows users to manage condition and mechanical notes for vehicles
- **Default**: Admin, Seller

### 7. Purchase Details
- **Permission Key**: `inventory.purchase.manage`
- **Constant**: `PERMISSIONS.INVENTORY.PURCHASE_MANAGE`
- **Description**: Allows users to manage purchase details (buy price, seller info)
- **Default**: Admin, Seller

### 8. Title Status in Inventory
- **Permission Key**: `inventory.title.manage`
- **Constant**: `PERMISSIONS.INVENTORY.TITLE_MANAGE`
- **Description**: Allows users to manage title status in inventory
- **Default**: Admin, Seller

### Additional Permissions

- **Delete Vehicles**: `inventory.delete` - Delete vehicles from inventory
- **View All Inventory**: `inventory.view_all` - View all vehicles across all sellers (Admin only)

## Usage Examples

### Backend API Route Protection

```typescript
import { requirePermission } from '@/lib/middleware/permissions';
import { PERMISSIONS } from '@/lib/permissions';

// Protect photo upload endpoint
export async function POST(request: NextRequest) {
  const authResult = await requirePermission(
    request, 
    PERMISSIONS.INVENTORY.PHOTOS_MANAGE
  );
  if (authResult.error) return authResult.response;
  // ... handle photo upload
}

// Protect location update endpoint
export async function PATCH(request: NextRequest) {
  const authResult = await requirePermission(
    request, 
    PERMISSIONS.INVENTORY.LOCATION_UPDATE
  );
  if (authResult.error) return authResult.response;
  // ... handle location update
}
```

### Frontend Component Protection

```typescript
import { useCan } from '@/components/permissions/useCan';
import { PERMISSIONS } from '@/lib/permissions';

function VehicleDetailsPage({ vehicle }) {
  const canEditPhotos = useCan(PERMISSIONS.INVENTORY.PHOTOS_MANAGE);
  const canUpdateLocation = useCan(PERMISSIONS.INVENTORY.LOCATION_UPDATE);
  const canManageNotes = useCan(PERMISSIONS.INVENTORY.NOTES_MANAGE);
  const canManagePurchase = useCan(PERMISSIONS.INVENTORY.PURCHASE_MANAGE);
  const canManageTitle = useCan(PERMISSIONS.INVENTORY.TITLE_MANAGE);

  return (
    <div>
      <VehicleBasicInfo vehicle={vehicle} />
      
      {canEditPhotos && (
        <PhotoUploadSection vehicleId={vehicle.id} />
      )}
      
      {canUpdateLocation && (
        <LocationUpdateForm vehicle={vehicle} />
      )}
      
      {canManageNotes && (
        <ConditionNotesEditor vehicle={vehicle} />
      )}
      
      {canManagePurchase && (
        <PurchaseDetailsForm vehicle={vehicle} />
      )}
      
      {canManageTitle && (
        <TitleStatusManager vehicle={vehicle} />
      )}
    </div>
  );
}
```

### Using PermissionGate Component

```typescript
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { PERMISSIONS } from '@/lib/permissions';

function VehicleForm({ vehicle }) {
  return (
    <form>
      <BasicVehicleFields vehicle={vehicle} />
      
      <PermissionGate permission={PERMISSIONS.INVENTORY.PHOTOS_MANAGE}>
        <PhotoUploadField vehicleId={vehicle.id} />
      </PermissionGate>
      
      <PermissionGate permission={PERMISSIONS.INVENTORY.LOCATION_UPDATE}>
        <LocationFields vehicle={vehicle} />
      </PermissionGate>
      
      <PermissionGate permission={PERMISSIONS.INVENTORY.NOTES_MANAGE}>
        <ConditionNotesField vehicle={vehicle} />
      </PermissionGate>
      
      <PermissionGate permission={PERMISSIONS.INVENTORY.PURCHASE_MANAGE}>
        <PurchaseDetailsFields vehicle={vehicle} />
      </PermissionGate>
      
      <PermissionGate permission={PERMISSIONS.INVENTORY.TITLE_MANAGE}>
        <TitleStatusField vehicle={vehicle} />
      </PermissionGate>
    </form>
  );
}
```

## Permission Matrix

| Permission | Admin | Seller | Transporter |
|------------|-------|--------|------------|
| View Inventory List | ✅ | ✅ | ✅ |
| Add New Inventory Car | ✅ | ✅ | ❌ |
| Edit Inventory Car Details | ✅ | ✅ | ❌ |
| Upload/Edit Photos | ✅ | ✅ | ❌ |
| Update Car Location | ✅ | ✅ | ❌ |
| Condition / Mechanical Notes | ✅ | ✅ | ❌ |
| Purchase Details | ✅ | ✅ | ❌ |
| Title Status in Inventory | ✅ | ✅ | ❌ |
| Delete Vehicles | ✅ | ❌* | ❌ |
| View All Inventory | ✅ | ❌ | ❌ |

*Sellers can only delete their own vehicles (enforced by RLS policies)

## Managing Permissions

To manage these permissions:

1. Navigate to `/admin/settings/roles` (Admin only)
2. Select the role you want to modify
3. Toggle the inventory permissions ON/OFF as needed
4. Click "Save Permissions"

## Implementation Checklist

When implementing inventory features, check permissions for:

- [ ] Viewing inventory list
- [ ] Creating new vehicles
- [ ] Editing vehicle details
- [ ] Uploading/editing photos
- [ ] Updating vehicle location
- [ ] Managing condition/mechanical notes
- [ ] Managing purchase details
- [ ] Managing title status
- [ ] Deleting vehicles

## Best Practices

1. **Always check permissions on both frontend and backend**
   - Frontend: Hide unavailable features (UX)
   - Backend: Enforce security (required)

2. **Use specific permissions for specific actions**
   - Don't rely on `inventory.edit` for all edit operations
   - Use granular permissions like `inventory.photos.manage` for photo operations

3. **Group related permissions**
   - All inventory permissions are in the `inventory` module
   - Easy to find and manage in the Role Management UI

4. **Test permission changes**
   - Verify features are hidden when permission is OFF
   - Verify features are accessible when permission is ON
   - Test with different roles

