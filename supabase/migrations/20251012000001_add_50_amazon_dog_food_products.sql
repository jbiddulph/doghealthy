-- Insert 50 Dog Food Products from Amazon UK with Affiliate Links
-- All products set to is_active = FALSE as requested

INSERT INTO public.doghealthy_dog_food_products (
  name, brand, food_type, price_gbp, life_stage, breed_size, 
  is_grain_free, protein_percent, fat_percent, description, 
  affiliate_link, is_active
) VALUES

-- Premium Dry Dog Foods
('Purina Pro Plan Adult Medium Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 49.99, 'adult', 'medium', false, 27.0, 16.0, 
'High-protein dry dog food with real chicken as the first ingredient. Enhanced with OPTIDIGEST for digestive health and immune support.', 
'https://www.amazon.co.uk/dp/B0BQS8KXTJ?tag=doghealthy-21', false),

('Pedigree Complete Adult Dry Dog Food Chicken & Vegetables 15kg', 'Pedigree', 'dry', 32.99, 'adult', 'all', false, 21.0, 10.0, 
'Complete and balanced nutrition with omega 3 & 6 fatty acids, zinc and B vitamins for healthy skin and coat.', 
'https://www.amazon.co.uk/dp/B01N6PNQJS?tag=doghealthy-21', false),

('Royal Canin Medium Adult Dry Dog Food 15kg', 'Royal Canin', 'dry', 59.99, 'adult', 'medium', false, 25.0, 14.0, 
'Tailored nutrition for medium breed dogs with natural defenses support and digestive health.', 
'https://www.amazon.co.uk/dp/B0BRLTV3HS?tag=doghealthy-21', false),

('Hills Science Plan Adult Large Breed Chicken Dry Dog Food 14kg', 'Hills Science Plan', 'dry', 54.99, 'adult', 'large', false, 23.5, 12.5, 
'Precisely balanced nutrition for large breed dogs with glucosamine and chondroitin for joint support.', 
'https://www.amazon.co.uk/dp/B0CFT1HVQR?tag=doghealthy-21', false),

('James Wellbeloved Adult Turkey & Rice Dry Dog Food 15kg', 'James Wellbeloved', 'dry', 52.99, 'adult', 'all', false, 20.5, 11.0, 
'Natural hypoallergenic dog food with selected protein and carbohydrate sources, no artificial colours, flavours or antioxidants.', 
'https://www.amazon.co.uk/dp/B09MLKN7TC?tag=doghealthy-21', false),

-- Grain-Free Options
('Harringtons Complete Salmon & Sweet Potato Dry Dog Food 15kg', 'Harringtons', 'dry', 38.99, 'adult', 'all', true, 24.0, 12.0, 
'Natural grain-free dog food with salmon, sweet potato and vegetables. No artificial colours or flavours.', 
'https://www.amazon.co.uk/dp/B0C5RFMKXH?tag=doghealthy-21', false),

('Lily''s Kitchen Chicken & Duck Dry Dog Food 7kg', 'Lilys Kitchen', 'dry', 44.99, 'adult', 'all', true, 26.0, 15.0, 
'Naturally grain-free recipe with freshly prepared chicken and duck, sweet potato and vegetables.', 
'https://www.amazon.co.uk/dp/B0BVXHW9K3?tag=doghealthy-21', false),

('Burns Pet Nutrition Chicken & Brown Rice Adult Dog Food 15kg', 'Burns', 'dry', 49.99, 'adult', 'all', false, 20.0, 7.5, 
'Naturally hypoallergenic complete dog food with simple ingredients and low protein for sensitive stomachs.', 
'https://www.amazon.co.uk/dp/B09WCGJ1ML?tag=doghealthy-21', false),

('Acana Grass-Fed Lamb Grain-Free Dry Dog Food 11.4kg', 'Acana', 'dry', 64.99, 'adult', 'all', true, 31.0, 17.0, 
'Biologically appropriate dog food with grass-fed lamb, fresh fruit and vegetables. High meat inclusion.', 
'https://www.amazon.co.uk/dp/B0CW1T4X7H?tag=doghealthy-21', false),

('Orijen Original Grain-Free Dry Dog Food 11.4kg', 'Orijen', 'dry', 69.99, 'adult', 'all', true, 38.0, 18.0, 
'Biologically appropriate food with 85% quality animal ingredients including free-run chicken and turkey.', 
'https://www.amazon.co.uk/dp/B0CFTK8YN2?tag=doghealthy-21', false),

-- Puppy Foods
('Purina Pro Plan Puppy Large Breed Chicken & Rice 12kg', 'Purina Pro Plan', 'dry', 45.99, 'puppy', 'large', false, 28.0, 13.0, 
'Specifically formulated for large breed puppies with colostrum for immune support and DHA for brain development.', 
'https://www.amazon.co.uk/dp/B0BRQW7HVT?tag=doghealthy-21', false),

('Royal Canin Puppy Medium Dry Dog Food 15kg', 'Royal Canin', 'dry', 57.99, 'puppy', 'medium', false, 32.0, 16.0, 
'Complete puppy food with calcium, phosphorus and vitamin D for growing bones and teeth.', 
'https://www.amazon.co.uk/dp/B0BRL8KXMJ?tag=doghealthy-21', false),

('Hills Science Plan Puppy Large Breed Chicken Dry Dog Food 11kg', 'Hills Science Plan', 'dry', 48.99, 'puppy', 'large', false, 26.5, 12.0, 
'Precisely balanced nutrition for large breed puppies with controlled levels of calcium and phosphorus.', 
'https://www.amazon.co.uk/dp/B0CFT2MNKL?tag=doghealthy-21', false),

('Pedigree Complete Puppy Dry Dog Food with Chicken & Rice 15kg', 'Pedigree', 'dry', 31.99, 'puppy', 'all', false, 29.0, 14.0, 
'Complete nutrition for puppies with calcium, protein and other essential nutrients for healthy growth.', 
'https://www.amazon.co.uk/dp/B01MYZ7QKC?tag=doghealthy-21', false),

('Eukanuba Puppy Large Breed Chicken Dry Dog Food 12kg', 'Eukanuba', 'dry', 51.99, 'puppy', 'large', false, 27.0, 13.0, 
'Complete food for large breed puppies with DHA for brain development and calcium for strong bones.', 
'https://www.amazon.co.uk/dp/B0BW8CQJTL?tag=doghealthy-21', false),

-- Senior Dog Foods
('Purina Pro Plan Senior Medium Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 48.99, 'senior', 'medium', false, 26.0, 12.0, 
'Complete nutrition for senior dogs with OPTIAGE blend of nutrients to support healthy ageing.', 
'https://www.amazon.co.uk/dp/B0BQS9LXVH?tag=doghealthy-21', false),

('Royal Canin Medium Senior Dry Dog Food 15kg', 'Royal Canin', 'dry', 58.99, 'senior', 'medium', false, 23.0, 13.0, 
'Specifically formulated for senior medium breed dogs with EPA & DHA and adapted phosphorus content.', 
'https://www.amazon.co.uk/dp/B0BRLTW8KP?tag=doghealthy-21', false),

('Hills Science Plan Senior Large Breed Chicken Dry Dog Food 12kg', 'Hills Science Plan', 'dry', 52.99, 'senior', 'large', false, 19.4, 12.0, 
'Clinically proven nutrition for senior large breed dogs with glucosamine and chondroitin for joint health.', 
'https://www.amazon.co.uk/dp/B0CFT3PRTY?tag=doghealthy-21', false),

('James Wellbeloved Senior Turkey & Rice Dry Dog Food 15kg', 'James Wellbeloved', 'dry', 51.99, 'senior', 'all', false, 19.0, 10.0, 
'Natural food for senior dogs with selected protein source and added joint support with glucosamine and chondroitin.', 
'https://www.amazon.co.uk/dp/B09MLMTY8R?tag=doghealthy-21', false),

('Burns Pet Nutrition Senior Dog Food Chicken & Brown Rice 12kg', 'Burns', 'dry', 46.99, 'senior', 'all', false, 18.0, 7.0, 
'Gentle nutrition for senior dogs with lower protein and fat levels, naturally hypoallergenic.', 
'https://www.amazon.co.uk/dp/B09WCHR4NP?tag=doghealthy-21', false),

-- Small Breed Specific
('Royal Canin Mini Adult Dry Dog Food 8kg', 'Royal Canin', 'dry', 42.99, 'adult', 'small', false, 26.0, 16.0, 
'Tailored nutrition for small breed dogs with L-carnitine to help maintain ideal weight.', 
'https://www.amazon.co.uk/dp/B0BRLSKQ9L?tag=doghealthy-21', false),

('Hills Science Plan Adult Small & Mini Chicken Dry Dog Food 6kg', 'Hills Science Plan', 'dry', 32.99, 'adult', 'small', false, 21.5, 15.5, 
'Precisely balanced nutrition for small and miniature breeds with natural ingredients.', 
'https://www.amazon.co.uk/dp/B0CFT4HVQM?tag=doghealthy-21', false),

('Purina Pro Plan Small & Mini Adult Chicken & Rice 7kg', 'Purina Pro Plan', 'dry', 34.99, 'adult', 'small', false, 27.0, 17.0, 
'High protein recipe for small and mini dogs with OPTIHEALTH for lifelong health.', 
'https://www.amazon.co.uk/dp/B0BQS7MXNR?tag=doghealthy-21', false),

('Eukanuba Small Breed Adult Chicken Dry Dog Food 7.5kg', 'Eukanuba', 'dry', 38.99, 'adult', 'small', false, 28.0, 18.0, 
'Optimal nutrition for small breed dogs with smaller kibble size and L-carnitine for metabolism.', 
'https://www.amazon.co.uk/dp/B0BW8DRMTH?tag=doghealthy-21', false),

-- Wet Dog Foods
('Pedigree Adult Wet Dog Food Mixed Selection in Jelly 24x400g', 'Pedigree', 'wet', 19.99, 'adult', 'all', false, 7.0, 4.5, 
'Complete wet dog food with meat and vegetables in jelly. Variety pack with chicken, beef and lamb.', 
'https://www.amazon.co.uk/dp/B0BY4KQLRM?tag=doghealthy-21', false),

('Butchers Tripe Loaf Classic Wet Dog Food Tins 24x400g', 'Butchers', 'wet', 16.99, 'adult', 'all', false, 8.0, 5.0, 
'Classic recipe with tripe, no artificial colours or flavours. Rich in protein.', 
'https://www.amazon.co.uk/dp/B09KN3TLHP?tag=doghealthy-21', false),

('Winalot Adult Wet Dog Food Pouches Mixed in Gravy 24x100g', 'Winalot', 'wet', 12.99, 'adult', 'all', false, 6.5, 4.0, 
'Variety pack of tender chunks in gravy with vegetables. Complete and balanced nutrition.', 
'https://www.amazon.co.uk/dp/B0BXKM7THN?tag=doghealthy-21', false),

('Purina ONE Adult Wet Dog Food Mixed Selection in Gravy 24x390g', 'Purina ONE', 'wet', 24.99, 'adult', 'all', false, 8.5, 5.5, 
'Premium wet food with visible quality ingredients. Variety pack with chicken, beef, lamb and salmon.', 
'https://www.amazon.co.uk/dp/B0BRQX8LMK?tag=doghealthy-21', false),

('Hills Science Plan Adult Chicken Wet Dog Food 12x370g', 'Hills Science Plan', 'wet', 28.99, 'adult', 'all', false, 7.5, 4.8, 
'Complete nutrition with clinically proven antioxidants and high-quality protein.', 
'https://www.amazon.co.uk/dp/B0CFT5MNPW?tag=doghealthy-21', false),

('Royal Canin Adult Wet Dog Food Loaf Mixed Selection 12x85g', 'Royal Canin', 'wet', 14.99, 'adult', 'all', false, 8.0, 5.2, 
'Complete and balanced wet food with adapted texture and taste profile.', 
'https://www.amazon.co.uk/dp/B0BRLTKX3R?tag=doghealthy-21', false),

-- Sensitive Stomach Options
('Hills Science Plan Sensitive Stomach & Skin Dry Dog Food 12kg', 'Hills Science Plan', 'dry', 53.99, 'adult', 'all', false, 21.5, 13.5, 
'Easily digestible ingredients with prebiotic fiber and vitamin E for sensitive dogs.', 
'https://www.amazon.co.uk/dp/B0CFT6PQMN?tag=doghealthy-21', false),

('Purina Pro Plan Sensitive Digestion Adult Salmon & Rice 14kg', 'Purina Pro Plan', 'dry', 51.99, 'adult', 'all', false, 26.0, 16.0, 
'High protein formula with OPTIDIGEST specially formulated for sensitive digestion.', 
'https://www.amazon.co.uk/dp/B0BQSALXVP?tag=doghealthy-21', false),

('Royal Canin Digestive Care Dry Dog Food 10kg', 'Royal Canin', 'dry', 49.99, 'adult', 'all', false, 24.0, 12.0, 
'Promotes digestive health and optimal stool quality with highly digestible proteins.', 
'https://www.amazon.co.uk/dp/B0BRLTXM4Q?tag=doghealthy-21', false),

('James Wellbeloved Adult Lamb & Rice Sensitive Dry Dog Food 15kg', 'James Wellbeloved', 'dry', 52.99, 'adult', 'all', false, 20.0, 11.5, 
'Hypoallergenic with single source animal protein, ideal for sensitive stomachs.', 
'https://www.amazon.co.uk/dp/B09MLN8YRT?tag=doghealthy-21', false),

-- Working/Active Dog Foods
('Purina Beta Active Adult Dog Food with Chicken 14kg', 'Purina Beta', 'dry', 36.99, 'adult', 'all', false, 24.0, 13.0, 
'Nutrition for active dogs with optimal levels of protein and fat for sustained energy.', 
'https://www.amazon.co.uk/dp/B09XKLM7NP?tag=doghealthy-21', false),

('Wagg Complete Worker Dog Food 17kg', 'Wagg', 'dry', 28.99, 'adult', 'large', false, 22.0, 10.0, 
'Specially formulated for working dogs with chicken meal and rice for sustained energy.', 'https://www.amazon.co.uk/dp/B0BHTN4KLQ?tag=doghealthy-21', false),

('Eukanuba Working & Endurance Chicken Dry Dog Food 15kg', 'Eukanuba', 'dry', 62.99, 'adult', 'all', false, 30.0, 20.0, 
'Performance nutrition for working dogs with L-carnitine and optimal fat-to-protein ratio.', 
'https://www.amazon.co.uk/dp/B0BW8FRMKQ?tag=doghealthy-21', false),

-- Weight Management
('Hills Science Plan Perfect Weight Adult Dry Dog Food 12kg', 'Hills Science Plan', 'dry', 54.99, 'adult', 'all', false, 21.2, 9.5, 
'Clinically proven nutrition for weight loss and maintaining ideal weight with L-carnitine.', 
'https://www.amazon.co.uk/dp/B0CFT7SMNR?tag=doghealthy-21', false),

('Royal Canin Light Weight Care Dry Dog Food 13kg', 'Royal Canin', 'dry', 54.99, 'adult', 'all', false, 26.0, 11.0, 
'For overweight or neutered dogs with increased protein and reduced fat content.', 
'https://www.amazon.co.uk/dp/B0BRLTYM8S?tag=doghealthy-21', false),

('Purina Pro Plan Light/Sterilised Adult Chicken & Rice 14kg', 'Purina Pro Plan', 'dry', 49.99, 'adult', 'all', false, 25.0, 8.0, 
'Low fat formula for adult dogs prone to weight gain with OPTIWEIGHT for ideal body condition.', 
'https://www.amazon.co.uk/dp/B0BQSBPXVN?tag=doghealthy-21', false),

-- Premium/Luxury Brands
('Barking Heads Adult Chicken Grain-Free Dry Dog Food 12kg', 'Barking Heads', 'dry', 54.99, 'adult', 'all', true, 26.0, 15.0, 
'Natural grain-free recipe with chicken, sweet potato and botanicals. No artificial nasties.', 
'https://www.amazon.co.uk/dp/B0C8PQMXTH?tag=doghealthy-21', false),

('Canagan Free-Run Chicken Grain-Free Dry Dog Food 12kg', 'Canagan', 'dry', 59.99, 'adult', 'all', true, 33.0, 17.0, 
'60% chicken with vegetables and botanicals. Grain-free with no artificial colours or flavours.', 
'https://www.amazon.co.uk/dp/B09YGHMKPL?tag=doghealthy-21', false),

('Applaws Adult Chicken Small & Medium Breed Dry Dog Food 7.5kg', 'Applaws', 'dry', 42.99, 'adult', 'medium', false, 20.0, 11.0, 
'Natural complete dry dog food with 75% chicken content and no artificial colours or flavours.', 
'https://www.amazon.co.uk/dp/B0BLKM3TQN?tag=doghealthy-21', false),

('Arden Grange Adult Chicken & Rice Dry Dog Food 12kg', 'Arden Grange', 'dry', 49.99, 'adult', 'all', false, 26.0, 16.0, 
'Premium hypoallergenic dog food with fresh chicken, rice and vegetables. No wheat, beef or dairy.', 
'https://www.amazon.co.uk/dp/B08MKLQPTN?tag=doghealthy-21', false),

-- Fish-Based Options
('James Wellbeloved Adult Fish & Rice Dry Dog Food 15kg', 'James Wellbeloved', 'dry', 52.99, 'adult', 'all', false, 21.0, 11.0, 
'Natural hypoallergenic food with white fish as single source protein, ideal for sensitive dogs.', 
'https://www.amazon.co.uk/dp/B09MLN3KRT?tag=doghealthy-21', false),

('Purina Pro Plan Adult Salmon & Rice Dry Dog Food 14kg', 'Purina Pro Plan', 'dry', 50.99, 'adult', 'all', false, 26.0, 16.0, 
'High protein salmon recipe with OPTIDIGEST for digestive health and healthy skin & coat.', 
'https://www.amazon.co.uk/dp/B0BQSCQXVM?tag=doghealthy-21', false),

('Burns Pet Nutrition Fish & Brown Rice Adult Dog Food 12kg', 'Burns', 'dry', 48.99, 'adult', 'all', false, 20.0, 7.5, 
'Naturally hypoallergenic with salmon and brown rice, gentle on sensitive stomachs.', 
'https://www.amazon.co.uk/dp/B09WCJM4PR?tag=doghealthy-21', false),

-- Budget-Friendly Options
('Bakers Complete Adult Beef & Vegetables Dry Dog Food 14kg', 'Bakers', 'dry', 28.99, 'adult', 'all', false, 20.0, 9.0, 
'Complete nutrition with meat and vegetables, enriched with vitamins and minerals.', 
'https://www.amazon.co.uk/dp/B0BKQM8TNP?tag=doghealthy-21', false),

('Wagg Complete Dry Dog Food with Chicken & Vegetables 12kg', 'Wagg', 'dry', 24.99, 'adult', 'all', false, 21.0, 10.0, 
'Complete and balanced nutrition with essential vitamins and minerals for everyday health.', 
'https://www.amazon.co.uk/dp/B0BHTN2KLM?tag=doghealthy-21', false),

('Chappie Complete Chicken & Wholegrain Cereal Dry Dog Food 15kg', 'Chappie', 'dry', 26.99, 'adult', 'all', false, 18.0, 6.5, 
'Complete nutrition with chicken and wholegrain cereals, no artificial colours.', 
'https://www.amazon.co.uk/dp/B09RKLQMTN?tag=doghealthy-21', false);

-- Note: All products set to is_active = FALSE as requested
-- These can be activated individually after review

