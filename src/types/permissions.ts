// Permission Types for RBAC System

export type PermissionModule = 
  | 'inventory'
  | 'sold'
  | 'arb'
  | 'title'
  | 'transportation'
  | 'accounting'
  | 'reports'
  | 'user_management';

export interface InventoryPermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  upload_photos: boolean;
  update_location: boolean;
  condition_notes: boolean;
  purchase_details: boolean;
  title_status: boolean;
}

export interface SoldPermissions {
  view: boolean;
  edit: boolean;
  profit_visibility: boolean;
  expenses_visibility: boolean;
  transportation_costs: boolean;
  arb: boolean;
  adjust_price: boolean;
  arb_outcome_history: boolean;
}

export interface ARBPermissions {
  access: boolean;
  create: boolean;
  update: boolean;
  enter_outcomes: boolean;
  enter_price_adjustment: boolean;
  transportation_details: boolean;
  upload_documents: boolean;
}

export interface TitlePermissions {
  status: boolean;
  upload_documents: boolean;
  missing_titles_dashboard: boolean;
  days_missing_tracker: boolean;
}

export interface TransportationPermissions {
  location_tracking: boolean;
  transport_assignment: boolean;
  transport_notes: boolean;
  transport_cost_entry: boolean;
  view_history: boolean;
}

export interface AccountingPermissions {
  profit_per_car: boolean;
  weekly_profit_summary: boolean;
  monthly_profit_summary: boolean;
  total_pl_summary: boolean;
  accounting_page: boolean;
  expenses_section: boolean;
  price_adjustment_log: boolean;
  export_reports: boolean;
}

export interface ReportsPermissions {
  profit_per_car: boolean;
  weekly_profit_loss: boolean;
  monthly_profit_loss: boolean;
  arb_activity: boolean;
  arb_transportation_cost: boolean;
  price_adjustment_summary: boolean;
  inventory_summary: boolean;
  sold_cars_weekly_count: boolean;
  missing_titles: boolean;
  average_transportation_cost: boolean;
  average_arb_adjustment_percentage: boolean;
}

export interface UserManagementPermissions {
  view_users: boolean;
  create_roles: boolean;
  edit_roles: boolean;
  assign_roles: boolean;
  activity_logs: boolean;
  permission_editing: boolean;
}

export interface RolePermissions {
  inventory: InventoryPermissions;
  sold: SoldPermissions;
  arb: ARBPermissions;
  title: TitlePermissions;
  transportation: TransportationPermissions;
  accounting: AccountingPermissions;
  reports: ReportsPermissions;
  user_management: UserManagementPermissions;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system_role: boolean;
  permissions: RolePermissions;
  created_at: string;
  updated_at: string;
}

export interface ProfileWithRole {
  id: string;
  email: string;
  role: string; // Legacy role field
  role_id: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  role_data?: Role | null;
}

// Permission check helper types
export type PermissionPath = 
  | `inventory.${keyof InventoryPermissions}`
  | `sold.${keyof SoldPermissions}`
  | `arb.${keyof ARBPermissions}`
  | `title.${keyof TitlePermissions}`
  | `transportation.${keyof TransportationPermissions}`
  | `accounting.${keyof AccountingPermissions}`
  | `reports.${keyof ReportsPermissions}`
  | `user_management.${keyof UserManagementPermissions}`;



