import { useAuthStore } from '~/stores/auth.store'
import { storeToRefs } from 'pinia'

export const useRole = () => {
    const authStore = useAuthStore()
    const { userRole } = storeToRefs(authStore)

    const hasRole = (role: string): boolean => {
        return userRole.value === role
    }

    const hasAnyRole = (roles: string[]): boolean => {
        return authStore.canAccess(roles)
    }

    /**
     * Check if user can access based on role(s)
     * Supports single role string or array of roles (ANY match)
     * @param roles - Single role string or array of roles
     * @returns true if user has access
     */
    const canAccess = (roles: string | string[]): boolean => {
        return authStore.canAccess(roles)
    }

    /**
     * Check if user can view a resource
     * @param resource - Resource name (e.g., 'products', 'customers')
     * @returns true if user can view
     */
    const canView = (resource: string): boolean => {
        return authStore.canView(resource)
    }

    /**
     * Check if user can create a resource
     * @param resource - Resource name (e.g., 'products', 'customers')
     * @returns true if user can create
     */
    const canCreate = (resource: string): boolean => {
        return authStore.canCreate(resource)
    }

    /**
     * Check if user can edit a resource
     * @param resource - Resource name (e.g., 'products', 'customers')
     * @param ownerId - Optional owner ID for ownership check
     * @returns true if user can edit
     */
    const canEdit = (resource: string, ownerId?: number): boolean => {
        return authStore.canEdit(resource, ownerId)
    }

    /**
     * Check if user can delete a resource
     * @param resource - Resource name (e.g., 'products', 'customers')
     * @param ownerId - Optional owner ID for ownership check
     * @returns true if user can delete
     */
    const canDelete = (resource: string, ownerId?: number): boolean => {
        return authStore.canDelete(resource, ownerId)
    }

    const isAdmin = (): boolean => {
        return hasRole('admin')
    }

    const isSalesManager = (): boolean => {
        return hasRole('sales_manager')
    }

    const isSalesRep = (): boolean => {
        return hasRole('sales_rep')
    }

    return {
        hasRole,
        hasAnyRole,
        canAccess, // Main function for v-if usage
        canView,
        canCreate,
        canEdit,
        canDelete,
        isAdmin,
        isSalesManager,
        isSalesRep,
        userRole,
    }
}
