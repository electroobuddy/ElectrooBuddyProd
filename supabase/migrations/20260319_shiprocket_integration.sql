-- Shiprocket Integration - Database Migration
-- Adds necessary columns to orders table for shipping integration

-- Add Shiprocket-related columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shiprocket_order_id TEXT,
ADD COLUMN IF NOT EXISTS shiprocket_shipment_id TEXT,
ADD COLUMN IF NOT EXISTS tracking_history JSONB,
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS shipping_carrier TEXT,
ADD COLUMN IF NOT EXISTS shipping_weight DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS shipping_dimensions JSONB; -- {length, breadth, height}

-- Create index for faster tracking lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX IF NOT EXISTS idx_orders_shiprocket_order_id ON orders(shiprocket_order_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.shiprocket_order_id IS 'Shiprocket Order ID';
COMMENT ON COLUMN orders.shiprocket_shipment_id IS 'Shiprocket Shipment/AWB ID';
COMMENT ON COLUMN orders.tracking_history IS 'Array of tracking events from Shiprocket';
COMMENT ON COLUMN orders.estimated_delivery_date IS 'Estimated delivery date from Shiprocket';
COMMENT ON COLUMN orders.shipping_carrier IS 'Actual courier carrier assigned by Shiprocket';
COMMENT ON COLUMN orders.shipping_weight IS 'Package weight in kg';
COMMENT ON COLUMN orders.shipping_dimensions IS 'Package dimensions {length, breadth, height} in cm';

-- Create function to auto-update timestamps
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status-specific timestamps
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = NOW();
  ELSIF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
    NEW.shipped_at = NOW();
  ELSIF NEW.status = 'out_for_delivery' AND OLD.status != 'out_for_delivery' THEN
    NEW.out_for_delivery_at = NOW();
  ELSIF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.delivered_at = NOW();
  ELSIF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = NOW();
  END IF;
  
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating timestamps
DROP TRIGGER IF EXISTS trg_update_order_timestamps ON orders;
CREATE TRIGGER trg_update_order_timestamps
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_order_timestamps();

-- RLS Policies for Shiprocket webhook (if using service role)
-- Allow service role to update tracking information
DROP POLICY IF EXISTS "Service role can update order tracking" ON orders;
CREATE POLICY "Service role can update order tracking"
ON orders FOR ALL
USING (auth.jwt()->>'role' = 'service_role')
WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Grant necessary permissions
GRANT ALL ON orders TO service_role;
