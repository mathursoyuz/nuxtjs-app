import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { useSessionStore } from '~/stores/session.store'

export const useAuth = (): {
    user: globalThis.ComputedRef<{
        id: number
        email: string
        firstName: string
        lastName: string
        phoneNumber: string
        isActive: boolean
    } | null>
    token: globalThis.Ref<string | null, string | null>
    status: globalThis.Ref<
        'idle' | 'initializing' | 'authenticated' | 'unauthenticated',
        'idle' | 'initializing' | 'authenticated' | 'unauthenticated'
    >
    isInitialized: globalThis.ComputedRef<boolean>
    isAuthenticated: globalThis.ComputedRef<boolean>
    isLoggingOut: globalThis.Ref<boolean, boolean>
    login: (
        credentials: import('~/types/auth.types').LoginCredentials
    ) => Promise<import('~/types/auth.types').AuthResponse>
    register: (
        data: import('~/types/auth.types').RegisterData
    ) => Promise<import('~/types/auth.types').AuthResponse>
    logout: (options?: { broadcast?: boolean; redirect?: boolean }) => Promise<void>
    logoutAllTabs: () => Promise<void>
    initAuth: () => Promise<void>
    refreshUser: () => Promise<void>
} => {
    const authStore = useAuthStore()
    const session = useSessionStore()
    const { user, token, status, isInitialized, isAuthenticated, isLoggingOut } =
        storeToRefs(authStore)

    return {
        user,
        token,
        status,
        isInitialized,
        isAuthenticated,
        isLoggingOut,
        login: session.login,
        register: session.register,
        logout: session.logout,
        logoutAllTabs: session.logoutAllTabs,
        initAuth: session.initialize,
        refreshUser: session.refreshUser,
    }
}
