-- Migration: Add index for cart_items user_id for better performance
-- Date: 2026-06-01
-- Description: Adds index on cart_items.user_id for faster cart queries

-- Add index for cart_items user_id (if not exists)
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id 
ON public.cart_items(user_id);

-- Add composite index for user_id + product_id queries
CREATE INDEX IF NOT EXISTS idx_cart_items_user_product 
ON public.cart_items(user_id, product_id);
