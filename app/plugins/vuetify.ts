import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import { darkThemeColors, lightThemeColors } from '~/config/theme'

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
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
                    colors: lightThemeColors,
                },
                dark: {
                    dark: true,
                    colors: darkThemeColors,
                },
            },
        },
        defaults: {
            VCard: {
                elevation: 0,
                style: 'border: 1px solid rgb(var(--v-border-color) / var(--v-border-opacity));',
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
