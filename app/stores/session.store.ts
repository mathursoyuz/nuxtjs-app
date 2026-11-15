import { defineStore } from 'pinia'
import type { LoginCredentials, RegisterData } from '~/types/auth.types'
import { useAccessStore } from './access.store'
import { useAuthStore } from './auth.store'

export const useSessionStore = defineStore('session', () => {
    const auth = useAuthStore()
    const access = useAccessStore()
    let initialization: Promise<void> | null = null

    const loadAccessOrRollback = async (accessToken: string): Promise<void> => {
        access.reset()
        try {
            await access.ensureReady()
        } catch (error) {
            auth.discardSession(accessToken)
            access.reset()
            throw error
        }
    }

    const login = async (
        credentials: LoginCredentials
    ): Promise<import('@/types/auth.types').AuthResponse> => {
        const response = await auth.login(credentials)
        await loadAccessOrRollback(response.accessToken)
        return response
    }

    const register = async (
        data: RegisterData
    ): Promise<import('@/types/auth.types').AuthResponse> => {
        const response = await auth.register(data)
        await loadAccessOrRollback(response.accessToken)
        return response
    }

    const initialize = (): Promise<void> => {
        if (initialization) return initialization
        const pending = (async () => {
            await auth.initAuth()
            if (!auth.isAuthenticated) {
                access.reset()
                return
            }
            try {
                await access.ensureReady()
            } catch {
                auth.discardSession(auth.token ?? undefined)
                access.reset()
            }
        })()
        initialization = pending
        void pending
            .finally(() => {
                if (initialization === pending) initialization = null
            })
            .catch(() => {})
        return pending
    }

    const logout = async (options?: { broadcast?: boolean; redirect?: boolean }): Promise<void> => {
        access.reset()
        await auth.logout(options)
    }

    const logoutAllTabs = (): Promise<void> => logout({ broadcast: true })

    const handleExternalLogout = async (accountId: number): Promise<void> => {
        if (accountId !== auth.userId) return
        access.reset()
        await auth.handleExternalLogout(accountId)
    }

    const handleUnauthorized = async (requestToken: string): Promise<void> => {
        if (requestToken !== auth.token) return
        access.reset()
        await auth.handleUnauthorized(requestToken)
    }

    const refreshUser = async (): Promise<void> => {
        await auth.refreshUser()
        if (auth.isAuthenticated) await access.refresh()
    }

    return {
        initialize,
        login,
        register,
        logout,
        logoutAllTabs,
        handleExternalLogout,
        handleUnauthorized,
        refreshUser,
    }
})
