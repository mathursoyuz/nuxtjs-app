export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) {
        return
    }

    const authStore = useAuthStore()
    await authStore.initAuth()

    if (!authStore.isAuthenticated) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
        })
    }
})
