import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'

export const useAuth = () => {
    const authStore = useAuthStore()
    const { user, token, status, isInitialized, isAuthenticated, isLoggingOut } =
        storeToRefs(authStore)

    return {
        user,
        token,
        status,
        isInitialized,
        isAuthenticated,
        isLoggingOut,
        login: authStore.login,
        register: authStore.register,
        logout: authStore.logout,
        logoutAllTabs: authStore.logoutAllTabs,
        initAuth: authStore.initAuth,
        refreshUser: authStore.refreshUser,
    }
}
