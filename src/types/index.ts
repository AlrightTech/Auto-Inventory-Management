// Re-export database types for convenience
export type {
  Profile,
  Vehicle,
  Task,
  Event,
  Message,
  Notification,
  UserStatus,
  ProfileInsert,
  VehicleInsert,
  TaskInsert,
  EventInsert,
  MessageInsert,
  NotificationInsert,
  ProfileUpdate,
  VehicleUpdate,
  TaskUpdate,
  EventUpdate,
  MessageUpdate,
  NotificationUpdate,
} from './database';

export type UserRole = 'admin' | 'seller' | 'transporter';

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isOnline: boolean;
  lastSeen: string | null;
  created_at: string;
}

export interface MessageWithSender {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: User;
}

export interface TaskWithRelations {
  id: string;
  vehicle_id: string | null;
  task_name: string;
  due_date: string;
  notes: string | null;
  assigned_to: string | null;
  assigned_by: string | null;
  category: 'missing_title' | 'file_arb' | 'location' | 'general' | null;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    color: string;
    mileage: number;
    price: number;
    status: string;
    notes: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  };
  assigned_user: User;
}

export interface DashboardMetrics {
  totalSales: number;
  totalPurchases: number;
  arbVehicles: number;
  weeklyChange: {
    sales: number;
    purchases: number;
    arb: number;
  };
}

export interface TaskFilters {
  search?: string;
  category?: string;
  status?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TaskFiltersState {
  category: string;
  status: string;
  assignedTo: string;
  dateFrom: string;
  dateTo: string;
}

export interface EventFilters {
  search?: string;
  assignedTo?: string;
  dateFrom?: string;
  dateTo?: string;
}
