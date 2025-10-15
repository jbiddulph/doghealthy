// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  ssr: true,
  
  nitro: {
    preset: 'netlify-static'
  },
  
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css' }
      ],
      script: [
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-EMYKQNQ3FJ', async: true },
        {
          children: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\n\ngtag('config', 'G-EMYKQNQ3FJ');`
        },
        { 
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1907813559893319', 
          async: true, 
          crossorigin: 'anonymous' 
        }
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'robots', content: 'index, follow' },
        { name: 'author', content: 'DogHealthy' },
        { name: 'theme-color', content: '#2563eb' }
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
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL,
      adsenseClient: process.env.NUXT_PUBLIC_ADSENSE_CLIENT
    }
  }
})
