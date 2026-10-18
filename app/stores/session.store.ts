import { defineStore } from 'pinia'
import type { LoginCredentials, RegisterData } from '~/types/auth.types'
import { useAccessStore } from './access.store'
import { useAuthStore } from './auth.store'

export const useSessionStore = defineStore('session', () => {
    const auth = useAuthStore()
    const access = useAccessStore()
    let initialization: Promise<void> | null = null

    async function loadAccessOrRollback(accessToken: string): Promise<void> {
        access.reset()
        try {
            await access.ensureReady()
        } catch (error) {
            auth.discardSession(accessToken)
            access.reset()
            throw error
        }
    }

    async function login(credentials: LoginCredentials) {
        const response = await auth.login(credentials)
        await loadAccessOrRollback(response.accessToken)
        return response
    }

    async function register(data: RegisterData) {
        const response = await auth.register(data)
        await loadAccessOrRollback(response.accessToken)
        return response
    }

    function initialize(): Promise<void> {
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
        void pending.finally(() => {
            if (initialization === pending) initialization = null
        }).catch(() => {})
        return pending
    }

    async function logout(options?: { broadcast?: boolean; redirect?: boolean }) {
        access.reset()
        await auth.logout(options)
    }

    const logoutAllTabs = () => logout({ broadcast: true })

    async function handleExternalLogout(accountId: number) {
        if (accountId !== auth.userId) return
        access.reset()
        await auth.handleExternalLogout(accountId)
    }

    async function handleUnauthorized(requestToken: string) {
        if (requestToken !== auth.token) return
        access.reset()
        await auth.handleUnauthorized(requestToken)
    }

    async function refreshUser() {
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
