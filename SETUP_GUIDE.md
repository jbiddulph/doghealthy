# DogHealthy Setup Guide

## 🚀 Quick Start

The development server should now be running without Stripe errors! The classifieds system is fully functional without payment features.

## 📋 Environment Variables Setup

Create a `.env` file in your project root with the following variables:

### Required (Core Features):
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Optional (Payment Features):
```bash
# Stripe Configuration (for premium/featured listings)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Optional (Ad Revenue):
```bash
# Google AdSense (for ad revenue)
NUXT_PUBLIC_ADSENSE_CLIENT=ca-pub-your_adsense_client_id
```

### Optional (Homepage Images):
```bash
# Unsplash API (for dynamic homepage images)
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

### Required (Production):
```bash
# Base URL for redirects
NUXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🗄️ Database Setup

1. **Run the Migration**: Execute `supabase/run-all-migrations.sql` in your Supabase SQL Editor
2. **Enable Realtime**: Make sure Realtime is enabled in your Supabase dashboard
3. **Set up RLS**: Row Level Security policies are included in the migration

## 🧪 Testing the Features

### ✅ Working Now (Without Environment Variables):
- **Classifieds Browse**: `http://localhost:3000/classifieds`
- **Create Listing**: `http://localhost:3000/classifieds/new`
- **My Listings**: `http://localhost:3000/classifieds/my-listings`
- **Real-time Chat**: Available in listing detail pages
- **Notifications**: Bell icon in navigation
- **Ad Placeholders**: Development mode ads

### 🔧 Requires Environment Variables:
- **Premium/Featured Upgrades**: Need Stripe keys
- **Real AdSense**: Need AdSense client ID
- **Dynamic Homepage Images**: Need Unsplash key

## 🎯 Current Status

**✅ All Core Features Implemented:**
- Complete classifieds system with CRUD operations
- Real-time chat between buyers and sellers
- Notification system with bell icon
- AdSense integration (with placeholders)
- Automated reminder system
- Responsive design with brand colors

**🚀 Ready for Production:**
- Set up environment variables
- Run database migration
- Deploy to Netlify
- Configure Stripe and AdSense for revenue

## 🔧 Troubleshooting

### Stripe Errors:
- If you see "Payment service not configured" - this is expected without Stripe keys
- Premium/Featured upgrade buttons will show user-friendly error messages
- All other features work normally

### Database Errors:
- Make sure to run the migration: `supabase/run-all-migrations.sql`
- Verify your Supabase environment variables are correct
- Check that RLS policies are enabled

### Development Server:
- Server runs on `http://localhost:3000` (or 3001 if 3000 is occupied)
- All new features are accessible through the navigation menu
- Classifieds link added to both desktop and mobile navigation

## 📊 Features Overview

| Feature | Status | Notes |
|---------|--------|-------|
| Classifieds Browse | ✅ Working | Full filtering and pagination |
| Create/Edit Listings | ✅ Working | Complete CRUD operations |
| Real-time Chat | ✅ Working | Supabase Realtime integration |
| Notifications | ✅ Working | Bell icon with real-time updates |
| Premium Upgrades | 🔧 Needs Stripe | Graceful error handling |
| AdSense Integration | 🔧 Needs AdSense | Placeholder ads in dev |
| Automated Reminders | ✅ Working | Netlify scheduled function |
| Mobile Responsive | ✅ Working | Hamburger menu implemented |

## 🎉 Next Steps

1. **Test the Classifieds**: Try creating and browsing listings
2. **Set up Environment Variables**: Add your keys when ready for production
3. **Run Database Migration**: Execute the SQL in Supabase
4. **Deploy to Production**: Push to Netlify with environment variables
5. **Configure Stripe**: Set up payment processing for revenue
6. **Set up AdSense**: Add real ads for additional revenue

The platform is now a complete dog breeding marketplace with professional-grade features! 🐕✨
