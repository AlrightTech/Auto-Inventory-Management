import { z } from 'zod';

export const vehicleSchema = z.object({
  // Basic Vehicle Information
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  vin: z.string().min(17, 'VIN must be 17 characters').max(17, 'VIN must be 17 characters').optional().or(z.literal('')),
  trim: z.string().optional(),
  exterior_color: z.string().optional(),
  interior_color: z.string().optional(),
  
  // Vehicle Status and Details
  status: z.enum(['Pending', 'Sold', 'Withdrew', 'Complete', 'ARB', 'In Progress']).optional(),
  odometer: z.number().optional(),
  title_status: z.enum(['Present', 'Absent']).optional(),
  psi_status: z.string().optional(),
  dealshield_arbitration_status: z.string().optional(),
  
  // Financial Information
  bought_price: z.number().optional(),
  buy_fee: z.number().optional(),
  sale_invoice: z.number().optional(),
  total_vehicle_cost: z.number().optional(),
  other_charges: z.number().optional(),
  
  // Sale Information
  sale_date: z.string().optional(),
  lane: z.number().optional(),
  run: z.number().optional(),
  channel: z.string().optional(),
  
  // Location Information
  facilitating_location: z.string().optional(),
  vehicle_location: z.string().optional(),
  pickup_location_address1: z.string().optional(),
  pickup_location_city: z.string().optional(),
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
});

export type VehicleInput = z.infer<typeof vehicleSchema>;
