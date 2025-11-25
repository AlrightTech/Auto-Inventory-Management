import { z } from 'zod';

export const vehicleSchema = z.object({
  // Basic Vehicle Information
  make: z.string().min(1, 'Make is required.'),
  model: z.string().min(1, 'Model is required.'),
  year: z.coerce.number()
    .min(1900, 'Year must be 1900 or later')
    .max(new Date().getFullYear() + 1, `Year cannot be later than ${new Date().getFullYear() + 1}`),
  vin: z.string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true; // VIN is optional
      const trimmed = val.trim();
      return trimmed.length === 17; // Standard VIN length is 17 characters
    }, {
      message: 'VIN must be exactly 17 characters if provided.',
    }),
  trim: z.string().optional(),
  exterior_color: z.string().optional(),
  interior_color: z.string().optional(),
  
  // Vehicle Status and Details
  status: z.enum(['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress', 'Pending Arbitration']).optional().default('Pending'),
  odometer: z.number().optional(),
  title_status: z.enum(['Absent', 'Released', 'Received', 'Present', 'In Transit', 'Available not Received', 'Validated', 'Sent but not Validated']).optional().default('Absent'),
  psi_status: z.string().optional(),
  dealshield_arbitration_status: z.string().optional(),
  
  // Financial Information
  bought_price: z.number().optional(),
  buy_fee: z.number().optional(),
  sale_invoice: z.number().optional(),
  total_vehicle_cost: z.number().optional(),
  other_charges: z.number().optional(), // No validation - accepts any value or empty
  
  // Sale Information
  sale_date: z.string().optional(),
  lane: z.number().optional(),
  run: z.number().optional(),
  channel: z.string().optional(),
  
  // Location Information
  facilitating_location: z.string().optional(),
  vehicle_location: z.string().optional(),
  pickup_location_address1: z.string().optional(),
  pickup_location_city: z.string().min(1, 'Pickup location is required.'),
  pickup_location_state: z.string().optional(),
  pickup_location_zip: z.string().optional(),
  pickup_location_phone: z.string().optional(),
  
  // Seller and Buyer Information
  seller_name: z.string().optional(),
  buyer_dealership: z.string().optional(),
  buyer_contact_name: z.string().optional(),
  buyer_aa_id: z.string().optional(),
  buyer_reference: z.string().optional(),
  sale_invoice_status: z.enum(['PAID', 'UNPAID']).optional(),
}).refine((data) => {
  // Validate purchase date is not in the future
  if (data.sale_date) {
    const saleDate = new Date(data.sale_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (saleDate > today) {
      return false;
    }
  }
  return true;
}, {
  message: 'Purchase date cannot be a future date.',
  path: ['sale_date'],
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
