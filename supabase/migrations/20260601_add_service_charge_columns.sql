-- Migration: Add service charge columns to services table
-- Date: 2026-06-01
-- Description: Adds service_charge, show_visit_charge, and visit_charge_label columns

-- Add service charge columns to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS service_charge text;

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS show_visit_charge boolean DEFAULT false;

ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS visit_charge_label text DEFAULT 'Visit Charge';
