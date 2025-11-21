-- Add ARB tracking fields to vehicles table
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS arb_type TEXT CHECK (arb_type IN ('sold_arb', 'inventory_arb')),
ADD COLUMN IF NOT EXISTS arb_outcome TEXT CHECK (arb_outcome IN ('denied', 'price_adjustment', 'buyer_withdrew', 'withdrawn')),
ADD COLUMN IF NOT EXISTS arb_adjustment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS arb_transport_type TEXT,
ADD COLUMN IF NOT EXISTS arb_transport_company TEXT,
ADD COLUMN IF NOT EXISTS arb_transport_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS arb_initiated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS arb_resolved_at TIMESTAMPTZ;

-- Create index for ARB queries
CREATE INDEX IF NOT EXISTS idx_vehicles_arb_type ON vehicles(arb_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_arb_outcome ON vehicles(arb_outcome);
CREATE INDEX IF NOT EXISTS idx_vehicles_status_arb ON vehicles(status) WHERE status = 'ARB';

-- Add comment for documentation
COMMENT ON COLUMN vehicles.arb_type IS 'Type of ARB: sold_arb (initiated from Sold) or inventory_arb (initiated from Inventory)';
COMMENT ON COLUMN vehicles.arb_outcome IS 'ARB outcome: denied, price_adjustment, buyer_withdrew (sold_arb), withdrawn (inventory_arb)';
COMMENT ON COLUMN vehicles.arb_adjustment_amount IS 'Price adjustment amount (positive for inventory_arb, negative for sold_arb)';
COMMENT ON COLUMN vehicles.arb_transport_cost IS 'Transport cost when buyer withdrew (sold_arb only)';

