export interface Vehicle {
  id: string;
  
  // Basic Vehicle Information
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  exterior_color?: string;
  interior_color?: string;
  
  // Vehicle Status and Details
  status: 'Pending' | 'Sold' | 'Withdrew' | 'Complete' | 'ARB' | 'In Progress';
  odometer?: number;
  title_status: 'Present' | 'Absent';
  psi_status?: string;
  dealshield_arbitration_status?: string;
  
  // Financial Information
  bought_price?: number;
  buy_fee?: number;
  sale_invoice?: number;
  total_vehicle_cost?: number;
  other_charges?: number;
  
  // Sale Information
  sale_date?: string;
  lane?: number;
  run?: number;
  channel?: string;
  
  // Location Information
  facilitating_location?: string;
  vehicle_location?: string;
  pickup_location_address1?: string;
  pickup_location_city?: string;
  pickup_location_state?: string;
  pickup_location_zip?: string;
  pickup_location_phone?: string;
  
  // Seller and Buyer Information
  seller_name?: string;
  buyer_dealership?: string;
  buyer_contact_name?: string;
  buyer_aa_id?: string;
  buyer_reference?: string;
  sale_invoice_status?: 'PAID' | 'UNPAID';
  
  // System Fields
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VehicleInsert {
  // Basic Vehicle Information
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  exterior_color?: string;
  interior_color?: string;
  
  // Vehicle Status and Details
  status?: 'Pending' | 'Sold' | 'Withdrew' | 'Complete' | 'ARB' | 'In Progress';
  odometer?: number;
  title_status?: 'Present' | 'Absent';
  psi_status?: string;
  dealshield_arbitration_status?: string;
  
  // Financial Information
  bought_price?: number;
  buy_fee?: number;
  sale_invoice?: number;
  total_vehicle_cost?: number;
  other_charges?: number;
  
  // Sale Information
  sale_date?: string;
  lane?: number;
  run?: number;
  channel?: string;
  
  // Location Information
  facilitating_location?: string;
  vehicle_location?: string;
  pickup_location_address1?: string;
  pickup_location_city?: string;
  pickup_location_state?: string;
  pickup_location_zip?: string;
  pickup_location_phone?: string;
  
  // Seller and Buyer Information
  seller_name?: string;
  buyer_dealership?: string;
  buyer_contact_name?: string;
  buyer_aa_id?: string;
  buyer_reference?: string;
  sale_invoice_status?: 'PAID' | 'UNPAID';
}

export interface VehicleUpdate extends Partial<VehicleInsert> {
  id: string;
}

export interface VehicleWithRelations extends Vehicle {
  created_by_user?: {
    id: string;
    username: string;
    email: string;
  };
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  vehicles: Vehicle[];
}

export interface FileUploadResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}
