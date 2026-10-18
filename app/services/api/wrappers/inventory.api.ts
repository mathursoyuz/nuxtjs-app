import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    CreateInventoryMovementDTO,
    InventoryLocation,
    InventorySnapshot,
    UpdateInventoryThresholdDTO,
} from '~/types/inventory.types'

export class InventoryApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    getInventoryLocations(organisationId: number): Promise<ApiResponse<InventoryLocation[]>> {
        return this.cachedApi.get<InventoryLocation[]>(
            `/organisations/${organisationId}/inventory-locations`,
            undefined,
            `inventory:locations:${organisationId}`,
            5 * 60 * 1000,
            true
        )
    }

    getOrganisationInventory(
        organisationId: number,
        organisationProductVariantId: number
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.get<InventorySnapshot>(
            `/organisations/${organisationId}/organisation-product-variants/${organisationProductVariantId}/inventory`,
            undefined,
            `inventory:organisation:${organisationId}:${organisationProductVariantId}`,
            60 * 1000,
            true
        )
    }

    recordOrganisationMovement(
        organisationId: number,
        organisationProductVariantId: number,
        data: CreateInventoryMovementDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.post<InventorySnapshot>(
            `/organisations/${organisationId}/organisation-product-variants/${organisationProductVariantId}/inventory/movements`,
            data,
            undefined,
            'inventory:.*'
        )
    }

    updateOrganisationThreshold(
        organisationId: number,
        organisationProductVariantId: number,
        data: UpdateInventoryThresholdDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.patch<InventorySnapshot>(
            `/organisations/${organisationId}/organisation-product-variants/${organisationProductVariantId}/inventory/threshold`,
            data,
            undefined,
            'inventory:.*'
        )
    }

    getPlatformSupplyInventory(
        productId: number,
        productVariantId: number
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.get<InventorySnapshot>(
            `/products/${productId}/variants/${productVariantId}/supply-inventory`,
            undefined,
            `inventory:platform:${productId}:${productVariantId}`,
            60 * 1000,
            true
        )
    }

    recordPlatformSupplyMovement(
        productId: number,
        productVariantId: number,
        data: CreateInventoryMovementDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.post<InventorySnapshot>(
            `/products/${productId}/variants/${productVariantId}/supply-inventory/movements`,
            data,
            undefined,
            'inventory:.*'
        )
    }

    updatePlatformSupplyThreshold(
        productId: number,
        productVariantId: number,
        data: UpdateInventoryThresholdDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return this.cachedApi.patch<InventorySnapshot>(
            `/products/${productId}/variants/${productVariantId}/supply-inventory/threshold`,
            data,
            undefined,
            'inventory:.*'
        )
    }
}
