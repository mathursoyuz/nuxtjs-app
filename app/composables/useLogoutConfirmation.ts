export const useLogoutConfirmation = (): {
    isOpen: globalThis.Ref<boolean, boolean>
    isLoggingOut: globalThis.ComputedRef<boolean>
    requestLogoutAll: () => void
    cancelLogoutAll: () => void
    confirmLogoutAll: () => Promise<void>
} => {
    const authStore = useAuthStore()
    const session = useSessionStore()
    const isOpen = useState<boolean>('logout-all-confirmation', () => false)

    const requestLogoutAll = (): void => {
        isOpen.value = true
    }

    const cancelLogoutAll = (): void => {
        isOpen.value = false
    }

    const confirmLogoutAll = async (): Promise<void> => {
        try {
            await session.logoutAllTabs()
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
