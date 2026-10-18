import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { isTokenExpired, getTokenExpirationTime } from '~/utils/jwt.util'

/**
 * Composable for handling token expiry
 * Shows popup when token is about to expire or has expired
 */
export const useTokenExpiry = () => {
    const authStore = useAuthStore()
    const { token } = storeToRefs(authStore)
    const showExpiryModal = ref(false)
    const isExpired = ref(false)

    /**
     * Check if token is expired or about to expire
     * @param thresholdMinutes - Minutes before expiry to show warning (default: 5)
     */
    const checkTokenExpiry = (thresholdMinutes = 5): boolean => {
        if (!token.value) {
            isExpired.value = true
            showExpiryModal.value = true
            return true
        }

        if (isTokenExpired(token.value)) {
            isExpired.value = true
            showExpiryModal.value = true
            return true
        }

        // Check if token is about to expire
        const expirationTime = getTokenExpirationTime(token.value)
        if (expirationTime) {
            const minutesUntilExpiry = (expirationTime - Date.now()) / (1000 * 60)
            if (minutesUntilExpiry <= thresholdMinutes && minutesUntilExpiry > 0) {
                // Token is about to expire, show warning
                showExpiryModal.value = true
                isExpired.value = false
                return false
            }
        }

        showExpiryModal.value = false
        isExpired.value = false
        return false
    }

    /**
     * Handle user choosing to re-login
     */
    const handleReLogin = async (): Promise<void> => {
        showExpiryModal.value = false
        await useSessionStore().logout()
    }

    /**
     * Close modal (user can continue with expired token, but will be redirected on next API call)
     */
    const dismissModal = (): void => {
        showExpiryModal.value = false
    }

    return {
        showExpiryModal,
        isExpired,
        checkTokenExpiry,
        handleReLogin,
        dismissModal,
    }
}
