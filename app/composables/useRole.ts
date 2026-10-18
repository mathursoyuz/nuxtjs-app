import { storeToRefs } from 'pinia'
import { useAccessStore } from '~/stores/access.store'

export const useRole = () => {
    const access = useAccessStore()
    const { systemRole: userRole } = storeToRefs(access)
    const canAccess = (roles: string | string[]): boolean =>
        !!userRole.value && (Array.isArray(roles) ? roles : [roles]).includes(userRole.value)
    return {
        hasRole: canAccess,
        hasAnyRole: canAccess,
        canAccess,
        userRole,
    }
}
