import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthService } from '~/services/auth/AuthService'
import type { AuthResponse, LoginCredentials, RegisterData, User } from '~/types/auth.types'
import { publishLogoutAll } from '~/utils/auth-sync.client'

type AuthStatus = 'idle' | 'initializing' | 'authenticated' | 'unauthenticated'
interface LogoutOptions {
    broadcast?: boolean
    redirect?: boolean
}

export const useAuthStore = defineStore('auth', () => {
    const authService = useNuxtApp().$authService as AuthService
    const router = useRouter()
    const sessionUser = ref<User | null>(null)
    const user = computed(() => sessionUser.value)
    const token = ref<string | null>(null)
    const status = ref<AuthStatus>('idle')
    const isLoggingOut = ref(false)
    let revision = 0
    let initializationPromise: Promise<void> | null = null
    let logoutPromise: Promise<void> | null = null
    const isInitialized = computed(() => !['idle', 'initializing'].includes(status.value))
    const isAuthenticated = computed(
        () => status.value === 'authenticated' && user.value !== null && token.value !== null
    )
    const userId = computed(() => user.value?.id ?? null)
    function setAuth(nextUser: User, accessToken: string) {
        sessionUser.value = nextUser
        token.value = accessToken
        status.value = 'authenticated'
    }
    function clearAuth() {
        revision++
        initializationPromise = null
        sessionUser.value = null
        token.value = null
        status.value = 'unauthenticated'
    }
    async function authenticate(operation: () => Promise<AuthResponse>): Promise<AuthResponse> {
        const current = ++revision
        let response: AuthResponse | undefined
        try {
            response = await operation()
            if (current !== revision) throw new Error('Authentication request was superseded.')
            setAuth(response.user, response.accessToken)
            if (current !== revision) throw new Error('Authentication request was superseded.')
            return response
        } catch (error) {
            if (response) authService.clearSession(response.accessToken)
            if (current === revision) clearAuth()
            throw error
        }
    }
    const login = (credentials: LoginCredentials) =>
        authenticate(() => authService.login(credentials))
    const register = (data: RegisterData) => authenticate(() => authService.register(data))
    async function initAuth(): Promise<void> {
        if (initializationPromise) return initializationPromise
        if (isInitialized.value) return
        const current = ++revision
        status.value = 'initializing'
        const pending = (async () => {
            try {
                const session = await authService.restoreSession()
                if (current !== revision) return
                if (!session) {
                    clearAuth()
                    return
                }
                setAuth(session.user, session.accessToken)
            } catch {
                if (current === revision) {
                    authService.clearSession()
                    clearAuth()
                }
            }
        })()
        initializationPromise = pending
        try {
            await pending
        } finally {
            if (initializationPromise === pending) initializationPromise = null
        }
    }
    async function redirectToLogin() {
        if (router.currentRoute.value.path !== '/login') await router.push('/login')
    }
    function logout(options: LogoutOptions = {}): Promise<void> {
        if (logoutPromise) return logoutPromise
        const { broadcast = false, redirect = true } = options
        const current = ++revision
        const accountId = userId.value
        isLoggingOut.value = true
        const pending = (async () => {
            try {
                await authService.logout(broadcast)
                if (broadcast && accountId) publishLogoutAll(accountId)
            } finally {
                if (current === revision) {
                    clearAuth()
                    if (redirect) await redirectToLogin()
                }
            }
        })().finally(() => {
            isLoggingOut.value = false
            logoutPromise = null
        })
        logoutPromise = pending
        return pending
    }
    const logoutAllTabs = () => logout({ broadcast: true })
    async function handleExternalLogout(accountId: number) {
        if (accountId !== userId.value) return
        authService.clearSession()
        clearAuth()
        await redirectToLogin()
    }
    async function handleUnauthorized(requestToken: string) {
        if (!authService.clearSession(requestToken)) return
        clearAuth()
        await redirectToLogin()
    }
    async function refreshUser() {
        const current = revision
        const refreshed = await authService.refreshUser()
        if (current !== revision || !refreshed) return
        sessionUser.value = refreshed
    }
    function discardSession(accessToken?: string) {
        authService.clearSession(accessToken)
        clearAuth()
    }
    return {
        user,
        token,
        status,
        isLoggingOut,
        isInitialized,
        isAuthenticated,
        userId,
        login,
        register,
        logout,
        logoutAllTabs,
        handleExternalLogout,
        handleUnauthorized,
        initAuth,
        refreshUser,
        clearAuth,
        discardSession,
    }
})
