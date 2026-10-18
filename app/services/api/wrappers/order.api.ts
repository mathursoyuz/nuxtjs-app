import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    ChargeOrderDTO,
    CreateCustomerOrderDTO,
    CustomerOrderPage,
    CustomerSaleOrder,
    ProcurementOrder,
    ProcurementOrderPage,
    RefundCustomerOrderDTO,
    UpdatePendingCustomerOrderDTO,
} from '~/types/order.types'

export class OrderApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getProcurementOrders(params?: {
        organisationId?: number
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
        organisationId?: number
        customerId?: number
        status?: string
        cursor?: number
        limit?: number
    }): Promise<ApiResponse<CustomerOrderPage>> {
        return this.cachedApi.get<CustomerOrderPage>(
            '/customer-orders',
            { params },
            `orders:customers:${JSON.stringify(params ?? {})}`,
            60 * 1000,
            true
        )
    }

    async createCustomerOrder(
        organisationId: number,
        data: CreateCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.post<CustomerSaleOrder>(
            `/organisations/${organisationId}/orders`,
            data,
            undefined,
            '(orders|organisation-products):.*'
        )
    }

    async getCustomerOrder(orderId: number): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.get<CustomerSaleOrder>(
            `/customer-orders/${orderId}`,
            undefined,
            `orders:customers:${orderId}`,
            60 * 1000,
            true
        )
    }

    async updatePendingCustomerOrder(
        orderId: number,
        data: UpdatePendingCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.patch<CustomerSaleOrder>(
            `/customer-orders/${orderId}`,
            data,
            undefined,
            '(orders|organisation-products):.*'
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
            '(orders|organisation-products):.*'
        )
    }

    async cancelCustomerOrder(orderId: number): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.post<CustomerSaleOrder>(
            `/customer-orders/${orderId}/cancel`,
            {},
            undefined,
            '(orders|organisation-products):.*'
        )
    }

    async completeCustomerOrder(orderId: number): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.post<CustomerSaleOrder>(
            `/customer-orders/${orderId}/complete`,
            {},
            undefined,
            '(orders|organisation-products):.*'
        )
    }

    async refundCustomerOrder(
        orderId: number,
        data: RefundCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return this.cachedApi.post<CustomerSaleOrder>(
            `/customer-orders/${orderId}/refund`,
            data,
            undefined,
            '(orders|organisation-products):.*'
        )
    }
}
