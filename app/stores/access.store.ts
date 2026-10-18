import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
    AccessCapabilities,
    AccessOrganisation,
    AccessContext,
    AccessIdentity,
    AccessRequirement,
    AccessSnapshot,
    PermissionDefinition,
} from '~/types/access.types'
import type { AccessApiService } from '~/services/api/wrappers/access.api'
import type { CachedApiClient } from '~/services/api/CachedApiClient'
import type { StorageService } from '~/services/storage/StorageService'
import { PERMISSION_SCOPE } from '~/constants/access.constants'
import { resetOrganisationContext } from '~/services/context/organisation-context-reset.registry'

const EMPTY_CAPABILITIES: AccessCapabilities = {
    canSwitchOrganisations: false,
    canFilterOrganisations: false,
}
const ACTING_ORGANISATION_STORAGE_PREFIX = 'acting_organisation_id:'

interface LoadedAccess {
    snapshot: AccessSnapshot
    actingOrganisationId: number | null
    contexts: Record<number, AccessContext>
}

export const useAccessStore = defineStore('access', () => {
    const app = useNuxtApp()
    const api = app.$accessApi as AccessApiService
    const cache = app.$apiClient as CachedApiClient
    const contextStorage = app.$contextStorage as StorageService

    const organisations = ref<AccessOrganisation[]>([])
    const platformOrganisationId = ref<number | null>(null)
    const actingOrganisationId = ref<number | null>(null)
    const contexts = ref<Record<number, AccessContext>>({})
    const identity = ref<AccessIdentity | null>(null)
    const capabilities = ref<AccessCapabilities>({ ...EMPTY_CAPABILITIES })
    const crossOrganisationPermissions = ref<string[]>([])
    const crossOrganisationOrganisationIds = ref<Record<string, number[]>>({})
    const organisationPermissionOrganisationIds = ref<Record<string, number[]>>({})
    const permissionDefinitions = ref<PermissionDefinition[]>([])
    const ready = ref(false)
    const loading = ref(false)
    const refreshing = ref(false)
    const switching = ref(false)

    const definitions = computed(
        () =>
            new Map(permissionDefinitions.value.map((definition) => [definition.code, definition]))
    )
    const systemRole = computed(() => identity.value?.systemRole ?? null)
    const canSwitchOrganisations = computed(() => capabilities.value.canSwitchOrganisations)
    const canFilterOrganisations = computed(() => capabilities.value.canFilterOrganisations)
    const actingContext = computed(() =>
        actingOrganisationId.value ? contexts.value[actingOrganisationId.value] : undefined
    )
    const isPlatformContext = computed(
        () => !!actingOrganisationId.value && actingOrganisationId.value === platformOrganisationId.value
    )
    const busy = computed(() => loading.value || refreshing.value || switching.value)

    let revision = 0
    let initialization: Promise<void> | null = null
    let refreshRequest: Promise<void> | null = null
    let switchRevision = 0

    const clearContextData = () => {
        cache.clearCache()
        resetOrganisationContext()
    }

    const contextStorageKey = (userId: number) => `${ACTING_ORGANISATION_STORAGE_PREFIX}${userId}`

    const clearStoredContext = () => {
        if (identity.value) contextStorage.remove(contextStorageKey(identity.value.id))
    }

    const reset = () => {
        clearStoredContext()
        revision++
        switchRevision++
        initialization = null
        refreshRequest = null
        organisations.value = []
        platformOrganisationId.value = null
        actingOrganisationId.value = null
        contexts.value = {}
        identity.value = null
        capabilities.value = { ...EMPTY_CAPABILITIES }
        crossOrganisationPermissions.value = []
        crossOrganisationOrganisationIds.value = {}
        organisationPermissionOrganisationIds.value = {}
        permissionDefinitions.value = []
        ready.value = false
        loading.value = false
        refreshing.value = false
        switching.value = false
        clearContextData()
    }

    const requestContext = async (organisationId: number) => {
        const response = await api.context(organisationId)
        if (!response.data || response.data.organisationId !== organisationId)
            throw new Error('Unable to load organisation permissions.')
        return response.data
    }

    const loadAccess = async (preferredOrganisationId: number | null): Promise<LoadedAccess> => {
        const response = await api.organisations()
        const snapshot = response.data
        if (!snapshot) throw new Error('Unable to load account access.')
        const storageKey = contextStorageKey(snapshot.identity.id)
        const storedOrganisationId = contextStorage.get<unknown>(storageKey)
        const savedOrganisationId =
            typeof storedOrganisationId === 'number' &&
            Number.isSafeInteger(storedOrganisationId) &&
            storedOrganisationId > 0
                ? storedOrganisationId
                : null

        const available = (organisationId: number | null) =>
            organisationId !== null && snapshot.organisations.some((organisation) => organisation.id === organisationId)
        if (storedOrganisationId !== null && !available(savedOrganisationId)) contextStorage.remove(storageKey)
        const nextActingOrganisationId = available(preferredOrganisationId)
            ? preferredOrganisationId
            : available(savedOrganisationId)
              ? savedOrganisationId
              : available(snapshot.platformOrganisationId)
                ? snapshot.platformOrganisationId
                : (snapshot.organisations[0]?.id ?? null)

        const contextIds = new Set<number>()
        if (nextActingOrganisationId !== null) contextIds.add(nextActingOrganisationId)
        if (available(snapshot.platformOrganisationId)) contextIds.add(snapshot.platformOrganisationId)
        const loadedContexts = await Promise.all([...contextIds].map(requestContext))

        return {
            snapshot,
            actingOrganisationId: nextActingOrganisationId,
            contexts: Object.fromEntries(
                loadedContexts.map((context) => [context.organisationId, context])
            ),
        }
    }

    const applyLoadedAccess = (next: LoadedAccess) => {
        identity.value = next.snapshot.identity
        organisations.value = next.snapshot.organisations
        platformOrganisationId.value = next.snapshot.platformOrganisationId
        capabilities.value = next.snapshot.capabilities
        crossOrganisationPermissions.value = next.snapshot.crossOrganisationPermissions
        crossOrganisationOrganisationIds.value = next.snapshot.crossOrganisationOrganisationIds ?? {}
        organisationPermissionOrganisationIds.value = next.snapshot.organisationPermissionOrganisationIds ?? {}
        permissionDefinitions.value = next.snapshot.permissionDefinitions
        contexts.value = next.contexts
        actingOrganisationId.value = next.actingOrganisationId
        ready.value = true
    }

    const ensureReady = (): Promise<void> => {
        if (ready.value) return Promise.resolve()
        if (initialization) return initialization

        const current = revision
        loading.value = true
        const pending = (async () => {
            const next = await loadAccess(actingOrganisationId.value)
            if (current === revision) applyLoadedAccess(next)
        })()
        initialization = pending
        void pending
            .finally(() => {
                if (initialization === pending) {
                    initialization = null
                    loading.value = false
                }
            })
            .catch(() => {})
        return pending
    }

    const refresh = (): Promise<void> => {
        if (!ready.value) return ensureReady()
        if (refreshRequest) return refreshRequest

        const current = ++revision
        refreshing.value = true
        const pending = (async () => {
            const next = await loadAccess(actingOrganisationId.value)
            if (current === revision) applyLoadedAccess(next)
        })()
        refreshRequest = pending
        void pending
            .finally(() => {
                if (refreshRequest === pending) {
                    refreshRequest = null
                    refreshing.value = false
                }
            })
            .catch(() => {})
        return pending
    }

    const switchActingOrganisation = async (organisationId: number) => {
        if (!canSwitchOrganisations.value)
            throw new Error('Only platform admins and platform users can switch organisations.')
        if (!organisations.value.some((organisation) => organisation.id === organisationId))
            throw new Error('Organisation is not available.')
        if (organisationId === actingOrganisationId.value) return

        const current = ++revision
        const currentSwitch = ++switchRevision
        switching.value = true
        try {
            const context = await requestContext(organisationId)
            if (current !== revision || currentSwitch !== switchRevision) return
            contexts.value = { ...contexts.value, [organisationId]: context }
            actingOrganisationId.value = organisationId
            if (identity.value) contextStorage.set(contextStorageKey(identity.value.id), organisationId)
            clearContextData()
        } finally {
            if (currentSwitch === switchRevision) switching.value = false
        }
    }

    const can = (permission: string, organisationId = actingOrganisationId.value) => {
        if (!ready.value) return false
        const definition = definitions.value.get(permission)
        if (!definition) return false
        const permissionOrganisationId =
            definition.scope === PERMISSION_SCOPE.PLATFORM ? platformOrganisationId.value : organisationId
        const context = permissionOrganisationId ? contexts.value[permissionOrganisationId] : undefined
        if (context) return context.bypassPermissions || context.permissions.includes(permission)
        return (
            definition.scope === PERMISSION_SCOPE.ORGANISATION &&
            permissionOrganisationId !== null &&
            (organisationPermissionOrganisationIds.value[permission]?.includes(permissionOrganisationId) ?? false)
        )
    }

    const canAcrossOrganisations = (permission: string) => {
        const definition = definitions.value.get(permission)
        return (
            ready.value &&
            !!definition?.allowAllOrganisations &&
            crossOrganisationPermissions.value.includes(permission) &&
            (crossOrganisationOrganisationIds.value[permission]?.length ?? 0) > 0
        )
    }

    const organisationsWithCrossOrganisationPermission = (permission: string) => {
        const allowed = new Set(crossOrganisationOrganisationIds.value[permission] ?? [])
        return organisations.value.filter((organisation) => allowed.has(organisation.id))
    }

    const canForAnyOrganisation = (permission: string) => {
        const definition = definitions.value.get(permission)
        return (
            ready.value &&
            definition?.scope === PERMISSION_SCOPE.ORGANISATION &&
            (organisationPermissionOrganisationIds.value[permission]?.length ?? 0) > 0
        )
    }

    const meets = (requirement?: AccessRequirement, organisationId?: number) => {
        if (!requirement) return true
        if ('capability' in requirement) return capabilities.value[requirement.capability]
        const satisfies = (
            permission: string,
            allowCrossOrganisation = false,
            allowCurrentContext = false,
            allowAnyOrganisation = false
        ) =>
            organisationId !== undefined
                ? can(permission, organisationId)
                : allowAnyOrganisation && canForAnyOrganisation(permission)
                  ? true
                  : allowCrossOrganisation && isPlatformContext.value
                    ? canAcrossOrganisations(permission) || (allowCurrentContext && can(permission))
                    : can(permission)
        if ('permission' in requirement)
            return satisfies(
                requirement.permission,
                requirement.allowCrossOrganisation,
                requirement.allowCurrentContext,
                requirement.allowAnyOrganisation
            )
        if ('allPermissions' in requirement)
            return requirement.allPermissions.every((permission) => can(permission, organisationId))
        return requirement.anyPermissions.some((permission) =>
            satisfies(permission, requirement.allowCrossOrganisation)
        )
    }

    return {
        organisations,
        platformOrganisationId,
        actingOrganisationId,
        contexts,
        actingContext,
        identity,
        capabilities,
        crossOrganisationPermissions,
        crossOrganisationOrganisationIds,
        organisationPermissionOrganisationIds,
        permissionDefinitions,
        ready,
        loading,
        refreshing,
        switching,
        busy,
        systemRole,
        canSwitchOrganisations,
        canFilterOrganisations,
        isPlatformContext,
        ensureReady,
        refresh,
        switchActingOrganisation,
        can,
        canAcrossOrganisations,
        canForAnyOrganisation,
        organisationsWithCrossOrganisationPermission,
        meets,
        reset,
    }
})
