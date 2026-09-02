import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    CreateInventoryMovementDTO,
    InventorySnapshot,
    UpdateInventoryThresholdDTO,
} from '~/types/inventory.types'

export class InventoryApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    getClientInventory(
        clientId: number,
        clientProductVariantId: number
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.get<InventorySnapshot>(
            `/clients/${clientId}/client-product-variants/${clientProductVariantId}/inventory`,
            undefined,
            `inventory:client:${clientId}:${clientProductVariantId}`,
            60 * 1000,
            true
        )
    }

    recordClientMovement(
        clientId: number,
        clientProductVariantId: number,
        data: CreateInventoryMovementDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.post<InventorySnapshot>(
            `/clients/${clientId}/client-product-variants/${clientProductVariantId}/inventory/movements`,
            data,
            undefined,
            'inventory:.*'
        )
    }

    updateClientThreshold(
        clientId: number,
        clientProductVariantId: number,
        data: UpdateInventoryThresholdDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.patch<InventorySnapshot>(
            `/clients/${clientId}/client-product-variants/${clientProductVariantId}/inventory/threshold`,
            data,
            undefined,
            'inventory:.*'
        )
    }
}
