import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            },
        },
        theme: {
            defaultTheme: 'light',
            themes: {
                light: {
                    colors: {
                        primary: '#9B2335', // Wine red
                        secondary: '#D4A5A5', // Dusty rose
                        accent: '#BE3455', // Rose wine
                        error: '#C62828', // Deep red
                        info: '#8E5572', // Muted plum
                        success: '#4A7C59', // Sage green
                        warning: '#D4A574', // Warm amber
                        background: '#FDFBFB', // Soft rose tint
                        surface: '#FFFFFF',
                    },
                },
                dark: {
                    dark: true,
                    colors: {
                        primary: '#BE3455', // Rose wine
                        secondary: '#D4A5A5', // Dusty rose
                        accent: '#9B2335', // Wine red
                        error: '#EF5350', // Light red
                        info: '#B085A0', // Light plum
                        success: '#81C784', // Light green
                        warning: '#FFB74D', // Light amber
                        background: '#1A1418', // Dark wine
                        surface: '#2A2025', // Dark rose
                    },
                },
            },
        },
        defaults: {
            VCard: {
                elevation: 0,
                style: 'border: 1px solid rgba(0,0,0,0.05);',
            },
            VTextField: {
                variant: 'outlined',
                density: 'comfortable',
            },
            VSelect: {
                variant: 'outlined',
                density: 'comfortable',
            },
            VTextarea: {
                variant: 'outlined',
                density: 'comfortable',
            },
            VDataTable: {
                itemsPerPage: 100,
                itemsPerPageOptions: [25, 50, 100, 500],
            },
            VDataTableServer: {
                itemsPerPage: 100,
                itemsPerPageOptions: [25, 50, 100, 500],
            },
        },
    })
    app.vueApp.use(vuetify)
})
