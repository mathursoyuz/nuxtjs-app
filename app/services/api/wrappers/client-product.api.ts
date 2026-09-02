import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    ClientProduct,
    CreateClientProductDTO,
    UpdateClientProductDTO,
} from '~/types/client-product.types'
import type {
    ChargeOrderDTO,
    CreateProcurementOrderDTO,
    ProcurementCatalog,
    ProcurementOrder,
    ProcurementOrderPage,
} from '~/types/order.types'

export class ClientProductApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllClientProducts(clientId: number): Promise<ApiResponse<ClientProduct[]>> {
        return this.cachedApi.get<ClientProduct[]>(
            `/clients/${clientId}/client-products`,
            undefined,
            `client-products:client:${clientId}`,
            5 * 60 * 1000
        )
    }

    async getClientProductById(clientId: number, id: number): Promise<ApiResponse<ClientProduct>> {
        return this.cachedApi.get<ClientProduct>(
            `/clients/${clientId}/client-products/${id}`,
            undefined,
            `client-products:${clientId}:${id}`,
            5 * 60 * 1000
        )
    }

    async createClientProduct(
        clientId: number,
        data: CreateClientProductDTO
    ): Promise<ApiResponse<ClientProduct>> {
        return this.cachedApi.post<ClientProduct>(
            `/clients/${clientId}/client-products`,
            data,
            undefined,
            'client-products:.*'
        )
    }

    async updateClientProduct(
        clientId: number,
        id: number,
        data: UpdateClientProductDTO
    ): Promise<ApiResponse<ClientProduct>> {
        return this.cachedApi.put<ClientProduct>(
            `/clients/${clientId}/client-products/${id}`,
            data,
            undefined,
            'client-products:.*'
        )
    }

    async deleteClientProduct(clientId: number, id: number): Promise<ApiResponse<void>> {
        return this.cachedApi.delete<void>(
            `/clients/${clientId}/client-products/${id}`,
            undefined,
            'client-products:.*'
        )
    }

    async createProcurementOrder(
        clientId: number,
        data: CreateProcurementOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return this.cachedApi.post<ProcurementOrder>(
            `/clients/${clientId}/procurement-orders`,
            data,
            undefined,
            '(client-products|procurement-orders|orders):.*'
        )
    }

    async getProcurementCatalog(clientId: number): Promise<ApiResponse<ProcurementCatalog>> {
        return this.cachedApi.get<ProcurementCatalog>(
            `/clients/${clientId}/procurement-orders/catalog`,
            undefined,
            `procurement-catalog:client:${clientId}`,
            undefined,
            true
        )
    }

    async getProcurementOrders(
        clientId: number,
        status?: string,
        forceRefresh = false
    ): Promise<ApiResponse<ProcurementOrderPage>> {
        return this.cachedApi.get<ProcurementOrderPage>(
            `/clients/${clientId}/procurement-orders`,
            { params: status ? { status } : undefined },
            `procurement-orders:client:${clientId}:${status ?? 'all'}`,
            60 * 1000,
            forceRefresh
        )
    }

    async chargeProcurementOrder(
        clientId: number,
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return this.cachedApi.post<ProcurementOrder>(
            `/clients/${clientId}/procurement-orders/${orderId}/charge`,
            data,
            undefined,
            '(client-products|procurement-orders|orders):.*'
        )
    }

    async uploadClientProductImages(
        clientId: number,
        id: number,
        formData: FormData
    ): Promise<ApiResponse<{ message: string }>> {
        return this.cachedApi.patch<{ message: string }>(
            `/clients/${clientId}/client-products/${id}/uploadImages`,
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } },
            'client-products:.*'
        )
    }

    async getClientProductGallery(clientId: number, id: number): Promise<ApiResponse<string[]>> {
        return this.cachedApi.get<string[]>(
            `/clients/${clientId}/client-products/${id}/gallery`,
            undefined,
            `client-products:${clientId}:${id}:gallery`,
            5 * 60 * 1000
        )
    }

    async deleteClientProductGalleryImage(
        clientId: number,
        id: number,
        filename: string
    ): Promise<ApiResponse<{ message: string }>> {
        return this.cachedApi.delete<{ message: string }>(
            `/clients/${clientId}/client-products/${id}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            'client-products:.*'
        )
    }
}
