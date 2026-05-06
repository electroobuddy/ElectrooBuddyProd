-- Add coupon_code column to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS coupon_code TEXT UNIQUE;
ALTER TABLE offers ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Add applied_coupon fields to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS original_charge NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_charge NUMERIC;

-- Create index for fast coupon lookups
CREATE INDEX IF NOT EXISTS idx_offers_coupon_code ON offers(coupon_code) WHERE coupon_code IS NOT NULL;

-- Update get_active_offers RPC to include coupon_code and expires_at
-- (If you have an existing RPC, update it; otherwise create it)
CREATE OR REPLACE FUNCTION get_active_offers(p_visibility TEXT)
RETURNS SETOF offers
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM offers
  WHERE is_active = true
    AND status = 'active'
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW())
    AND p_visibility = ANY(visibility)
  ORDER BY priority DESC;
$$;

-- Function to validate and apply a coupon code
CREATE OR REPLACE FUNCTION validate_coupon(
  p_coupon_code TEXT,
  p_service_type TEXT DEFAULT NULL,
  p_amount NUMERIC DEFAULT 0
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_offer offers%ROWTYPE;
  v_discount NUMERIC := 0;
  v_final NUMERIC := p_amount;
BEGIN
  -- Find the offer by coupon code
  SELECT * INTO v_offer
  FROM offers
  WHERE UPPER(coupon_code) = UPPER(p_coupon_code)
    AND is_active = true
    AND status = 'active'
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Invalid or expired coupon code'
    );
  END IF;

  -- Calculate discount
  IF v_offer.type = 'percentage' AND v_offer.value > 0 THEN
    v_discount := ROUND((p_amount * v_offer.value / 100)::NUMERIC, 2);
    IF v_offer.max_discount IS NOT NULL AND v_discount > v_offer.max_discount THEN
      v_discount := v_offer.max_discount;
    END IF;
  ELSIF v_offer.type = 'flat' AND v_offer.value > 0 THEN
    v_discount := LEAST(v_offer.value, p_amount);
  END IF;

  v_final := GREATEST(p_amount - v_discount, 0);

  RETURN json_build_object(
    'valid', true,
    'offer_id', v_offer.id,
    'title', v_offer.title,
    'subtitle', v_offer.subtitle,
    'type', v_offer.type,
    'value', v_offer.value,
    'discount_amount', v_discount,
    'final_amount', v_final,
    'message', 'Coupon applied successfully!'
  );
END;
$$;