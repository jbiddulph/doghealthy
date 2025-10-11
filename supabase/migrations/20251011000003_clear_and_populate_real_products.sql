-- Clear sample data first
DELETE FROM public.doghealthy_dog_food_products;

-- Real dog food products with actual Amazon UK links
-- NOTE: Replace the ASINs below with actual product ASINs from Amazon.co.uk

-- 1. Royal Canin Medium Adult
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, is_editors_choice, is_best_value, slug, tags
) VALUES (
    'Medium Adult Dry Dog Food',
    'Royal Canin',
    'Complete nutrition for medium breed adult dogs aged 1-7 years. Supports optimal digestive health and helps maintain ideal weight.',
    'dry',
    'medium',
    'adult',
    25.0,
    14.0,
    45.99,
    11.50,
    4.0,
    'https://www.amazon.co.uk/dp/B07Y2QXQXQ?tag=doghealthy-21', -- Replace B07Y2QXQXQ with actual ASIN
    'amazon',
    true,
    false,
    'royal-canin-medium-adult',
    ARRAY['royal canin', 'medium breed', 'adult', 'complete nutrition']
);

-- 2. Lily's Kitchen Grain Free
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, is_grain_free, slug, tags
) VALUES (
    'Grain Free Turkey Casserole',
    'Lily''s Kitchen',
    'Natural grain-free recipe with 65% freshly prepared turkey, sweet potato and vegetables. No artificial additives.',
    'wet',
    'all',
    'adult',
    10.5,
    5.0,
    32.99,
    16.50,
    2.0,
    'https://www.amazon.co.uk/dp/B01NBXXXX?tag=doghealthy-21', -- Replace with actual ASIN
    'amazon',
    true,
    'lilys-kitchen-grain-free-turkey',
    ARRAY['grain-free', 'turkey', 'natural', 'wet food']
);

-- 3. James Wellbeloved Hypoallergenic
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, fiber_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, special_diet, slug, tags
) VALUES (
    'Hypoallergenic Senior Fish & Rice',
    'James Wellbeloved',
    'Hypoallergenic formula for sensitive senior dogs. Single source protein from fish, with rice and vegetables.',
    'dry',
    'all',
    'senior',
    20.0,
    10.5,
    3.5,
    43.99,
    11.00,
    4.0,
    'https://www.amazon.co.uk/dp/B08XXXXX?tag=doghealthy-21', -- Replace with actual ASIN
    'amazon',
    'hypoallergenic',
    'james-wellbeloved-hypoallergenic-fish',
    ARRAY['hypoallergenic', 'fish', 'senior', 'sensitive']
);

-- 4. Purina Pro Plan OptiDigest
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, is_best_value, slug, tags
) VALUES (
    'Pro Plan Medium Adult OptiDigest',
    'Purina Pro Plan',
    'Premium nutrition with OPTIDIGEST for sensitive stomachs. High-quality lamb as first ingredient.',
    'dry',
    'medium',
    'adult',
    27.0,
    17.0,
    38.99,
    9.75,
    4.0,
    'https://www.amazon.co.uk/dp/B07XXXXX?tag=doghealthy-21', -- Replace with actual ASIN
    'amazon',
    true,
    'purina-pro-plan-optidigest',
    ARRAY['purina', 'sensitive stomach', 'lamb', 'premium']
);

-- 5. Hill's Science Plan Adult
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, slug, tags
) VALUES (
    'Science Plan Adult Perfect Weight Chicken',
    'Hill''s Science Plan',
    'Clinically proven nutrition for weight management. Helps dogs feel full and satisfied while losing weight.',
    'dry',
    'all',
    'adult',
    29.4,
    9.8,
    49.99,
    12.50,
    4.0,
    'https://www.amazon.co.uk/dp/B00XXXXX?tag=doghealthy-21', -- Replace with actual ASIN
    'amazon',
    'hills-science-plan-perfect-weight',
    ARRAY['hills', 'weight management', 'chicken', 'science']
);

-- Add more products as needed...

-- HOW TO FIND AMAZON ASINs:
-- 1. Go to Amazon.co.uk
-- 2. Search for the product (e.g., "Royal Canin Medium Adult 4kg")
-- 3. Click on the product
-- 4. Look at the URL: amazon.co.uk/dp/B07Y2QXQXQ ← That's your ASIN
-- 5. Or find it in "Product Information" section on the product page
-- 6. Replace the placeholder ASINs above with real ones

-- VERIFY YOUR AFFILIATE TAG:
-- Make sure you've signed up for Amazon Associates UK
-- Replace 'doghealthy-21' with your actual affiliate tag

