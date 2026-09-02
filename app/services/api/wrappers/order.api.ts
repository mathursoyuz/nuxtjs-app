import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    ChargeOrderDTO,
    CreateCustomerOrderDTO,
    CustomerOrderPage,
    CustomerSaleOrder,
    ProcurementOrder,
    ProcurementOrderPage,
} from '~/types/order.types'

export class OrderApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getProcurementOrders(params?: {
        clientId?: number
        status?: string
        cursor?: number
        limit?: number
    }): Promise<ApiResponse<ProcurementOrderPage>> {
        return this.cachedApi.get<ProcurementOrderPage>(
            '/procurement-orders',
            { params },
            `orders:procurement:${JSON.stringify(params ?? {})}`,
            60 * 1000
        )
    }

    async getProcurementOrder(orderId: number): Promise<ApiResponse<ProcurementOrder>> {
        return this.cachedApi.get<ProcurementOrder>(
            `/procurement-orders/${orderId}`,
            undefined,
            `orders:procurement:${orderId}`,
            60 * 1000
        )
    }

    async chargeProcurementOrder(
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return this.cachedApi.post<ProcurementOrder>(
            `/procurement-orders/${orderId}/charge`,
            data,
            undefined,
            'orders:.*'
        )
    }

    async getCustomerOrders(params?: {
        clientId?: number
        status?: string
        cursor?: number
        limit?: number
    }): Promise<ApiResponse<CustomerOrderPage>> {
        return this.cachedApi.get<CustomerOrderPage>(
            '/customer-orders',
            { params },
            `orders:customers:${JSON.stringify(params ?? {})}`,
            60 * 1000
        )
    }

    async createCustomerOrder(
        clientId: number,
        data: CreateCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.post<CustomerSaleOrder>(
            `/clients/${clientId}/orders`,
            data,
            undefined,
            '(orders|client-products):.*'
        )
    }

    async chargeCustomerOrder(
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.post<CustomerSaleOrder>(
            `/customer-orders/${orderId}/charge`,
            data,
            undefined,
            '(orders|client-products):.*'
        )
    }
}
