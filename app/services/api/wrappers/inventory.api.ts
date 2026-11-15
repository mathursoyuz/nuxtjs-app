import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type {
    CreateInventoryMovementDTO,
    InventoryLocation,
    InventorySnapshot,
    UpdateInventoryThresholdDTO,
} from '~/types/inventory.types'

export class InventoryApiService extends HttpFactory {
    async getInventoryLocations(organisationId: number): Promise<ApiResponse<InventoryLocation[]>> {
        return await this.call<InventoryLocation[]>(
            'GET',
            `/organisations/${organisationId}/inventory-locations`,
            undefined,
            {
                cacheKey: `inventory:locations:${organisationId}`,
                ttl: 5 * 60 * 1000,
                skipCache: true,
            }
        )
    }

    async getOrganisationInventory(
        organisationId: number,
        organisationProductVariantId: number
    ): Promise<ApiResponse<InventorySnapshot>> {
        return await this.call<InventorySnapshot>(
            'GET',
            `/organisations/${organisationId}/organisation-product-variants/${organisationProductVariantId}/inventory`,
            undefined,
            {
                cacheKey: `inventory:organisation:${organisationId}:${organisationProductVariantId}`,
                ttl: 60 * 1000,
                skipCache: true,
            }
        )
    }

    async recordOrganisationMovement(
        organisationId: number,
        organisationProductVariantId: number,
        data: CreateInventoryMovementDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return await this.call<InventorySnapshot, CreateInventoryMovementDTO>(
            'POST',
            `/organisations/${organisationId}/organisation-product-variants/${organisationProductVariantId}/inventory/movements`,
            data,
            { invalidatePattern: 'inventory:.*' }
        )
    }

    async updateOrganisationThreshold(
        organisationId: number,
        organisationProductVariantId: number,
        data: UpdateInventoryThresholdDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return await this.call<InventorySnapshot, UpdateInventoryThresholdDTO>(
            'PATCH',
            `/organisations/${organisationId}/organisation-product-variants/${organisationProductVariantId}/inventory/threshold`,
            data,
            { invalidatePattern: 'inventory:.*' }
        )
    }

    async getPlatformSupplyInventory(
        productId: number,
        productVariantId: number
    ): Promise<ApiResponse<InventorySnapshot>> {
        return await this.call<InventorySnapshot>(
            'GET',
            `/products/${productId}/variants/${productVariantId}/supply-inventory`,
            undefined,
            {
                cacheKey: `inventory:platform:${productId}:${productVariantId}`,
                ttl: 60 * 1000,
                skipCache: true,
            }
        )
    }

    async recordPlatformSupplyMovement(
        productId: number,
        productVariantId: number,
        data: CreateInventoryMovementDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return await this.call<InventorySnapshot, CreateInventoryMovementDTO>(
            'POST',
            `/products/${productId}/variants/${productVariantId}/supply-inventory/movements`,
            data,
            { invalidatePattern: 'inventory:.*' }
        )
    }

    async updatePlatformSupplyThreshold(
        productId: number,
        productVariantId: number,
        data: UpdateInventoryThresholdDTO
    ): Promise<ApiResponse<InventorySnapshot>> {
        return await this.call<InventorySnapshot, UpdateInventoryThresholdDTO>(
            'PATCH',
            `/products/${productId}/variants/${productVariantId}/supply-inventory/threshold`,
            data,
            { invalidatePattern: 'inventory:.*' }
        )
    }
}

export default InventoryApiService
