export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) {
        return
    }

    const authStore = useAuthStore()
    await useSessionStore().initialize()

    if (!authStore.isAuthenticated) {
        return navigateTo({
            path: '/login',
            query: { redirect: to.fullPath },
        })
    }
})
