import { useNuxtApp } from '#app'
import { useInventoryStore } from '~/stores/inventory.store'
import { useToast } from '~/composables/useToast'
import { INVENTORY_MESSAGES } from '~/constants/inventory.constants'
import type {
    CreateInventoryMovementDTO,
    InventoryLocation,
    InventorySnapshot,
    UpdateInventoryThresholdDTO,
} from '~/types/inventory.types'
import type { InventoryMovementFormData } from '~/schemas/inventory.schema'
import {
    organisationContextRevision,
    isOrganisationContextCurrent,
} from '~/services/context/organisation-context-reset.registry'

export interface InventoryContext {
    entityId: number
    organisationId: number
    scope?: 'organisation' | 'platform'
    productId?: number
}

export const useInventory = (): {
    snapshotFor: (key: string) => InventorySnapshot
    locationsFor: (key: string) => InventoryLocation[]
    isLoading: (key: string) => boolean
    isSaving: (key: string) => boolean
    inventoryKey: (context: InventoryContext) => string
    ownerKey: (context: InventoryContext) => string
    fetchInventory: (context: InventoryContext) => Promise<InventorySnapshot>
    fetchOwnerLocations: (context: InventoryContext) => Promise<InventoryLocation[]>
    fetchInventoryLocations: (organisationId: number) => Promise<InventoryLocation[]>
    recordMovement: (
        context: InventoryContext,
        form: InventoryMovementFormData
    ) => Promise<InventorySnapshot>
    updateThreshold: (
        context: InventoryContext,
        data: Omit<UpdateInventoryThresholdDTO, 'idempotencyKey'>
    ) => Promise<InventorySnapshot>
} => {
    const nuxtApp = useNuxtApp()
    const inventoryStore = useInventoryStore()
    const inventoryApi =
        nuxtApp.$inventoryApi as import('~/services/api/wrappers/inventory.api').InventoryApiService
    const { successFromResponse, errorFromError } = useToast()

    if (!inventoryApi) {
        throw new Error('Inventory services are not available')
    }

    const inventoryKey = (context: InventoryContext): string => {
        if (context.scope === 'platform')
            return `platform:${context.productId ?? 0}:${context.entityId}`
        return `organisation:${context.organisationId}:${context.entityId}`
    }

    const ownerKey = (context: InventoryContext): string => {
        return `organisation:${context.organisationId}`
    }

    const fetchInventory = async (context: InventoryContext): Promise<InventorySnapshot> => {
        const contextRevision = organisationContextRevision()
        const key = inventoryKey(context)
        inventoryStore.setLoading(key, true)
        inventoryStore.setError(key, null)
        try {
            const [inventoryResponse, locationResponse] = await Promise.all([
                context.scope === 'platform'
                    ? inventoryApi.getPlatformSupplyInventory(
                          requireProductId(context),
                          context.entityId
                      )
                    : inventoryApi.getOrganisationInventory(
                          context.organisationId,
                          context.entityId
                      ),
                inventoryApi.getInventoryLocations(context.organisationId),
            ])
            const snapshot = inventoryResponse.data ?? {
                balances: [],
                movements: [],
                nextCursor: null,
            }
            if (isOrganisationContextCurrent(contextRevision)) {
                inventoryStore.setSnapshot(key, snapshot)
                inventoryStore.setLocations(ownerKey(context), locationResponse.data ?? [])
            }
            return snapshot
        } catch (error) {
            const message = error instanceof Error ? error.message : INVENTORY_MESSAGES.FETCH_ERROR
            if (isOrganisationContextCurrent(contextRevision)) {
                inventoryStore.setError(key, message)
                errorFromError(error, INVENTORY_MESSAGES.FETCH_ERROR)
            }
            throw error
        } finally {
            if (isOrganisationContextCurrent(contextRevision)) inventoryStore.setLoading(key, false)
        }
    }

    const fetchOwnerLocations = async (context: InventoryContext): Promise<InventoryLocation[]> => {
        const contextRevision = organisationContextRevision()
        const response = await inventoryApi.getInventoryLocations(context.organisationId)
        const locations = response.data ?? []
        if (isOrganisationContextCurrent(contextRevision))
            inventoryStore.setLocations(ownerKey(context), locations)
        return locations
    }

    const fetchInventoryLocations = async (organisationId: number): Promise<InventoryLocation[]> =>
        await fetchOwnerLocations({ organisationId, entityId: 0 })

    const recordMovement = async (
        context: InventoryContext,
        form: InventoryMovementFormData
    ): Promise<InventorySnapshot> => {
        const key = inventoryKey(context)
        inventoryStore.setSaving(key, true)
        try {
            const payload: CreateInventoryMovementDTO = {
                ...form,
                notes: form.notes || undefined,
                idempotencyKey: createIdempotencyKey('inventory'),
            }
            const response =
                context.scope === 'platform'
                    ? await inventoryApi.recordPlatformSupplyMovement(
                          requireProductId(context),
                          context.entityId,
                          payload
                      )
                    : await inventoryApi.recordOrganisationMovement(
                          context.organisationId,
                          context.entityId,
                          payload
                      )
            const snapshot = requireSnapshot(response.data)
            inventoryStore.setSnapshot(key, snapshot)
            successFromResponse(response, INVENTORY_MESSAGES.MOVEMENT_SUCCESS)
            return snapshot
        } catch (error) {
            errorFromError(error, INVENTORY_MESSAGES.MOVEMENT_ERROR)
            throw error
        } finally {
            inventoryStore.setSaving(key, false)
        }
    }

    const updateThreshold = async (
        context: InventoryContext,
        data: Omit<UpdateInventoryThresholdDTO, 'idempotencyKey'>
    ): Promise<InventorySnapshot> => {
        const key = inventoryKey(context)
        inventoryStore.setSaving(key, true)
        try {
            const payload: UpdateInventoryThresholdDTO = {
                ...data,
                notes: data.notes || undefined,
                idempotencyKey: createIdempotencyKey('threshold'),
            }
            const response =
                context.scope === 'platform'
                    ? await inventoryApi.updatePlatformSupplyThreshold(
                          requireProductId(context),
                          context.entityId,
                          payload
                      )
                    : await inventoryApi.updateOrganisationThreshold(
                          context.organisationId,
                          context.entityId,
                          payload
                      )
            const snapshot = requireSnapshot(response.data)
            inventoryStore.setSnapshot(key, snapshot)
            successFromResponse(response, INVENTORY_MESSAGES.THRESHOLD_SUCCESS)
            return snapshot
        } catch (error) {
            errorFromError(error, INVENTORY_MESSAGES.THRESHOLD_ERROR)
            throw error
        } finally {
            inventoryStore.setSaving(key, false)
        }
    }

    const requireSnapshot = (snapshot?: InventorySnapshot | null): InventorySnapshot => {
        if (!snapshot) throw new Error('Inventory response did not include a snapshot')
        return snapshot
    }

    const createIdempotencyKey = (prefix: string): string => {
        return `${prefix}-${crypto.randomUUID()}`
    }

    const requireProductId = (context: InventoryContext): number => {
        if (!context.productId) throw new Error('Platform product is required')
        return context.productId
    }

    return {
        snapshotFor: inventoryStore.snapshotFor,
        locationsFor: inventoryStore.locationsFor,
        isLoading: inventoryStore.isLoading,
        isSaving: inventoryStore.isSaving,
        inventoryKey,
        ownerKey,
        fetchInventory,
        fetchOwnerLocations,
        fetchInventoryLocations,
        recordMovement,
        updateThreshold,
    }
}
