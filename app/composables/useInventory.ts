import { useNuxtApp } from '#app'
import { useInventoryStore } from '~/stores/inventory.store'
import { useToast } from '~/composables/useToast'
import { INVENTORY_MESSAGES } from '~/constants/inventory.constants'
import type {
    CreateInventoryMovementDTO,
    InventorySnapshot,
    UpdateInventoryThresholdDTO,
} from '~/types/inventory.types'
import type { InventoryMovementFormData } from '~/schemas/inventory.schema'

export interface InventoryContext {
    entityId: number
    clientId: number
}

export function useInventory() {
    const nuxtApp = useNuxtApp()
    const inventoryStore = useInventoryStore()
    const inventoryApi =
        nuxtApp.$inventoryApi as import('~/services/api/wrappers/inventory.api').InventoryApiService
    const locationApi =
        nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
    const { successFromResponse, errorFromError } = useToast()

    if (!inventoryApi || !locationApi) {
        throw new Error('Inventory services are not available')
    }

    function inventoryKey(context: InventoryContext): string {
        return `client:${context.clientId}:${context.entityId}`
    }

    function ownerKey(context: InventoryContext): string {
        return `client:${context.clientId}`
    }

    async function fetchInventory(context: InventoryContext): Promise<InventorySnapshot> {
        const key = inventoryKey(context)
        inventoryStore.setLoading(key, true)
        inventoryStore.setError(key, null)
        try {
            const [inventoryResponse, locationResponse] = await Promise.all([
                inventoryApi.getClientInventory(context.clientId, context.entityId),
                locationApi.getAllLocations(context.clientId),
            ])
            const snapshot = inventoryResponse.data ?? {
                balances: [],
                movements: [],
                nextCursor: null,
            }
            inventoryStore.setSnapshot(key, snapshot)
            inventoryStore.setLocations(ownerKey(context), locationResponse.data ?? [])
            return snapshot
        } catch (error) {
            const message = error instanceof Error ? error.message : INVENTORY_MESSAGES.FETCH_ERROR
            inventoryStore.setError(key, message)
            errorFromError(error, INVENTORY_MESSAGES.FETCH_ERROR)
            throw error
        } finally {
            inventoryStore.setLoading(key, false)
        }
    }

    async function fetchOwnerLocations(context: InventoryContext) {
        const response = await locationApi.getAllLocations(context.clientId)
        const locations = response.data ?? []
        inventoryStore.setLocations(ownerKey(context), locations)
        return locations
    }

    async function recordMovement(
        context: InventoryContext,
        form: InventoryMovementFormData
    ): Promise<InventorySnapshot> {
        const key = inventoryKey(context)
        inventoryStore.setSaving(key, true)
        try {
            const payload: CreateInventoryMovementDTO = {
                ...form,
                notes: form.notes || undefined,
                idempotencyKey: createIdempotencyKey('inventory'),
            }
            const response = await inventoryApi.recordClientMovement(
                context.clientId,
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

    async function updateThreshold(
        context: InventoryContext,
        data: Omit<UpdateInventoryThresholdDTO, 'idempotencyKey'>
    ): Promise<InventorySnapshot> {
        const key = inventoryKey(context)
        inventoryStore.setSaving(key, true)
        try {
            const payload: UpdateInventoryThresholdDTO = {
                ...data,
                notes: data.notes || undefined,
                idempotencyKey: createIdempotencyKey('threshold'),
            }
            const response = await inventoryApi.updateClientThreshold(
                context.clientId,
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

    function requireSnapshot(snapshot?: InventorySnapshot): InventorySnapshot {
        if (!snapshot) throw new Error('Inventory response did not include a snapshot')
        return snapshot
    }

    function createIdempotencyKey(prefix: string): string {
        return `${prefix}-${crypto.randomUUID()}`
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
        recordMovement,
        updateThreshold,
    }
}
