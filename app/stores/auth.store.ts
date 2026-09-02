import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { AuthService } from '~/services/auth/AuthService'
import type { AuthResponse, LoginCredentials, RegisterData, User } from '~/types/auth.types'
import { decodeJwt } from '~/utils/jwt.util'
import { publishLogoutAll } from '~/utils/auth-sync.client'

type AuthStatus = 'idle' | 'initializing' | 'authenticated' | 'unauthenticated'

interface LogoutOptions {
    broadcast?: boolean
    redirect?: boolean
}

export const useAuthStore = defineStore('auth', () => {
    const nuxtApp = useNuxtApp()
    const router = useRouter()
    const authService = nuxtApp.$authService as AuthService

    const user = ref<User | null>(null)
    const token = ref<string | null>(null)
    const status = ref<AuthStatus>('idle')
    const isLoggingOut = ref(false)

    let initializationPromise: Promise<void> | null = null
    let logoutPromise: Promise<void> | null = null

    const isInitialized = computed(() => !['idle', 'initializing'].includes(status.value))
    const isAuthenticated = computed(
        () => status.value === 'authenticated' && user.value !== null && token.value !== null
    )

    const tokenPayload = computed(() => (token.value ? decodeJwt(token.value) : null))
    const userRole = computed(() => tokenPayload.value?.role ?? user.value?.role.name ?? null)
    const userRoleId = computed(() => tokenPayload.value?.roleId ?? user.value?.role.id ?? null)
    const userId = computed(() => tokenPayload.value?.sub ?? user.value?.id ?? null)

    const canAccess = (roles: string | string[]): boolean => {
        if (!userRole.value) {
            return false
        }
        return Array.isArray(roles) ? roles.includes(userRole.value) : userRole.value === roles
    }

    const canView = (_resource: string): boolean => isAuthenticated.value

    const canCreate = (_resource: string): boolean =>
        userRole.value !== null && ['admin', 'sales_manager'].includes(userRole.value)

    const canEdit = (_resource: string, ownerId?: number): boolean => {
        if (userRole.value === 'admin' || userRole.value === 'sales_manager') {
            return true
        }
        return userRole.value === 'sales_rep' && ownerId !== undefined && userId.value === ownerId
    }

    const canDelete = (_resource: string, ownerId?: number): boolean => canEdit(_resource, ownerId)

    const setAuth = (nextUser: User, accessToken: string): void => {
        const payload = decodeJwt(accessToken)
        if (!payload) {
            throw new Error('Invalid token: unable to decode JWT')
        }

        user.value =
            payload.role && payload.role !== nextUser.role.name
                ? { ...nextUser, role: { ...nextUser.role, name: payload.role } }
                : nextUser
        token.value = accessToken
        status.value = 'authenticated'
    }

    const clearAuth = (): void => {
        user.value = null
        token.value = null
        status.value = 'unauthenticated'
    }

    const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await authService.login(credentials)
        setAuth(response.user, response.accessToken)
        return response
    }

    const register = async (data: RegisterData): Promise<AuthResponse> => {
        const response = await authService.register(data)
        setAuth(response.user, response.accessToken)
        return response
    }

    const initAuth = async (): Promise<void> => {
        if (isInitialized.value) {
            return
        }
        if (initializationPromise) {
            return initializationPromise
        }

        status.value = 'initializing'
        initializationPromise = (async () => {
            try {
                const session = await authService.restoreSession()
                if (session) {
                    setAuth(session.user, session.accessToken)
                    return
                }
            } catch (error) {
                console.error('Failed to initialize authentication:', error)
            } finally {
                if (status.value !== 'authenticated') {
                    clearAuth()
                }
            }
        })()

        try {
            await initializationPromise
        } finally {
            initializationPromise = null
        }
    }

    const logout = (options: LogoutOptions = {}): Promise<void> => {
        if (logoutPromise) {
            return logoutPromise
        }

        const { broadcast = false, redirect = true } = options
        isLoggingOut.value = true
        logoutPromise = (async () => {
            await authService.logout()
            clearAuth()

            if (broadcast) {
                publishLogoutAll()
            }

            if (redirect && router.currentRoute.value.path !== '/login') {
                await router.push('/login')
            }
        })().finally(() => {
            isLoggingOut.value = false
            logoutPromise = null
        })

        return logoutPromise
    }

    const logoutAllTabs = (): Promise<void> => logout({ broadcast: true })
    const handleExternalLogout = (): Promise<void> => logout()
    const handleUnauthorized = (): Promise<void> => logout()

    const refreshUser = async (): Promise<void> => {
        const refreshedUser = await authService.refreshUser()
        if (refreshedUser) {
            user.value = refreshedUser
        } else {
            clearAuth()
        }
    }

    return {
        user,
        token,
        status,
        isLoggingOut,
        isInitialized,
        isAuthenticated,
        userRole,
        userRoleId,
        userId,
        canAccess,
        canView,
        canCreate,
        canEdit,
        canDelete,
        login,
        register,
        logout,
        logoutAllTabs,
        handleExternalLogout,
        handleUnauthorized,
        initAuth,
        refreshUser,
    }
})
