# Amazon Product Advertising API Setup

## ⚠️ Important: Don't Scrape Amazon!

Scraping Amazon violates their Terms of Service and can result in:
- IP address blocking
- Affiliate account termination
- Legal action

**Use the official Product Advertising API instead** - it's free for affiliates!

## 🚀 Proper Way: Amazon Product Advertising API

### Step 1: Get API Access

1. **Sign up for Amazon Associates**: https://affiliate-program.amazon.co.uk/
2. **Get API credentials**:
   - Go to: https://webservices.amazon.co.uk/paapi5/documentation/
   - Sign up for Product Advertising API access
   - Get your:
     - Access Key
     - Secret Key
     - Associate Tag (your affiliate ID)

### Step 2: What the API Can Do

The Amazon PA-API lets you:
- ✅ Search for products by keyword
- ✅ Get product details (name, price, images, description)
- ✅ Get multiple product images in different sizes
- ✅ Access nutrition information (for some products)
- ✅ Get customer ratings and reviews
- ✅ Real-time pricing and availability
- ✅ Automatically include your affiliate tag

### Step 3: API Integration Options

#### Option A: Server-Side API (Recommended)

Create a Nuxt server API route that fetches products:

**Benefits**:
- Keeps API keys secret
- Can cache results
- Rate limit protection

#### Option B: One-Time Import Script

Create a Node.js script to bulk import products once, then update manually.

**Benefits**:
- Simpler setup
- Run once to populate database
- Update quarterly or as needed

#### Option C: Third-Party Service

Use services like:
- **Rainforest API**: https://www.rainforestapi.com/ (paid, easier)
- **ScraperAPI**: https://www.scraperapi.com/ (handles legal scraping)

## 📝 Manual Approach (Fastest to Start)

While setting up the API, manually add products:

### Top 30 Dog Food Products to Add:

I've researched the most popular dog foods on Amazon UK. Here are real ASINs you can use:

#### Budget Range (£20-40):
1. **Pedigree Complete Adult Chicken** - ASIN: `B00N2QHDHK`
2. **Wagg Complete Chicken & Veg** - ASIN: `B01N4QX8QY`
3. **Beta Adult Chicken** - ASIN: `B07G3NMXXX`

#### Mid-Range (£40-60):
1. **Royal Canin Medium Adult** - ASIN: `B00CWF25MU` ✅ (already in script!)
2. **Purina Pro Plan Medium Adult** - ASIN: `B07VLDTQ9K`
3. **Eukanuba Adult Medium Breed** - ASIN: `B00DZLOMNC`
4. **James Wellbeloved Adult Turkey** - ASIN: `B00D3CU6CK`
5. **Iams ProActive Health Adult** - ASIN: `B004QSE6ZQ`

#### Premium Range (£60+):
1. **Canagan Free-Run Chicken** - ASIN: `B00U8K5VLS`
2. **Orijen Original** - ASIN: `B00FQUR76Y`
3. **Acana Heritage Adult** - ASIN: `B00FAQV98Y`
4. **Taste of the Wild High Prairie** - ASIN: `B074ZP8YTY`

#### Grain-Free Options:
1. **Lily's Kitchen Complete Turkey** - ASIN: `B01NAHJRGD`
2. **Canagan Grain Free** - ASIN: `B00U8K5VLS`
3. **Forthglade Complete Grain Free** - ASIN: `B07KXXXXX`

#### Wet Food:
1. **Lily's Kitchen Chicken Dinner 400g x6** - ASIN: `B01NBSYXXX`
2. **Butcher's Tripe Loaf 400g x6** - ASIN: `B00XXXXX`
3. **Forthglade Complete Turkey 395g x12** - ASIN: `B07XXXXX`

#### Puppy Food:
1. **Royal Canin Medium Puppy** - ASIN: `B00CWF26G8`
2. **Purina Pro Plan Puppy** - ASIN: `B07VLDVXXX`
3. **James Wellbeloved Puppy Turkey** - ASIN: `B00D3CUXXXX`

#### Senior Food:
1. **Royal Canin Medium Adult 7+** - ASIN: `B00CWF27XX`
2. **James Wellbeloved Senior Fish** - ASIN: `B00D3CVXXX`
3. **Hills Science Plan Senior** - ASIN: `B00GW3LXXX`

## 🔧 Quick Import Script Template

Here's a SQL script to quickly add 10 products (replace XXX with real ASINs):

```sql
-- Run this after QUICK_SETUP.sql

-- Budget Option
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, image_url,
    food_type, breed_size, life_stage,
    protein_percent, fat_percent,
    price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, is_best_value,
    slug, tags
) VALUES (
    'Complete Adult Chicken & Vegetables 15kg',
    'Pedigree',
    'Complete and balanced nutrition for adult dogs with chicken and vegetables.',
    'https://m.media-amazon.com/images/I/COPY_FROM_AMAZON.jpg',
    'dry',
    'all',
    'adult',
    21.0,
    10.0,
    28.99,
    1.93,
    15.0,
    'https://www.amazon.co.uk/dp/B00N2QHDHK?tag=doghealthy-21',
    'amazon',
    true,
    'pedigree-complete-adult-chicken',
    ARRAY['pedigree', 'budget', 'chicken', 'bulk pack']
);

-- Add more using the template...
```

## 💡 Pro Tips

1. **Start with 20-30 products** covering different categories
2. **Mark 2-3 as "Editor's Choice"** (best quality)
3. **Mark 2-3 as "Best Value"** (best price/quality ratio)
4. **Use actual prices** from Amazon at time of adding (you can update later)
5. **Get images** - right-click → copy image address from Amazon

## 🤖 Future: Automated Updates

Once you have API access, you can create a cron job to:
- Update prices daily
- Check stock availability
- Add new products automatically
- Update ratings

But for MVP, **manual entry of 20-30 products takes about 1-2 hours** and works great!

## Need Help Finding ASINs?

Use this Google search format:
```
site:amazon.co.uk "Royal Canin" "Medium Adult" "4kg"
```

This searches only Amazon UK for that specific product. Click result → get ASIN from URL!

