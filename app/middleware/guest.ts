export default defineNuxtRouteMiddleware(async () => {
    if (import.meta.server) {
        return
    }

    const authStore = useAuthStore()
    await authStore.initAuth()

    if (authStore.isAuthenticated) {
        return navigateTo('/dashboard')
    }
})
