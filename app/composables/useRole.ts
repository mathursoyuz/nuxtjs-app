import { storeToRefs } from 'pinia'
import { useAccessStore } from '~/stores/access.store'

export const useRole = (): {
    hasRole: (roles: string | string[]) => boolean
    hasAnyRole: (roles: string | string[]) => boolean
    canAccess: (roles: string | string[]) => boolean
    userRole: globalThis.ComputedRef<import('~/types/access.types').SystemRole | null>
} => {
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
