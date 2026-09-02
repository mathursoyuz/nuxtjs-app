import { useAuthStore } from '~/stores/auth.store'
import { useRole } from '~/composables/useRole'
import { storeToRefs } from 'pinia'

/**
 * Composable for route-level guard checks
 * Use this in pages/components to programmatically check access
 */
export const useRouteGuard = () => {
    const authStore = useAuthStore()
    const { isAuthenticated } = storeToRefs(authStore)
    const { hasRole, hasAnyRole } = useRole()

    const canAccessRoute = (roles?: string | string[], requireAll = false): boolean => {
        // No role requirement, allow access if authenticated
        if (!roles) {
            return isAuthenticated.value
        }

        // Must be authenticated
        if (!isAuthenticated.value) {
            return false
        }

        // Single role check
        if (typeof roles === 'string') {
            return hasRole(roles)
        }

        // Multiple roles check
        if (Array.isArray(roles)) {
            if (roles.length === 0) {
                return true
            }

            if (requireAll) {
                // User must have ALL roles
                return roles.every((role) => hasRole(role))
            } else {
                // User needs ANY role
                return hasAnyRole(roles)
            }
        }

        return false
    }

    const requireAuth = (): boolean => {
        return isAuthenticated.value
    }

    return {
        canAccessRoute,
        requireAuth,
        isAuthenticated,
    }
}
