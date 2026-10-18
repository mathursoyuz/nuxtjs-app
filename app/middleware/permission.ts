import { useAccessStore } from '~/stores/access.store'

export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return
    const access = useAccessStore()
    try {
        await access.ensureReady()
        const value = Array.isArray(to.params.organisationId) ? to.params.organisationId[0] : to.params.organisationId
        const organisationId = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : undefined
        if (!access.meets(to.meta.access, organisationId)) return navigateTo('/unauthorized')
    } catch {
        return navigateTo('/unauthorized')
    }
})
