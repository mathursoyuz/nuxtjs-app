import HttpFactory from '@/repository/factory'
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
import type {
    Customer,
    CustomerShippingAddress,
    CustomerShippingAddressDTO,
    PaginatedCustomersResponse,
} from './customer.api'
import type { CreateCustomerCreditCardDTO, CustomerCreditCard } from './customer-credit-card.api'
import type { Location } from '~/types/location.types'
import type { OrganisationProduct } from '~/types/organisation-product.types'

export interface CustomerOrderCatalog {
    locations: Location[]
    products: OrganisationProduct[]
}

export class OrderApiService extends HttpFactory {
    async searchCustomerOrderCustomers(params: {
        organisationId?: number
        page?: number
        limit?: number
        search?: string
    }): Promise<ApiResponse<PaginatedCustomersResponse>> {
        return await this.call<PaginatedCustomersResponse>(
            'GET',
            '/customer-order-context/customers',
            undefined,
            { config: { params }, skipCache: true }
        )
    }

    async getCustomerOrderCustomer(customerId: number): Promise<ApiResponse<Customer>> {
        return await this.call<Customer>(
            'GET',
            `/customer-order-context/customers/${customerId}`,
            undefined,
            { skipCache: true }
        )
    }

    async getCustomerOrderCards(customerId: number): Promise<ApiResponse<CustomerCreditCard[]>> {
        return await this.call<CustomerCreditCard[]>(
            'GET',
            `/customer-order-context/customers/${customerId}/cards`,
            undefined,
            { skipCache: true }
        )
    }

    async createCustomerOrderCard(
        customerId: number,
        data: CreateCustomerCreditCardDTO
    ): Promise<ApiResponse<CustomerCreditCard>> {
        return await this.call<CustomerCreditCard, CreateCustomerCreditCardDTO>(
            'POST',
            `/customer-order-context/customers/${customerId}/cards`,
            data
        )
    }

    async addCustomerOrderShippingAddress(
        customerId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        return await this.call<CustomerShippingAddress, CustomerShippingAddressDTO>(
            'POST',
            `/customer-order-context/customers/${customerId}/shipping`,
            data
        )
    }

    async updateCustomerOrderShippingAddress(
        customerId: number,
        shippingId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        return await this.call<CustomerShippingAddress, CustomerShippingAddressDTO>(
            'PUT',
            `/customer-order-context/customers/${customerId}/shipping/${shippingId}`,
            data
        )
    }

    async deleteCustomerOrderShippingAddress(
        customerId: number,
        shippingId: number
    ): Promise<ApiResponse<null>> {
        return await this.call<null>(
            'DELETE',
            `/customer-order-context/customers/${customerId}/shipping/${shippingId}`
        )
    }

    async getCustomerOrderCatalog(
        organisationId: number
    ): Promise<ApiResponse<CustomerOrderCatalog>> {
        return await this.call<CustomerOrderCatalog>(
            'GET',
            `/customer-order-context/organisations/${organisationId}/catalog`,
            undefined,
            { skipCache: true }
        )
    }

    async getPendingCustomerOrderCustomer(orderId: number): Promise<ApiResponse<Customer>> {
        return await this.call<Customer>(
            'GET',
            `/customer-order-context/orders/${orderId}/customer`,
            undefined,
            { skipCache: true }
        )
    }

    async getPendingCustomerOrderCards(
        orderId: number
    ): Promise<ApiResponse<CustomerCreditCard[]>> {
        return await this.call<CustomerCreditCard[]>(
            'GET',
            `/customer-order-context/orders/${orderId}/cards`,
            undefined,
            { skipCache: true }
        )
    }

    async createPendingCustomerOrderCard(
        orderId: number,
        data: CreateCustomerCreditCardDTO
    ): Promise<ApiResponse<CustomerCreditCard>> {
        return await this.call<CustomerCreditCard, CreateCustomerCreditCardDTO>(
            'POST',
            `/customer-order-context/orders/${orderId}/cards`,
            data
        )
    }

    async addPendingCustomerOrderShippingAddress(
        orderId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        return await this.call<CustomerShippingAddress, CustomerShippingAddressDTO>(
            'POST',
            `/customer-order-context/orders/${orderId}/shipping`,
            data
        )
    }

    async updatePendingCustomerOrderShippingAddress(
        orderId: number,
        shippingId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        return await this.call<CustomerShippingAddress, CustomerShippingAddressDTO>(
            'PUT',
            `/customer-order-context/orders/${orderId}/shipping/${shippingId}`,
            data
        )
    }

    async deletePendingCustomerOrderShippingAddress(
        orderId: number,
        shippingId: number
    ): Promise<ApiResponse<null>> {
        return await this.call<null>(
            'DELETE',
            `/customer-order-context/orders/${orderId}/shipping/${shippingId}`
        )
    }

    async getPendingCustomerOrderCatalog(
        orderId: number
    ): Promise<ApiResponse<CustomerOrderCatalog>> {
        return await this.call<CustomerOrderCatalog>(
            'GET',
            `/customer-order-context/orders/${orderId}/catalog`,
            undefined,
            { skipCache: true }
        )
    }

    async getProcurementOrders(params?: {
        organisationId?: number
        status?: string
        cursor?: number
        limit?: number
    }): Promise<ApiResponse<ProcurementOrderPage>> {
        return await this.call<ProcurementOrderPage>('GET', '/procurement-orders', undefined, {
            config: { params },
            cacheKey: `orders:procurement:${JSON.stringify(params ?? {})}`,
            ttl: 60 * 1000,
        })
    }

    async getProcurementOrder(orderId: number): Promise<ApiResponse<ProcurementOrder>> {
        return await this.call<ProcurementOrder>(
            'GET',
            `/procurement-orders/${orderId}`,
            undefined,
            { cacheKey: `orders:procurement:${orderId}`, ttl: 60 * 1000 }
        )
    }

    async chargeProcurementOrder(
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<ProcurementOrder>> {
        return await this.call<ProcurementOrder, ChargeOrderDTO>(
            'POST',
            `/procurement-orders/${orderId}/charge`,
            data,
            { invalidatePattern: 'orders:.*' }
        )
    }

    async getCustomerOrders(params?: {
        organisationId?: number
        customerId?: number
        status?: string
        cursor?: number
        limit?: number
    }): Promise<ApiResponse<CustomerOrderPage>> {
        return await this.call<CustomerOrderPage>('GET', '/customer-orders', undefined, {
            config: { params },
            cacheKey: `orders:customers:${JSON.stringify(params ?? {})}`,
            ttl: 60 * 1000,
            skipCache: true,
        })
    }

    async createCustomerOrder(
        organisationId: number,
        data: CreateCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder, CreateCustomerOrderDTO>(
            'POST',
            `/organisations/${organisationId}/orders`,
            data,
            { invalidatePattern: '(orders|organisation-products):.*' }
        )
    }

    async getCustomerOrder(orderId: number): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder>('GET', `/customer-orders/${orderId}`, undefined, {
            cacheKey: `orders:customers:${orderId}`,
            ttl: 60 * 1000,
            skipCache: true,
        })
    }

    async updatePendingCustomerOrder(
        orderId: number,
        data: UpdatePendingCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder, UpdatePendingCustomerOrderDTO>(
            'PATCH',
            `/customer-orders/${orderId}`,
            data,
            { invalidatePattern: '(orders|organisation-products):.*' }
        )
    }

    async chargeCustomerOrder(
        orderId: number,
        data: ChargeOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder, ChargeOrderDTO>(
            'POST',
            `/customer-orders/${orderId}/charge`,
            data,
            { invalidatePattern: '(orders|organisation-products):.*' }
        )
    }

    async cancelCustomerOrder(orderId: number): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder, Record<string, never>>(
            'POST',
            `/customer-orders/${orderId}/cancel`,
            {},
            { invalidatePattern: '(orders|organisation-products):.*' }
        )
    }

    async completeCustomerOrder(orderId: number): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder, Record<string, never>>(
            'POST',
            `/customer-orders/${orderId}/complete`,
            {},
            { invalidatePattern: '(orders|organisation-products):.*' }
        )
    }

    async refundCustomerOrder(
        orderId: number,
        data: RefundCustomerOrderDTO
    ): Promise<ApiResponse<CustomerSaleOrder>> {
        return await this.call<CustomerSaleOrder, RefundCustomerOrderDTO>(
            'POST',
            `/customer-orders/${orderId}/refund`,
            data,
            { invalidatePattern: '(orders|organisation-products):.*' }
        )
    }
}

export default OrderApiService
