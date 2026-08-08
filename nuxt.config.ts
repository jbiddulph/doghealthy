// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  ssr: true,

  experimental: {
    // After a deploy, stale Chrome tabs may request deleted chunks — reload once.
    emitRouteChunkError: 'automatic'
  },
  
  nitro: {
    preset: 'netlify-static',
    prerender: {
      crawlLinks: true,
      // Auth-gated pages must be listed or middleware redirects skip them at generate time
      routes: [
        '/admin',
        '/admin/users',
        '/admin/dogs',
        '/admin/nfc-shipments',
        '/admin/nfc-orders',
        '/billing/success',
        '/billing/subscribe',
        '/profile',
        '/inbox',
        '/nfc-tags'
      ]
    }
  },

  routeRules: {
    '/admin/**': { prerender: true }
  },  
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/image'],

  // Netlify Image CDN in production; IPX for local/dev
  image: {
    provider: process.env.NETLIFY === 'true' ? 'netlify' : 'ipx',
    quality: 75,
    format: ['webp', 'avif'],
    domains: [
      'images.unsplash.com',
      'isprmebbahzjnrekkvxv.supabase.co'
    ],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536
    }
  },
  
  app: {
    head: {
      htmlAttrs: { lang: 'en-GB' },
      title: 'DogHealthy — UK Dog Health Tracker, NFC Tags & Food Finder',
      titleTemplate: '%s',
      link: [
        { rel: 'preconnect', href: 'https://images.unsplash.com', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://api.unsplash.com', crossorigin: 'anonymous' },
        { rel: 'preconnect', href: 'https://isprmebbahzjnrekkvxv.supabase.co', crossorigin: 'anonymous' },
        { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
        { rel: 'dns-prefetch', href: 'https://pagead2.googlesyndication.com' },
        { rel: 'dns-prefetch', href: 'https://cdn.jsdelivr.net' },
        // Load icons without blocking first paint
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css',
          media: 'print',
          onload: "this.media='all'"
        },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', href: '/favicon.ico' }
      ],
      noscript: [
        {
          children:
            '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css">'
        }
      ],
      script: [
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1907813559893319',
          async: true,
          defer: true,
          crossorigin: 'anonymous'
        }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'DogHealthy' },
        { name: 'theme-color', content: '#f97316' },
        {
          name: 'description',
          content:
            'DogHealthy is the UK dog health app for medical records, vaccinations, medications, NFC / QR pet tags, found-dog SMS alerts, and a dog food finder — built for owners in the United Kingdom.'
        },
        {
          name: 'keywords',
          content:
            'DogHealthy, UK dog health tracker, dog medical records, dog vaccinations UK, NFC dog tag, QR pet tag, found dog alert, dog food finder, puppy health, pet health UK'
        },
        { property: 'og:site_name', content: 'DogHealthy' },
        { property: 'og:locale', content: 'en_GB' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://doghealthy.co.uk' },
        {
          property: 'og:title',
          content: 'DogHealthy — UK Dog Health Tracker, NFC Tags & Food Finder'
        },
        {
          property: 'og:description',
          content:
            'Track your dog’s health, order NFC / QR tags with found-pet alerts, and find the right food — DogHealthy for UK dog owners.'
        },
        { property: 'og:image', content: 'https://doghealthy.co.uk/favicon.svg' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ]
    }
  },
  css: [
    '@/assets/css/brand.css'
  ],
  
  runtimeConfig: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    nfcMeApiKey: process.env.NFC_ME_API_KEY,
    nfcMeApiBaseUrl:
      process.env.NFC_ME_BASE_URL ||
      process.env.NFC_ME_API_BASE_URL ||
      'https://nfc-me-a3a3437da95d.herokuapp.com/api/v1',
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT,
      unsplashAccessKey:
        process.env.NUXT_PUBLIC_UNSPLASH_ACCESS_KEY || process.env.UNSPLASH_ACCESS_KEY,
      stripePaymentLinkMonthly: process.env.NUXT_PUBLIC_STRIPE_PAYMENT_LINK_MONTHLY,
      stripePaymentLinkYearly: process.env.NUXT_PUBLIC_STRIPE_PAYMENT_LINK_YEARLY,
      mapboxToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN
    }
  }
})
