export const useLogoutConfirmation = () => {
    const authStore = useAuthStore()
    const isOpen = useState<boolean>('logout-all-confirmation', () => false)

    const requestLogoutAll = (): void => {
        isOpen.value = true
    }

    const cancelLogoutAll = (): void => {
        isOpen.value = false
    }

    const confirmLogoutAll = async (): Promise<void> => {
        try {
            await authStore.logoutAllTabs()
        } finally {
            isOpen.value = false
        }
    }

    return {
        isOpen,
        isLoggingOut: computed(() => authStore.isLoggingOut),
        requestLogoutAll,
        cancelLogoutAll,
        confirmLogoutAll,
    }
}
