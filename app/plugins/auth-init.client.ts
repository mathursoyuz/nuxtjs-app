import { subscribeToLogoutAll } from '~/utils/auth-sync.client'

export default defineNuxtPlugin(async () => {
    const authStore = useAuthStore()
    const unsubscribe = subscribeToLogoutAll(() => {
        void authStore.handleExternalLogout()
    })

    import.meta.hot?.dispose(unsubscribe)
    await authStore.initAuth()
})
