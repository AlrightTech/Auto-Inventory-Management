import { z } from 'zod';

export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  vin: z.string().length(17, 'VIN must be 17 characters').optional().or(z.literal('')),
  purchase_date: z.string().min(1, 'Purchase date is required'),
  status: z.enum(['pending', 'sold', 'withdrew', 'complete', 'arb', 'in_progress']),
  pickup_location: z.string().min(1, 'Pickup location is required'),
  odometer: z.number().optional(),
  bought_price: z.number().optional(),
  title_status: z.enum(['absent', 'present', 'in_transit', 'received', 'available_not_received', 'released', 'validated', 'sent_not_validated']),
  arb_status: z.enum(['absent', 'present', 'in_transit', 'failed']),
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
