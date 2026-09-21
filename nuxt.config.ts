import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  modules: ['@nuxt/eslint'],
  ssr: true,

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    strict: true,
    typeCheck: false, // run explicitly via `npm run typecheck`
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en', class: 'dark' },
      title: 'Rechitta, your AI property agent',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        {
          name: 'description',
          content:
            'Rechitta is a voice-first AI agent for Berkeley Square North. Ask a question out loud and get straight answers on price, payment plans, yields and handover.',
        },
        { name: 'theme-color', content: '#04070a' },
        { property: 'og:title', content: 'Rechitta, your AI property agent' },
        { property: 'og:type', content: 'website' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ],
    },
    pageTransition: false,
    layoutTransition: false,
  },

  routeRules: {
    '/media/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    '/fonts/**': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
  },

  features: { inlineStyles: true },
  experimental: { payloadExtraction: true },
})
