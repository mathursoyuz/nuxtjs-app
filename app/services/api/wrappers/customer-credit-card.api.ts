import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type { AddressDetails, PaymentCardDetails } from '~/types/payment-details.types'

export interface CustomerCreditCard {
    id: number
    customerId: number
    lastFour: string
    expMonth: string
    expYear: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateCustomerCreditCardDTO extends AddressDetails, PaymentCardDetails {
    isActive?: boolean
}

/**
 * Customer Credit Card API wrapper service
 */
export class CustomerCreditCardApiService extends HttpFactory {
    async getAllCustomerCreditCards(
        customerId: number
    ): Promise<ApiResponse<CustomerCreditCard[]>> {
        return await this.call<CustomerCreditCard[]>(
            'GET',
            `/customers/${customerId}/credit-card`,
            undefined,
            {
                cacheKey: `customer-cc:customer:${customerId}`,
                ttl: 5 * 60 * 1000,
            }
        )
    }

    async createCustomerCreditCard(
        customerId: number,
        data: CreateCustomerCreditCardDTO
    ): Promise<ApiResponse<CustomerCreditCard>> {
        const response = await this.call<CustomerCreditCard, CreateCustomerCreditCardDTO>(
            'POST',
            `/customers/${customerId}/credit-card`,
            data,
            { invalidatePattern: `customer-cc:customer:${customerId}.*` }
        )
        this.invalidateCachePattern(`customer-cc:customer:${customerId}.*`)
        this.invalidateCacheKey(`customer-cc:customer:${customerId}`)
        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async toggleActive(
        customerId: number,
        cardId: number,
        isActive: boolean
    ): Promise<ApiResponse<CustomerCreditCard>> {
        const response = await this.call<CustomerCreditCard, { isActive: boolean }>(
            'PATCH',
            `/customers/${customerId}/credit-card/${cardId}`,
            { isActive },
            { invalidatePattern: `customer-cc:customer:${customerId}.*` }
        )
        this.invalidateCacheKey(`customer-cc:${cardId}`)
        this.invalidateCachePattern(`customer-cc:customer:${customerId}.*`)
        this.invalidateCacheKey(`customer-cc:customer:${customerId}`)
        return response
    }

    async refreshCustomerCreditCards(
        customerId: number
    ): Promise<ApiResponse<CustomerCreditCard[]>> {
        return await this.call<CustomerCreditCard[]>(
            'GET',
            `/customers/${customerId}/credit-card`,
            undefined,
            {
                cacheKey: `customer-cc:customer:${customerId}`,
                skipCache: true,
            }
        )
    }
}

export default CustomerCreditCardApiService
