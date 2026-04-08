-- Add service charge and visit charge display fields to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS service_charge DECIMAL(10, 2) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS show_visit_charge BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS visit_charge_label TEXT DEFAULT 'Visit Charge';

-- Add comment to explain the fields
COMMENT ON COLUMN public.services.service_charge IS 'Service charge/visit charge amount in INR';
COMMENT ON COLUMN public.services.show_visit_charge IS 'Whether to display the charge on the service card';
COMMENT ON COLUMN public.services.visit_charge_label IS 'Label to display (e.g., "Visit Charge", "Service Charge", "Diagnostic Fee")';
