-- ============================================
-- QUICK SETUP: Dog Food Finder Tables
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Step 1: Check if table exists and drop if needed (CAREFUL!)
DROP TABLE IF EXISTS public.doghealthy_affiliate_clicks CASCADE;
DROP TABLE IF EXISTS public.doghealthy_dog_food_products CASCADE;
DROP TABLE IF EXISTS public.doghealthy_email_leads CASCADE;

-- Step 2: Create dog food products table
CREATE TABLE public.doghealthy_dog_food_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Food characteristics
    food_type VARCHAR(50),
    breed_size VARCHAR(50),
    life_stage VARCHAR(50),
    special_diet VARCHAR(100),
    
    -- Nutrition (per 100g)
    protein_percent DECIMAL(5, 2),
    fat_percent DECIMAL(5, 2),
    fiber_percent DECIMAL(5, 2),
    calories_per_100g INTEGER,
    
    -- Main ingredients
    main_ingredients TEXT[],
    
    -- Pricing
    price_gbp DECIMAL(10, 2),
    price_per_kg DECIMAL(10, 2),
    package_size_kg DECIMAL(10, 2),
    
    -- Affiliate & Links
    affiliate_link TEXT NOT NULL,
    retailer VARCHAR(100),
    product_url TEXT,
    
    -- Ratings
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Features
    is_editors_choice BOOLEAN DEFAULT false,
    is_best_value BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_grain_free BOOLEAN DEFAULT false,
    is_natural BOOLEAN DEFAULT false,
    
    -- SEO
    slug VARCHAR(255) UNIQUE,
    tags TEXT[],
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    stock_status VARCHAR(50) DEFAULT 'in-stock',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 3: Create indexes
CREATE INDEX idx_doghealthy_food_brand ON public.doghealthy_dog_food_products(brand);
CREATE INDEX idx_doghealthy_food_type ON public.doghealthy_dog_food_products(food_type);
CREATE INDEX idx_doghealthy_food_breed_size ON public.doghealthy_dog_food_products(breed_size);
CREATE INDEX idx_doghealthy_food_is_active ON public.doghealthy_dog_food_products(is_active);

-- Step 4: Enable RLS
ALTER TABLE public.doghealthy_dog_food_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active dog food products"
    ON public.doghealthy_dog_food_products
    FOR SELECT
    USING (is_active = true);

-- Step 5: Create affiliate clicks table
CREATE TABLE public.doghealthy_affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.doghealthy_dog_food_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    retailer VARCHAR(100),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    converted BOOLEAN DEFAULT false,
    conversion_value DECIMAL(10, 2)
);

CREATE INDEX idx_affiliate_clicks_product ON public.doghealthy_affiliate_clicks(product_id);
CREATE INDEX idx_affiliate_clicks_date ON public.doghealthy_affiliate_clicks(clicked_at);

ALTER TABLE public.doghealthy_affiliate_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can track affiliate clicks"
    ON public.doghealthy_affiliate_clicks
    FOR INSERT
    WITH CHECK (true);

-- Step 6: Create email leads table
CREATE TABLE public.doghealthy_email_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    source VARCHAR(100),
    quiz_answers JSONB,
    recommended_products UUID[],
    subscribed BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_contacted_at TIMESTAMP WITH TIME ZONE,
    unsubscribed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_email_leads_email ON public.doghealthy_email_leads(email);
CREATE INDEX idx_email_leads_source ON public.doghealthy_email_leads(source);

ALTER TABLE public.doghealthy_email_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit email for leads"
    ON public.doghealthy_email_leads
    FOR INSERT
    WITH CHECK (true);

-- ============================================
-- SUCCESS! Tables created.
-- Now add real products below with actual ASINs from Amazon.co.uk
-- ============================================

-- ============================================
-- HOW TO GET PRODUCT IMAGE URLS FROM AMAZON:
-- ============================================
-- 1. Go to the Amazon product page
-- 2. Right-click on the main product image
-- 3. Choose "Copy Image Address" or "Copy Image Link"
-- 4. The URL will look like:
--    https://m.media-amazon.com/images/I/71AbCdEfGh._AC_SL1500_.jpg
-- 5. Paste this into the image_url field below
-- ============================================

-- EXAMPLE with REAL product (you can use this one!):
-- Royal Canin Medium Adult - Real ASIN: B00CWF25MU
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, image_url,
    food_type, breed_size, life_stage,
    protein_percent, fat_percent,
    price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer,
    is_editors_choice,
    slug, tags
) VALUES (
    'Medium Adult Dry Dog Food 4kg',
    'Royal Canin',
    'Complete nutrition for medium breed adult dogs aged 1-7 years. Supports optimal digestive health.',
    'https://m.media-amazon.com/images/I/71YQKGz9JyL._AC_SL1500_.jpg',
    'dry',
    'medium',
    'adult',
    25.0,
    14.0,
    45.99,
    11.50,
    4.0,
    'https://www.amazon.co.uk/dp/B00CWF25MU?tag=doghealthy-21',
    'amazon',
    true,
    'royal-canin-medium-adult',
    ARRAY['royal canin', 'medium breed', 'adult', 'dry food']
);

-- TEMPLATE for adding more products:
/*
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, image_url,
    food_type, breed_size, life_stage,
    protein_percent, fat_percent,
    price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer,
    is_editors_choice,
    slug, tags
) VALUES (
    'Product Name',
    'Brand Name',
    'Product description',
    'https://m.media-amazon.com/images/I/COPIED_IMAGE_URL.jpg', -- RIGHT-CLICK on Amazon image → Copy Image Address
    'dry',
    'medium',
    'adult',
    25.0,
    14.0,
    45.99,
    11.50,
    4.0,
    'https://www.amazon.co.uk/dp/REAL_ASIN?tag=doghealthy-21',
    'amazon',
    false,
    'brand-product-slug',
    ARRAY['tag1', 'tag2']
);
*/

