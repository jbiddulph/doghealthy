# DogHealthy Monetization Guide

## 🍖 Dog Food Finder - Affiliate Program Setup

### Phase 1: Affiliate Links (Immediate Revenue)

#### 1. Amazon Associates (UK)
**Sign up**: https://affiliate-program.amazon.co.uk/

**Setup Steps**:
1. Create an Amazon Associates account
2. Get your unique affiliate tag (e.g., `doghealthy-21`)
3. Replace `your-tag` in the database affiliate links with your actual tag
4. Format: `https://www.amazon.co.uk/dp/{PRODUCT_ASIN}?tag=doghealthy-21`

**Commission**: 1-10% depending on product category (pet products typically 3-5%)

#### 2. Pets at Home Affiliate
**Sign up**: Via Awin Network - https://www.awin.com/gb/affiliate-programme/pets-at-home

**Commission**: 3-5%

#### 3. Zooplus UK
**Sign up**: Via Awin Network - https://www.awin.com/gb/affiliate-programme/zooplus

**Commission**: 5-7%

#### 4. Other UK Pet Retailers
- **Fetch**: https://www.fetch.co.uk/affiliate-program
- **Tails.com**: Partnership program available
- **Butternut Box**: High commission fresh food delivery

### How to Add Products to Database

#### Method 1: Via Supabase Dashboard
1. Go to Supabase Dashboard → Table Editor
2. Select `doghealthy_dog_food_products`
3. Click "Insert Row"
4. Fill in product details and affiliate link

#### Method 2: Via SQL
```sql
INSERT INTO public.doghealthy_dog_food_products (
    name, brand, description, food_type, breed_size, life_stage,
    protein_percent, fat_percent, price_gbp, price_per_kg, package_size_kg,
    affiliate_link, retailer, is_editors_choice, slug, tags
) VALUES (
    'Product Name',
    'Brand Name',
    'Product description',
    'dry', -- or 'wet', 'raw', 'freeze-dried'
    'medium', -- or 'small', 'large', 'all'
    'adult', -- or 'puppy', 'senior', 'all'
    25.0, -- protein %
    14.0, -- fat %
    45.99, -- price in GBP
    11.50, -- price per kg
    4.0, -- package size in kg
    'https://www.amazon.co.uk/dp/ASIN?tag=your-tag',
    'amazon',
    false, -- is_editors_choice
    'brand-product-slug',
    ARRAY['tag1', 'tag2', 'tag3']
);
```

### Affiliate Link Best Practices

1. **Always disclose**: ✅ Already added on food-finder page
2. **Use `rel="noopener sponsored"`**: ✅ Already implemented
3. **Track clicks**: ✅ Built into the system
4. **Add UTM parameters**: Helps track which pages convert best

Example: `?tag=doghealthy-21&utm_source=doghealthy&utm_medium=food-finder&utm_campaign=comparison`

### Phase 2: Email Marketing ($500-2000/month potential)

#### Quick Win: Lead Magnet
**Offer**: "Complete Dog Nutrition Guide" PDF
**Where**: Food quiz results page (✅ already implemented)

#### Email Sequence Ideas:
1. **Welcome Email**: Send the PDF + introduce DogHealthy
2. **Day 3**: "Top 5 Dog Foods for [their breed size]"
3. **Day 7**: "How to read dog food labels"
4. **Weekly**: Product recommendations + deals

#### Email Service Providers:
- **Mailchimp**: Free up to 500 subscribers
- **ConvertKit**: Great for creators, free up to 1,000
- **EmailOctopus**: Cheapest option

#### Integration:
The quiz already saves emails to `doghealthy_email_leads` table. Export this to your ESP or use their API.

### Phase 3: Sponsored Placements ($100-500/month per brand)

Once you have **5,000+ monthly visitors**:

1. **Featured Placement**: Charge brands £100-300/month to feature their product at the top
2. **Review Sponsorship**: Paid product reviews (£50-200 per review)
3. **Banner Ads**: Dedicated banner slots (£100-500/month)

#### How to Implement:
- Add `is_sponsored` boolean to products table
- Create admin panel to manage placements
- Display "Sponsored" badge clearly

### Analytics & Tracking

#### What to Monitor:
1. **Click-through rate (CTR)**: Clicks / Views
2. **Conversion rate**: Purchases / Clicks (requires affiliate network data)
3. **Revenue per click (RPC)**: Total earnings / Total clicks
4. **Top performing products**: Which products generate most revenue

#### View Your Stats:
```sql
-- Total clicks by product
SELECT 
    p.name,
    p.brand,
    COUNT(c.id) as total_clicks,
    p.price_gbp
FROM doghealthy_dog_food_products p
LEFT JOIN doghealthy_affiliate_clicks c ON p.id = c.product_id
GROUP BY p.id
ORDER BY total_clicks DESC;

-- Clicks by day
SELECT 
    DATE(clicked_at) as date,
    COUNT(*) as clicks
FROM doghealthy_affiliate_clicks
WHERE clicked_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(clicked_at)
ORDER BY date DESC;
```

### Revenue Projections

**Conservative Estimates**:

| Traffic | Clicks | Conv. Rate | Avg Commission | Monthly Revenue |
|---------|--------|------------|----------------|-----------------|
| 1,000   | 50     | 5%         | £2.50          | £6.25           |
| 5,000   | 250    | 5%         | £2.50          | £31.25          |
| 10,000  | 500    | 5%         | £2.50          | £62.50          |
| 50,000  | 2,500  | 5%         | £2.50          | £312.50         |

**With email marketing (20% open rate, 10% click rate)**:

| Email List | Opens  | Clicks | Conv. | Revenue/Month |
|------------|--------|--------|-------|---------------|
| 1,000      | 200    | 20     | 5%    | £2.50         |
| 5,000      | 1,000  | 100    | 5%    | £12.50        |
| 10,000     | 2,000  | 200    | 5%    | £25.00        |

### Next Steps

1. ✅ **Run the migrations** in Supabase to create the tables
2. 📝 **Sign up for affiliate programs** (Amazon Associates first)
3. 🔗 **Update affiliate links** in the sample products
4. 📸 **Add product images** (use Amazon product images or brand assets)
5. 📊 **Add more products** (aim for 50-100 products initially)
6. 📧 **Set up email service** (Mailchimp free tier to start)
7. 📈 **Monitor analytics** via the affiliate clicks table

### Product Sourcing Tips

**Quick Start (10-20 products)**:
- Top brands: Royal Canin, Hill's, Purina, James Wellbeloved
- Popular items: Adult dry food, puppy food, senior food
- Mix of price points: budget, mid-range, premium

**Scale Up (50-100 products)**:
- Add specialty foods (grain-free, raw, prescription)
- Include treats and supplements
- Cover all breed sizes and life stages

**Long Term (500+ products)**:
- Use Amazon Product Advertising API to auto-import
- Partner with brands for product data feeds
- Add user-generated reviews

### Legal Requirements (UK)

✅ **Affiliate Disclosure**: Already included on pages
✅ **Cookie Consent**: Add cookie banner (GDPR requirement)
⏳ **Privacy Policy**: Create page explaining data collection
⏳ **Terms of Service**: Standard affiliate terms

You can use generators like:
- https://www.termsfeed.com/privacy-policy-generator/
- https://www.freeprivacypolicy.com/

### Questions?

Check the `doghealthy_affiliate_clicks` table regularly to see which products perform best and optimize your recommendations!

