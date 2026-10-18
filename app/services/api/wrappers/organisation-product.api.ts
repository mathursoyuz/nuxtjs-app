import type { CachedApiClient } from '../CachedApiClient'
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

export class OrganisationProductApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getOverview(page = 1, organisationId?: number) {
        return this.cachedApi.get<{
            items: (OrganisationProduct & { organisationName: string })[]
            total: number
            page: number
            limit: number
        }>(
            '/organisation-products',
            { params: { page, ...(organisationId ? { organisationId } : {}) } },
            undefined,
            undefined,
            true
        )
    }

    async getAllOrganisationProducts(
        organisationId: number,
        forceRefresh = false
    ): Promise<ApiResponse<OrganisationProduct[]>> {
        return this.cachedApi.get<OrganisationProduct[]>(
            `/organisations/${organisationId}/organisation-products`,
            undefined,
            `organisation-products:organisation:${organisationId}`,
            5 * 60 * 1000,
            forceRefresh
        )
    }

    async getOrganisationProductById(organisationId: number, id: number): Promise<ApiResponse<OrganisationProduct>> {
        return this.cachedApi.get<OrganisationProduct>(
            `/organisations/${organisationId}/organisation-products/${id}`,
            undefined,
            `organisation-products:${organisationId}:${id}`,
            5 * 60 * 1000
        )
    }

    async createOrganisationProduct(
        organisationId: number,
        data: CreateOrganisationProductDTO
    ): Promise<ApiResponse<OrganisationProduct>> {
        return this.cachedApi.post<OrganisationProduct>(
            `/organisations/${organisationId}/organisation-products`,
            data,
            undefined,
            'organisation-products:.*'
        )
    }

    async updateOrganisationProduct(
        organisationId: number,
        id: number,
        data: UpdateOrganisationProductDTO
    ): Promise<ApiResponse<OrganisationProduct>> {
        return this.cachedApi.put<OrganisationProduct>(
            `/organisations/${organisationId}/organisation-products/${id}`,
            data,
            undefined,
            'organisation-products:.*'
        )
    }

    async deleteOrganisationProduct(organisationId: number, id: number): Promise<ApiResponse<void>> {
        return this.cachedApi.delete<void>(
            `/organisations/${organisationId}/organisation-products/${id}`,
            undefined,
            'organisation-products:.*'
        )
    }

    async toggleOrganisationProduct(
        organisationId: number,
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<{ id: number; isActive: boolean }>> {
        return this.cachedApi.patch<{ id: number; isActive: boolean }>(
            `/organisations/${organisationId}/organisation-products/${id}`,
            { isActive },
            undefined,
            'organisation-products:.*'
        )
    }

    async createProcurementOrder(
        organisationId: number,
        data: CreateProcurementOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return this.cachedApi.post<ProcurementOrder>(
            `/organisations/${organisationId}/procurement-orders`,
            data,
            undefined,
            '(organisation-products|procurement-orders|orders):.*'
        )
    }

    async getProcurementCatalog(organisationId: number): Promise<ApiResponse<ProcurementCatalog>> {
        return this.cachedApi.get<ProcurementCatalog>(
            `/organisations/${organisationId}/procurement-orders/catalog`,
            undefined,
            `procurement-catalog:organisation:${organisationId}`,
            undefined,
            true
        )
    }

    async getProcurementOrders(
        organisationId: number,
        status?: string,
        forceRefresh = false
    ): Promise<ApiResponse<ProcurementOrderPage>> {
        return this.cachedApi.get<ProcurementOrderPage>(
            `/organisations/${organisationId}/procurement-orders`,
            { params: status ? { status } : undefined },
            `procurement-orders:organisation:${organisationId}:${status ?? 'all'}`,
            60 * 1000,
            forceRefresh
        )
    }

    async chargeProcurementOrder(
        organisationId: number,
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return this.cachedApi.post<ProcurementOrder>(
            `/organisations/${organisationId}/procurement-orders/${orderId}/charge`,
            data,
            undefined,
            '(organisation-products|procurement-orders|orders):.*'
        )
    }

    async uploadOrganisationProductImages(
        organisationId: number,
        id: number,
        formData: FormData
    ): Promise<ApiResponse<{ message: string }>> {
        return this.cachedApi.patch<{ message: string }>(
            `/organisations/${organisationId}/organisation-products/${id}/uploadImages`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
            'organisation-products:.*'
        )
    }

    async getOrganisationProductGallery(organisationId: number, id: number): Promise<ApiResponse<string[]>> {
        return this.cachedApi.get<string[]>(
            `/organisations/${organisationId}/organisation-products/${id}/gallery`,
            undefined,
            `organisation-products:${organisationId}:${id}:gallery`,
            5 * 60 * 1000
        )
    }

    async deleteOrganisationProductGalleryImage(
        organisationId: number,
        id: number,
        filename: string
    ): Promise<ApiResponse<{ message: string }>> {
        return this.cachedApi.delete<{ message: string }>(
            `/organisations/${organisationId}/organisation-products/${id}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            'organisation-products:.*'
        )
    }
}
