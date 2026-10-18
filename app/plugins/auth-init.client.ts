import { subscribeToLogoutAll } from '~/utils/auth-sync.client'

export default defineNuxtPlugin(async () => {
    const session = useSessionStore()
    const unsubscribe = subscribeToLogoutAll((userId) => {
        void session.handleExternalLogout(userId)
    })

    import.meta.hot?.dispose(unsubscribe)
    await session.initialize()
})
