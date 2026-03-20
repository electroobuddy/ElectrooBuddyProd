-- Migration: Update products table with comprehensive e-commerce fields
-- Created: 2026-03-20
-- Description: Adds all necessary fields for modern product management

-- Step 0: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Step 1: Drop existing table if it exists (be careful in production!)
-- Uncomment only if you want to start fresh:
-- DROP TABLE IF EXISTS products CASCADE;

-- Step 2: Add new columns to products table
ALTER TABLE products 
-- Add short description for listings
ADD COLUMN IF NOT EXISTS short_description TEXT,

-- Add pricing fields
ADD COLUMN IF NOT EXISTS cost_per_item DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(10,2),

-- Add inventory management
ADD COLUMN IF NOT EXISTS track_inventory BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_backorder BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS inventory_quantity INTEGER DEFAULT 0,

-- Add installation service
ADD COLUMN IF NOT EXISTS installation_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS installation_charge DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS installation_description TEXT,

-- Add categorization
ADD COLUMN IF NOT EXISTS subcategory TEXT,
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],

-- Add specifications (JSONB for flexible attributes)
ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb,

-- Add physical properties
ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS weight_unit TEXT DEFAULT 'kg',
ADD COLUMN IF NOT EXISTS length DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS width DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS height DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS dimension_unit TEXT DEFAULT 'cm',

-- Add SEO fields
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,

-- Add display flags
ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Step 3: Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products (is_featured);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products (sort_order);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN products.short_description IS 'Brief summary shown in product listings';
COMMENT ON COLUMN products.compare_at_price IS 'Original price for showing discounts';
COMMENT ON COLUMN products.cost_per_item IS 'Internal cost, not shown to customers';
COMMENT ON COLUMN products.track_inventory IS 'Enable stock quantity tracking';
COMMENT ON COLUMN products.allow_backorder IS 'Allow orders when out of stock';
COMMENT ON COLUMN products.installation_available IS 'Professional installation service available';
COMMENT ON COLUMN products.installation_charge IS 'Cost for installation service';
COMMENT ON COLUMN products.subcategory IS 'Secondary category classification';
COMMENT ON COLUMN products.brand IS 'Product manufacturer/brand';
COMMENT ON COLUMN products.tags IS 'Searchable tags array';
COMMENT ON COLUMN products.specifications IS 'JSONB object for product specs (e.g., color, material, etc.)';
COMMENT ON COLUMN products.weight IS 'Product weight for shipping';
COMMENT ON COLUMN products.dimension_unit IS 'Unit for dimensions (cm, mm, in)';
COMMENT ON COLUMN products.meta_title IS 'SEO page title';
COMMENT ON COLUMN products.meta_description IS 'SEO meta description';
COMMENT ON COLUMN products.is_bestseller IS 'Mark as bestselling product';
COMMENT ON COLUMN products.sort_order IS 'Custom display order (lower = first)';

-- Step 5: Grant permissions (adjust role names as needed)
GRANT ALL ON products TO authenticated;
GRANT SELECT ON products TO anon;

-- Step 6: Add RLS policies if not already present
DO $$ BEGIN
    -- Enable RLS
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    -- Allow public read access for active products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Active products are viewable by everyone') THEN
        CREATE POLICY "Active products are viewable by everyone" ON products
            FOR SELECT USING (is_active = true);
    END IF;
    
    -- Allow authenticated users (admins) full access
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Authenticated users can manage products') THEN
        CREATE POLICY "Authenticated users can manage products" ON products
            FOR ALL TO authenticated USING (true);
    END IF;
END $$;
