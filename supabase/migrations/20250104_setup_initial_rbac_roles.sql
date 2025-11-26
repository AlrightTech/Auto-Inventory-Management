-- Setup Initial RBAC Roles
-- This migration ensures Admin, Office Staff, and Transporter roles exist with correct permissions

-- First, ensure Admin role exists (untouchable, full access)
INSERT INTO roles (name, description, is_system_role, permissions)
VALUES (
  'Admin',
  'Full system access - Cannot be edited or removed',
  true,
  '{
    "inventory": {
      "view": true,
      "add": true,
      "edit": true,
      "upload_photos": true,
      "update_location": true,
      "condition_notes": true,
      "purchase_details": true,
      "title_status": true
    },
    "sold": {
      "view": true,
      "edit": true,
      "profit_visibility": true,
      "expenses_visibility": true,
      "transportation_costs": true,
      "arb": true,
      "adjust_price": true,
      "arb_outcome_history": true
    },
    "arb": {
      "access": true,
      "create": true,
      "update": true,
      "enter_outcomes": true,
      "enter_price_adjustment": true,
      "transportation_details": true,
      "upload_documents": true
    },
    "title": {
      "status": true,
      "upload_documents": true,
      "missing_titles_dashboard": true,
      "days_missing_tracker": true
    },
    "transportation": {
      "location_tracking": true,
      "transport_assignment": true,
      "transport_notes": true,
      "transport_cost_entry": true,
      "view_history": true
    },
    "accounting": {
      "profit_per_car": true,
      "weekly_profit_summary": true,
      "monthly_profit_summary": true,
      "total_pl_summary": true,
      "accounting_page": true,
      "expenses_section": true,
      "price_adjustment_log": true,
      "export_reports": true
    },
    "reports": {
      "profit_per_car": true,
      "weekly_profit_loss": true,
      "monthly_profit_loss": true,
      "arb_activity": true,
      "arb_transportation_cost": true,
      "price_adjustment_summary": true,
      "inventory_summary": true,
      "sold_cars_weekly_count": true,
      "missing_titles": true,
      "average_transportation_cost": true,
      "average_arb_adjustment_percentage": true
    },
    "user_management": {
      "view_users": true,
      "create_roles": true,
      "edit_roles": true,
      "assign_roles": true,
      "activity_logs": true,
      "permission_editing": true
    }
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE
SET 
  is_system_role = true,
  description = 'Full system access - Cannot be edited or removed',
  permissions = EXCLUDED.permissions;

-- Office Staff Role - No profit visibility, but can see Missing Titles
INSERT INTO roles (name, description, is_system_role, permissions)
VALUES (
  'Office Staff',
  'Access to everything except profit and accounting. Can view Missing Titles report.',
  true,
  '{
    "inventory": {
      "view": true,
      "add": true,
      "edit": true,
      "upload_photos": true,
      "update_location": true,
      "condition_notes": true,
      "purchase_details": true,
      "title_status": true
    },
    "sold": {
      "view": true,
      "edit": true,
      "profit_visibility": false,
      "expenses_visibility": false,
      "transportation_costs": false,
      "arb": false,
      "adjust_price": false,
      "arb_outcome_history": false
    },
    "arb": {
      "access": false,
      "create": false,
      "update": false,
      "enter_outcomes": false,
      "enter_price_adjustment": false,
      "transportation_details": false,
      "upload_documents": false
    },
    "title": {
      "status": true,
      "upload_documents": true,
      "missing_titles_dashboard": true,
      "days_missing_tracker": true
    },
    "transportation": {
      "location_tracking": true,
      "transport_assignment": true,
      "transport_notes": true,
      "transport_cost_entry": false,
      "view_history": true
    },
    "accounting": {
      "profit_per_car": false,
      "weekly_profit_summary": false,
      "monthly_profit_summary": false,
      "total_pl_summary": false,
      "accounting_page": false,
      "expenses_section": false,
      "price_adjustment_log": false,
      "export_reports": false
    },
    "reports": {
      "profit_per_car": false,
      "weekly_profit_loss": false,
      "monthly_profit_loss": false,
      "arb_activity": false,
      "arb_transportation_cost": false,
      "price_adjustment_summary": false,
      "inventory_summary": true,
      "sold_cars_weekly_count": true,
      "missing_titles": true,
      "average_transportation_cost": false,
      "average_arb_adjustment_percentage": false
    },
    "user_management": {
      "view_users": false,
      "create_roles": false,
      "edit_roles": false,
      "assign_roles": false,
      "activity_logs": false,
      "permission_editing": false
    }
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE
SET 
  is_system_role = true,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Transporter Role - Only inventory view, location, transport features
INSERT INTO roles (name, description, is_system_role, permissions)
VALUES (
  'Transporter',
  'Restricted operational role - Inventory view, location tracking, and transport notes only',
  true,
  '{
    "inventory": {
      "view": true,
      "add": false,
      "edit": false,
      "upload_photos": false,
      "update_location": true,
      "condition_notes": false,
      "purchase_details": false,
      "title_status": false
    },
    "sold": {
      "view": false,
      "edit": false,
      "profit_visibility": false,
      "expenses_visibility": false,
      "transportation_costs": false,
      "arb": false,
      "adjust_price": false,
      "arb_outcome_history": false
    },
    "arb": {
      "access": false,
      "create": false,
      "update": false,
      "enter_outcomes": false,
      "enter_price_adjustment": false,
      "transportation_details": false,
      "upload_documents": false
    },
    "title": {
      "status": false,
      "upload_documents": false,
      "missing_titles_dashboard": false,
      "days_missing_tracker": false
    },
    "transportation": {
      "location_tracking": true,
      "transport_assignment": false,
      "transport_notes": true,
      "transport_cost_entry": true,
      "view_history": true
    },
    "accounting": {
      "profit_per_car": false,
      "weekly_profit_summary": false,
      "monthly_profit_summary": false,
      "total_pl_summary": false,
      "accounting_page": false,
      "expenses_section": false,
      "price_adjustment_log": false,
      "export_reports": false
    },
    "reports": {
      "profit_per_car": false,
      "weekly_profit_loss": false,
      "monthly_profit_loss": false,
      "arb_activity": false,
      "arb_transportation_cost": false,
      "price_adjustment_summary": false,
      "inventory_summary": false,
      "sold_cars_weekly_count": false,
      "missing_titles": false,
      "average_transportation_cost": false,
      "average_arb_adjustment_percentage": false
    },
    "user_management": {
      "view_users": false,
      "create_roles": false,
      "edit_roles": false,
      "assign_roles": false,
      "activity_logs": false,
      "permission_editing": false
    }
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE
SET 
  is_system_role = true,
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- Update any existing users with 'admin' role to use Admin role_id
UPDATE profiles p
SET role_id = (SELECT id FROM roles WHERE name = 'Admin' LIMIT 1)
WHERE p.role = 'admin' AND p.role_id IS NULL;

