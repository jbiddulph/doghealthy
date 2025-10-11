-- Create dog food products table
CREATE TABLE IF NOT EXISTS public.doghealthy_dog_food_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    
    -- Food characteristics
    food_type VARCHAR(50), -- 'dry', 'wet', 'raw', 'freeze-dried'
    breed_size VARCHAR(50), -- 'small', 'medium', 'large', 'all'
    life_stage VARCHAR(50), -- 'puppy', 'adult', 'senior', 'all'
    special_diet VARCHAR(100), -- 'grain-free', 'hypoallergenic', 'weight-management', etc.
    
    -- Nutrition (per 100g)
    protein_percent DECIMAL(5, 2),
    fat_percent DECIMAL(5, 2),
    fiber_percent DECIMAL(5, 2),
    calories_per_100g INTEGER,
    
    -- Main ingredients (top 5)
    main_ingredients TEXT[], -- Array of strings
    
    -- Pricing
    price_gbp DECIMAL(10, 2),
    price_per_kg DECIMAL(10, 2),
    package_size_kg DECIMAL(10, 2),
    
    -- Affiliate & Links
    affiliate_link TEXT NOT NULL,
    retailer VARCHAR(100), -- 'amazon', 'pets-at-home', 'zooplus', etc.
    product_url TEXT,
    
    -- Ratings & Reviews
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Features & Badges
    is_editors_choice BOOLEAN DEFAULT false,
    is_best_value BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    is_grain_free BOOLEAN DEFAULT false,
    is_natural BOOLEAN DEFAULT false,
    
    -- SEO & Organization
    slug VARCHAR(255) UNIQUE,
    tags TEXT[], -- Array of searchable tags
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    stock_status VARCHAR(50) DEFAULT 'in-stock', -- 'in-stock', 'low-stock', 'out-of-stock'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for fast filtering
CREATE INDEX idx_doghealthy_food_brand ON public.doghealthy_dog_food_products(brand);
CREATE INDEX idx_doghealthy_food_type ON public.doghealthy_dog_food_products(food_type);
CREATE INDEX idx_doghealthy_food_breed_size ON public.doghealthy_dog_food_products(breed_size);
CREATE INDEX idx_doghealthy_food_price ON public.doghealthy_dog_food_products(price_gbp);
CREATE INDEX idx_doghealthy_food_rating ON public.doghealthy_dog_food_products(avg_rating);
CREATE INDEX idx_doghealthy_food_slug ON public.doghealthy_dog_food_products(slug);
CREATE INDEX idx_doghealthy_food_is_active ON public.doghealthy_dog_food_products(is_active);

-- Enable RLS (public read access)
ALTER TABLE public.doghealthy_dog_food_products ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (everyone can view products)
CREATE POLICY "Anyone can view active dog food products"
    ON public.doghealthy_dog_food_products
    FOR SELECT
    USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_doghealthy_food_updated_at
    BEFORE UPDATE ON public.doghealthy_dog_food_products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create affiliate click tracking table
CREATE TABLE IF NOT EXISTS public.doghealthy_affiliate_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.doghealthy_dog_food_products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.doghealthy_users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    retailer VARCHAR(100),
    
    -- Tracking data
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- UTM parameters
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    
    -- Conversion tracking (update this if/when you get conversion data)
    converted BOOLEAN DEFAULT false,
    conversion_value DECIMAL(10, 2)
);

-- Create indexes for analytics
CREATE INDEX idx_affiliate_clicks_product ON public.doghealthy_affiliate_clicks(product_id);
CREATE INDEX idx_affiliate_clicks_date ON public.doghealthy_affiliate_clicks(clicked_at);
CREATE INDEX idx_affiliate_clicks_retailer ON public.doghealthy_affiliate_clicks(retailer);

-- Enable RLS
ALTER TABLE public.doghealthy_affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Policy for inserting click tracking (anyone can track)
CREATE POLICY "Anyone can track affiliate clicks"
    ON public.doghealthy_affiliate_clicks
    FOR INSERT
    WITH CHECK (true);

-- Insert sample dog food products
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, is_editors_choice, slug, tags
) VALUES
(
    'Adult Chicken & Rice Dry Dog Food',
    'Royal Canin',
    'Complete and balanced nutrition for adult dogs with chicken and rice.',
    'dry',
    'medium',
    'adult',
    25.0,
    14.0,
    45.99,
    11.50,
    4.0,
    'https://www.amazon.co.uk/dp/EXAMPLE?tag=your-tag',
    'amazon',
    true,
    'royal-canin-adult-chicken-rice',
    ARRAY['chicken', 'rice', 'complete nutrition', 'medium breeds']
),
(
    'Grain Free Turkey & Sweet Potato',
    'Lily''s Kitchen',
    'Natural grain-free recipe with 65% turkey and vegetables.',
    'dry',
    'all',
    'adult',
    28.0,
    16.0,
    52.99,
    17.66,
    3.0,
    'https://www.amazon.co.uk/dp/EXAMPLE2?tag=your-tag',
    'amazon',
    false,
    'lilys-kitchen-grain-free-turkey',
    ARRAY['grain-free', 'turkey', 'natural', 'all breeds']
),
(
    'Hypoallergenic Salmon & Potato',
    'James Wellbeloved',
    'Hypoallergenic formula for dogs with sensitivities.',
    'dry',
    'all',
    'adult',
    20.0,
    10.5,
    39.99,
    10.00,
    4.0,
    'https://www.amazon.co.uk/dp/EXAMPLE3?tag=your-tag',
    'amazon',
    false,
    'james-wellbeloved-salmon-potato',
    ARRAY['hypoallergenic', 'salmon', 'sensitive', 'all breeds']
);

