-- Add some test dog food products for development
-- These are set to is_active = TRUE so they show up in the Food Finder

INSERT INTO public.doghealthy_dog_food_products (
  name, brand, food_type, price_gbp, life_stage, breed_size, 
  is_grain_free, protein_percent, fat_percent, description, 
  affiliate_link, retailer, avg_rating, is_active, package_size_kg, price_per_kg
) VALUES
-- Premium Dry Dog Foods
('Purina Pro Plan Adult Medium Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 49.99, 'adult', 'medium', false, 27.0, 16.0, 
'High-protein dry dog food with real chicken as the first ingredient. Enhanced with OPTIDIGEST for digestive health and immune support.', 
'https://www.amazon.co.uk/dp/B0BQS8KXTJ?tag=doghealthy-21', 'Amazon UK', 4.5, true, 14.0, 3.57),

('Pedigree Complete Adult Dry Dog Food Chicken & Vegetables 15kg', 'Pedigree', 'dry', 32.99, 'adult', 'all', false, 21.0, 10.0, 
'Complete and balanced nutrition with omega 3 & 6 fatty acids, zinc and B vitamins for healthy skin and coat.', 
'https://www.amazon.co.uk/dp/B01N6PNQJS?tag=doghealthy-21', 'Amazon UK', 4.2, true, 15.0, 2.20),

('Royal Canin Medium Adult Dry Dog Food 15kg', 'Royal Canin', 'dry', 59.99, 'adult', 'medium', false, 25.0, 14.0, 
'Tailored nutrition for medium breed dogs with natural defenses support and digestive health.', 
'https://www.amazon.co.uk/dp/B07G8JZQ1X?tag=doghealthy-21', 'Amazon UK', 4.7, true, 15.0, 4.00),

('Hill''s Science Plan Adult Large Breed Chicken 15kg', 'Hills Science Plan', 'dry', 65.99, 'adult', 'large', false, 26.0, 15.0, 
'Specifically formulated for large breed dogs with glucosamine and chondroitin for joint health.', 
'https://www.amazon.co.uk/dp/B07H8ZQ2X1?tag=doghealthy-21', 'Amazon UK', 4.6, true, 15.0, 4.40),

('IAMS Adult Large Breed Chicken 15kg', 'IAMS', 'dry', 42.99, 'adult', 'large', false, 24.0, 13.0, 
'Complete nutrition for large breed dogs with 0% artificial preservatives, flavours or colours.', 
'https://www.amazon.co.uk/dp/B07H9ZQ3X2?tag=doghealthy-21', 'Amazon UK', 4.3, true, 15.0, 2.87),

-- Grain-Free Options
('Lily''s Kitchen Chicken & Duck Dry Dog Food 7kg', 'Lilys Kitchen', 'dry', 44.99, 'adult', 'all', true, 26.0, 15.0, 
'Natural dry dog food made with free-range chicken and duck. Grain-free recipe with no artificial additives.', 
'https://www.amazon.co.uk/dp/B0CW1T4X7H?tag=doghealthy-21', 'Amazon UK', 4.4, true, 7.0, 6.43),

('Canagan Country Game Grain Free Adult 12kg', 'Canagan', 'dry', 52.99, 'adult', 'all', true, 28.0, 16.0, 
'Grain-free dry dog food with 80% fresh meat and fish. Natural ingredients with no artificial preservatives.', 
'https://www.amazon.co.uk/dp/B07HA0ZQ4X3?tag=doghealthy-21', 'Amazon UK', 4.8, true, 12.0, 4.42),

-- Puppy Foods
('Royal Canin Puppy Medium Dry Dog Food 8kg', 'Royal Canin', 'dry', 45.99, 'puppy', 'medium', false, 27.0, 16.0, 
'Specially formulated for medium breed puppies with DHA for brain development and immune system support.', 
'https://www.amazon.co.uk/dp/B07HE4ZQ8X7?tag=doghealthy-21', 'Amazon UK', 4.6, true, 8.0, 5.75),

('Hill''s Science Plan Puppy Chicken 7kg', 'Hills Science Plan', 'dry', 48.99, 'puppy', 'all', false, 28.0, 17.0, 
'Complete nutrition for puppies with DHA from fish oil for brain and eye development.', 
'https://www.amazon.co.uk/dp/B07HF5ZQ9X8?tag=doghealthy-21', 'Amazon UK', 4.5, true, 7.0, 7.00),

-- Senior Foods
('Royal Canin Senior Consult 8kg', 'Royal Canin', 'dry', 42.99, 'senior', 'all', false, 24.0, 13.0, 
'Specially formulated for senior dogs with joint support and easy-to-digest proteins.', 
'https://www.amazon.co.uk/dp/B07HJ9ZQ3X2?tag=doghealthy-21', 'Amazon UK', 4.4, true, 8.0, 5.37),

('Hill''s Science Plan Mature Adult 7+ Chicken 7kg', 'Hills Science Plan', 'dry', 44.99, 'senior', 'all', false, 23.0, 12.0, 
'Complete nutrition for senior dogs with antioxidants and easy-to-digest ingredients.', 
'https://www.amazon.co.uk/dp/B07HK0ZQ4X3?tag=doghealthy-21', 'Amazon UK', 4.3, true, 7.0, 6.43),

-- Small Breed Foods
('Royal Canin Mini Adult Dry Dog Food 4kg', 'Royal Canin', 'dry', 32.99, 'adult', 'small', false, 26.0, 15.0, 
'Specially designed for small breed dogs with highly digestible proteins and precise nutrition.', 
'https://www.amazon.co.uk/dp/B07HO4ZQ8X7?tag=doghealthy-21', 'Amazon UK', 4.5, true, 4.0, 8.25),

('Hill''s Science Plan Small & Mini Adult Chicken 4kg', 'Hills Science Plan', 'dry', 35.99, 'adult', 'small', false, 27.0, 16.0, 
'Complete nutrition for small and mini breed dogs with antioxidants for immune health.', 
'https://www.amazon.co.uk/dp/B07HP5ZQ9X8?tag=doghealthy-21', 'Amazon UK', 4.4, true, 4.0, 9.00),

-- Wet Foods
('Royal Canin Adult Medium Chicken in Gravy 12x400g', 'Royal Canin', 'wet', 24.99, 'adult', 'medium', false, 8.0, 5.0, 
'Complete wet dog food for medium breed dogs with high-quality proteins and essential nutrients.', 
'https://www.amazon.co.uk/dp/B07HT9ZQ3X2?tag=doghealthy-21', 'Amazon UK', 4.3, true, 4.8, 5.21),

('Hill''s Science Plan Adult Chicken & Vegetables 12x370g', 'Hills Science Plan', 'wet', 22.99, 'adult', 'all', false, 8.5, 5.5, 
'Nutritious wet dog food with real chicken and vegetables. No artificial colours or flavours.', 
'https://www.amazon.co.uk/dp/B07HU0ZQ4X3?tag=doghealthy-21', 'Amazon UK', 4.2, true, 4.44, 5.18),

-- Special Diet Foods
('Hill''s Prescription Diet z/d Ultra Allergen-Free 8kg', 'Hills Prescription Diet', 'dry', 89.99, 'adult', 'all', true, 22.0, 12.0, 
'Veterinary-exclusive diet for dogs with food sensitivities. Hydrolyzed proteins for easy digestion.', 
'https://www.amazon.co.uk/dp/B07HY4ZQ8X7?tag=doghealthy-21', 'Amazon UK', 4.7, true, 8.0, 11.25),

('Royal Canin Gastrointestinal Low Fat 8kg', 'Royal Canin', 'dry', 76.99, 'adult', 'all', false, 20.0, 8.0, 
'Veterinary-exclusive diet for dogs with digestive sensitivities. Low fat and highly digestible.', 
'https://www.amazon.co.uk/dp/B07HZ5ZQ9X8?tag=doghealthy-21', 'Amazon UK', 4.6, true, 8.0, 9.62),

-- Weight Management
('Royal Canin Weight Care Adult Dry Dog Food 8kg', 'Royal Canin', 'dry', 52.99, 'adult', 'all', false, 23.0, 10.0, 
'Specially formulated for weight management with high protein and reduced fat content.', 
'https://www.amazon.co.uk/dp/B07I39ZQ3X2?tag=doghealthy-21', 'Amazon UK', 4.4, true, 8.0, 6.62),

('Hill''s Science Plan Perfect Weight Chicken 8kg', 'Hills Science Plan', 'dry', 58.99, 'adult', 'all', false, 24.0, 11.0, 
'Clinically proven weight management food with L-carnitine to help burn fat and maintain muscle.', 
'https://www.amazon.co.uk/dp/B07I40ZQ4X3?tag=doghealthy-21', 'Amazon UK', 4.5, true, 8.0, 7.37),

-- Premium Options
('Orijen Original Freeze-Dried Raw 2.27kg', 'Orijen', 'dry', 89.99, 'adult', 'all', true, 38.0, 20.0, 
'Freeze-dried raw dog food with 85% meat, organs and cartilage. Biologically appropriate and grain-free.', 
'https://www.amazon.co.uk/dp/B07HC2ZQ6X5?tag=doghealthy-21', 'Amazon UK', 4.9, true, 2.27, 39.64),

('Canagan Scottish Salmon & Herring 12kg', 'Canagan', 'dry', 58.99, 'adult', 'all', true, 29.0, 17.0, 
'Grain-free dry dog food with 80% fresh Scottish salmon and herring. Natural ingredients.', 
'https://www.amazon.co.uk/dp/B07IJ5ZQ9X8?tag=doghealthy-21', 'Amazon UK', 4.7, true, 12.0, 4.92)

ON CONFLICT (name) DO NOTHING;
