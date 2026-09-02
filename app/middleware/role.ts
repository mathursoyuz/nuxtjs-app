export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) {
        return
    }

    const authStore = useAuthStore()
    await authStore.initAuth()
    const requiredRoles = to.meta.roles as string | string[] | undefined
    const requireAll = (to.meta.requireAllRoles as boolean) || false

    // No role requirement, allow access
    if (!requiredRoles) {
        return
    }

    // Check authentication first
    if (!authStore.isAuthenticated) {
        return navigateTo('/login')
    }

    // Single role check
    if (typeof requiredRoles === 'string') {
        if (authStore.userRole !== requiredRoles) {
            return navigateTo('/unauthorized')
        }
        return
    }

    // Multiple roles check
    if (Array.isArray(requiredRoles)) {
        if (requiredRoles.length === 0) {
            return // No roles specified, allow access
        }

        if (requireAll) {
            // User must have ALL roles
            const hasAllRoles = requiredRoles.every((role) => authStore.userRole === role)
            if (!hasAllRoles) {
                return navigateTo('/unauthorized')
            }
        } else {
            // User needs ANY role
            if (!authStore.canAccess(requiredRoles)) {
                return navigateTo('/unauthorized')
            }
        }
    }
})
