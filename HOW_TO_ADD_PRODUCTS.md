# How to Add Real Dog Food Products

## Quick Start: Finding Amazon ASINs

### Step 1: Find Products on Amazon UK

1. Go to https://www.amazon.co.uk
2. Search for dog food (e.g., "Royal Canin Medium Adult 4kg")
3. Click on a product you want to add

### Step 2: Get the ASIN

The ASIN is the unique product identifier. Find it in **two ways**:

**Method 1: From the URL**
```
https://www.amazon.co.uk/dp/B07Y2QXQXQ/
                          ^^^^^^^^^^
                          This is the ASIN
```

**Method 2: Product Information**
- Scroll down to "Product Information" or "Product Details"
- Look for "ASIN: B07Y2QXQXQ"

### Step 3: Build Your Affiliate Link

Format:
```
https://www.amazon.co.uk/dp/{ASIN}?tag=doghealthy-21
```

Example with real ASIN:
```
https://www.amazon.co.uk/dp/B07Y2QXQXQ?tag=doghealthy-21
```

**Note**: Replace `doghealthy-21` with your actual Amazon Associates tag!

## Adding Products to Database

### Option 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase Dashboard
2. Click **Table Editor** → `doghealthy_dog_food_products`
3. Click **Insert** → **Insert row**
4. Fill in the fields:

**Required Fields:**
- `name`: Product name
- `brand`: Brand name
- `price_gbp`: Price in pounds
- `price_per_kg`: Calculate: price ÷ package size
- `package_size_kg`: Size in kilograms
- `affiliate_link`: Your Amazon link with ASIN
- `retailer`: Usually "amazon"
- `slug`: URL-friendly name (e.g., "royal-canin-medium-adult")

**Recommended Fields:**
- `description`: Product description
- `food_type`: "dry", "wet", "raw", or "freeze-dried"
- `breed_size`: "small", "medium", "large", or "all"
- `life_stage`: "puppy", "adult", "senior", or "all"
- `protein_percent`: From product label
- `fat_percent`: From product label
- `image_url`: Copy image from Amazon (right-click → Copy Image Address)

### Option 2: Via SQL (Faster for multiple products)

```sql
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, image_url,
    food_type, breed_size, life_stage,
    protein_percent, fat_percent,
    price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer,
    is_editors_choice, is_best_value, is_grain_free,
    slug, tags
) VALUES (
    'Medium Adult Dry Dog Food 4kg',
    'Royal Canin',
    'Complete nutrition for medium breed adult dogs aged 1-7 years.',
    'https://m.media-amazon.com/images/I/71ABC123.jpg', -- Copy from Amazon
    'dry',
    'medium',
    'adult',
    25.0,
    14.0,
    45.99,
    11.50,
    4.0,
    'https://www.amazon.co.uk/dp/B07Y2QXQXQ?tag=doghealthy-21',
    'amazon',
    true,  -- Mark as editor's choice
    false,
    false,
    'royal-canin-medium-adult-4kg',
    ARRAY['royal canin', 'medium breed', 'adult', 'dry food']
);
```

## Where to Get Product Information

### Protein & Fat Percentages
Look on the product page under:
- "Ingredients & Analysis"
- "Nutritional Information"
- "Guaranteed Analysis"

Typically shown as:
- Crude Protein: 25%
- Crude Fat: 14%

### Product Images
1. Right-click on the main product image on Amazon
2. Choose "Copy Image Address"
3. Paste into `image_url` field

### Calculating Price Per Kg

Formula: `price_gbp ÷ package_size_kg`

Example:
- 4kg bag costs £45.99
- Price per kg = 45.99 ÷ 4 = £11.50/kg

## Quick Product Ideas to Add

### Budget Range (£20-35):
- Pedigree Adult Complete
- Wagg Complete
- Beta Adult

### Mid-Range (£35-55):
- Purina Pro Plan
- Royal Canin
- Eukanuba
- Iams

### Premium (£55+):
- Orijen
- Acana
- Taste of the Wild
- Canagan
- Forthglade

### Specialty:
- Grain-free options
- Hypoallergenic formulas
- Puppy foods
- Senior foods
- Weight management

## Tips for Success

1. **Start with 20-30 products** covering different:
   - Price points
   - Breed sizes
   - Life stages
   - Food types (dry, wet)

2. **Mark special products**:
   - Set `is_editors_choice = true` for 2-3 best products
   - Set `is_best_value = true` for 1-2 good budget options
   - Set `is_grain_free = true` for grain-free products

3. **Use good images**: Clear product photos help conversions

4. **Write helpful descriptions**: 1-2 sentences about benefits

5. **Tag well**: Add searchable tags for better filtering

## Clearing and Reloading Sample Data

If you want to start fresh:

```sql
-- Clear all products
DELETE FROM public.doghealthy_dog_food_products;

-- Then insert your real products using the INSERT statements above
```

## Need Real ASINs?

Search Amazon UK for these popular products and get their ASINs:

1. **Royal Canin Medium Adult 4kg** (dry)
2. **Lily's Kitchen Chicken Casserole 400g x 6** (wet)  
3. **James Wellbeloved Fish & Rice Senior 4kg** (dry)
4. **Purina Pro Plan Medium Adult Chicken 3kg** (dry)
5. **Hill's Science Plan Perfect Weight 2kg** (dry)
6. **Canagan Free-Run Chicken 2kg** (dry, grain-free)
7. **Forthglade Complete Turkey 395g x 12** (wet)
8. **Orijen Original 2kg** (dry, premium)

Just search for each one, grab the ASIN, and use the INSERT SQL format above!

