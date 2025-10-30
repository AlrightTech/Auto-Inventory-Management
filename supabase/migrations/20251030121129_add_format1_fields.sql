-- Migration for additional fields based on format1.md import, generated 2025-10-30 12:11:29 UTC
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS other_charges2 DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS buyer_rep_aa_id TEXT,
  ADD COLUMN IF NOT EXISTS sale_invoice_paid_date DATE,
  ADD COLUMN IF NOT EXISTS pickup_location_address2 TEXT;
