import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'
import { useSessionStore } from '~/stores/session.store'

export const useAuth = () => {
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
