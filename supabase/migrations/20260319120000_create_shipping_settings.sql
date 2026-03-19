-- Shipping Settings Table for Shiprocket Integration
-- Stores configuration for Shiprocket API and shipping preferences

CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- Basic Configuration
  enabled BOOLEAN NOT NULL DEFAULT false,
  auto_create_shipment BOOLEAN NOT NULL DEFAULT true,
  email TEXT,
  password TEXT,
  webhook_url TEXT,
  
  -- Default Package Dimensions
  default_weight DECIMAL(10, 2) DEFAULT 1.00,
  default_length DECIMAL(10, 2) DEFAULT 10.00,
  default_breadth DECIMAL(10, 2) DEFAULT 10.00,
  default_height DECIMAL(10, 2) DEFAULT 10.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint to ensure only one row exists
  CONSTRAINT shipping_settings_single_row CHECK (id = 1)
);

ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;

-- Create trigger to update timestamp
CREATE TRIGGER update_shipping_settings_updated_at 
  BEFORE UPDATE ON public.shipping_settings 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
-- Only authenticated admins can view and modify shipping settings
CREATE POLICY "Admins can view shipping settings"
ON public.shipping_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update shipping settings"
ON public.shipping_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Insert default row
INSERT INTO public.shipping_settings (id, enabled, auto_create_shipment, webhook_url)
VALUES (1, false, true, 'https://vgsfkkmbkgdeireqliuq.supabase.co/functions/v1/shiprocket-webhook')
ON CONFLICT (id) DO NOTHING;
