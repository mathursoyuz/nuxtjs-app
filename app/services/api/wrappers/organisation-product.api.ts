import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type {
    OrganisationProduct,
    CreateOrganisationProductDTO,
    UpdateOrganisationProductDTO,
} from '~/types/organisation-product.types'
import type {
    ChargeOrderDTO,
    CreateProcurementOrderDTO,
    ProcurementCatalog,
    ProcurementOrder,
    ProcurementOrderPage,
} from '~/types/order.types'

export interface OrganisationProductOverview {
    items: Array<OrganisationProduct & { organisationName: string }>
    total: number
    page: number
    limit: number
}

export class OrganisationProductApiService extends HttpFactory {
    async getOverview(
        page: number = 1,
        organisationId?: number
    ): Promise<ApiResponse<OrganisationProductOverview>> {
        return await this.call<OrganisationProductOverview>(
            'GET',
            '/organisation-products',
            undefined,
            {
                config: { params: { page, ...(organisationId ? { organisationId } : {}) } },
                skipCache: true,
            }
        )
    }

    async getAllOrganisationProducts(
        organisationId: number,
        forceRefresh: boolean = false
    ): Promise<ApiResponse<OrganisationProduct[]>> {
        return await this.call<OrganisationProduct[]>(
            'GET',
            `/organisations/${organisationId}/organisation-products`,
            undefined,
            {
                cacheKey: `organisation-products:organisation:${organisationId}`,
                ttl: 5 * 60 * 1000,
                skipCache: forceRefresh,
            }
        )
    }

    async getOrganisationProductById(organisationId: number, id: number): Promise<ApiResponse<OrganisationProduct>> {
        return await this.call<OrganisationProduct>(
            'GET',
            `/organisations/${organisationId}/organisation-products/${id}`,
            undefined,
            {
                cacheKey: `organisation-products:${organisationId}:${id}`,
                ttl: 5 * 60 * 1000,
            }
        )
    }

    async createOrganisationProduct(
        organisationId: number,
        data: CreateOrganisationProductDTO
    ): Promise<ApiResponse<OrganisationProduct>> {
        return await this.call<OrganisationProduct, CreateOrganisationProductDTO>(
            'POST',
            `/organisations/${organisationId}/organisation-products`,
            data,
            { invalidatePattern: 'organisation-products:.*' }
        )
    }

    async updateOrganisationProduct(
        organisationId: number,
        id: number,
        data: UpdateOrganisationProductDTO
    ): Promise<ApiResponse<OrganisationProduct>> {
        return await this.call<OrganisationProduct, UpdateOrganisationProductDTO>(
            'PUT',
            `/organisations/${organisationId}/organisation-products/${id}`,
            data,
            { invalidatePattern: 'organisation-products:.*' }
        )
    }

    async deleteOrganisationProduct(organisationId: number, id: number): Promise<ApiResponse<void>> {
        return await this.call<void>(
            'DELETE',
            `/organisations/${organisationId}/organisation-products/${id}`,
            undefined,
            { invalidatePattern: 'organisation-products:.*' }
        )
    }

    async toggleOrganisationProduct(
        organisationId: number,
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<{ id: number; isActive: boolean }>> {
        return await this.call<
            { id: number; isActive: boolean },
            { isActive: boolean }
        >(
            'PATCH',
            `/organisations/${organisationId}/organisation-products/${id}`,
            { isActive },
            { invalidatePattern: 'organisation-products:.*' }
        )
    }

    async createProcurementOrder(
        organisationId: number,
        data: CreateProcurementOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return await this.call<ProcurementOrder, CreateProcurementOrderDTO>(
            'POST',
            `/organisations/${organisationId}/procurement-orders`,
            data,
            { invalidatePattern: '(organisation-products|procurement-orders|orders):.*' }
        )
    }

    async getProcurementCatalog(organisationId: number): Promise<ApiResponse<ProcurementCatalog>> {
        return await this.call<ProcurementCatalog>(
            'GET',
            `/organisations/${organisationId}/procurement-orders/catalog`,
            undefined,
            {
                cacheKey: `procurement-catalog:organisation:${organisationId}`,
                skipCache: true,
            }
        )
    }

    async getProcurementOrders(
        organisationId: number,
        status?: string,
        forceRefresh: boolean = false
    ): Promise<ApiResponse<ProcurementOrderPage>> {
        return await this.call<ProcurementOrderPage>(
            'GET',
            `/organisations/${organisationId}/procurement-orders`,
            undefined,
            {
                config: { params: status ? { status } : undefined },
                cacheKey: `procurement-orders:organisation:${organisationId}:${status ?? 'all'}`,
                ttl: 60 * 1000,
                skipCache: forceRefresh,
            }
        )
    }

    async chargeProcurementOrder(
        organisationId: number,
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return await this.call<ProcurementOrder, ChargeOrderDTO>(
            'POST',
            `/organisations/${organisationId}/procurement-orders/${orderId}/charge`,
            data,
            { invalidatePattern: '(organisation-products|procurement-orders|orders):.*' }
        )
    }

    async uploadOrganisationProductImages(
        organisationId: number,
        id: number,
        formData: FormData
    ): Promise<ApiResponse<{ message: string }>> {
        return await this.call<{ message: string }, FormData>(
            'PATCH',
            `/organisations/${organisationId}/organisation-products/${id}/uploadImages`,
            formData,
            {
                config: { headers: { 'Content-Type': 'multipart/form-data' } },
                invalidatePattern: 'organisation-products:.*',
            }
        )
    }

    async getOrganisationProductGallery(organisationId: number, id: number): Promise<ApiResponse<string[]>> {
        return await this.call<string[]>(
            'GET',
            `/organisations/${organisationId}/organisation-products/${id}/gallery`,
            undefined,
            {
                cacheKey: `organisation-products:${organisationId}:${id}:gallery`,
                ttl: 5 * 60 * 1000,
            }
        )
    }

    async deleteOrganisationProductGalleryImage(
        organisationId: number,
        id: number,
        filename: string
    ): Promise<ApiResponse<{ message: string }>> {
        return await this.call<{ message: string }>(
            'DELETE',
            `/organisations/${organisationId}/organisation-products/${id}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            { invalidatePattern: 'organisation-products:.*' }
        )
    }
}

export default OrganisationProductApiService
