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
        }
      ]
    }
  },
  css: [
    '@/assets/css/brand.css'
  ],
  
  runtimeConfig: {
    unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_ANON_KEY
    }
  }
})
