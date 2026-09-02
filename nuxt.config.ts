import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
    ssr: false,
    compatibilityDate: '2025-07-15',
    devtools: { enabled: process.env.NODE_ENV === 'development' },

    modules: ['@pinia/nuxt'],

    app: {
        pageTransition: { name: 'page', mode: 'out-in' },
        layoutTransition: { name: 'layout', mode: 'out-in' },
    },
    css: ['@mdi/font/css/materialdesignicons.css', 'vuetify/styles'],
    build: {
        transpile: ['vuetify'],
    },
    vite: {
        plugins: [
            // @ts-expect-error
            vuetify({ autoImport: true }),
        ],
        vue: {
            template: {
                transformAssetUrls,
            },
        },
    },
    nitro: {
        preset: 'static',
        prerender: {
            crawlLinks: true,
        },
    },

    devServer: {
        port: 3001,
        host: 'localhost',
    },

    runtimeConfig: {
        public: {
            apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '',
            appBearerToken: process.env.NUXT_PUBLIC_APP_BEARER_TOKEN || '',
        },
    },
})
