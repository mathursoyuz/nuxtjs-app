import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'

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

export interface CreateCustomerCreditCardDTO {
    firstName: string
    lastName: string
    company?: string
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
    phoneNumber?: string
    cardNumber: string
    expMonth: string
    expYear: string
    cvc: string
    isActive?: boolean
}

/**
 * Customer Credit Card API wrapper service
 */
export class CustomerCreditCardApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllCustomerCreditCards(
        customerId: number
    ): Promise<ApiResponse<CustomerCreditCard[]>> {
        return this.cachedApi.get<CustomerCreditCard[]>(
            `/customers/${customerId}/credit-card`,
            undefined,
            `customer-cc:customer:${customerId}`,
            5 * 60 * 1000
        )
    }

    async createCustomerCreditCard(
        customerId: number,
        data: CreateCustomerCreditCardDTO
    ): Promise<ApiResponse<CustomerCreditCard>> {
        const response = await this.cachedApi.post<CustomerCreditCard>(
            `/customers/${customerId}/credit-card`,
            data,
            undefined,
            `customer-cc:customer:${customerId}.*`
        )
        this.cachedApi.invalidatePattern(`customer-cc:customer:${customerId}.*`)
        this.cachedApi.invalidate(`customer-cc:customer:${customerId}`)
        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async toggleActive(
        customerId: number,
        cardId: number,
        isActive: boolean
    ): Promise<ApiResponse<CustomerCreditCard>> {
        const response = await this.cachedApi.patch<CustomerCreditCard>(
            `/customers/${customerId}/credit-card/${cardId}`,
            { isActive },
            undefined,
            `customer-cc:customer:${customerId}.*`
        )
        this.cachedApi.invalidate(`customer-cc:${cardId}`)
        this.cachedApi.invalidatePattern(`customer-cc:customer:${customerId}.*`)
        this.cachedApi.invalidate(`customer-cc:customer:${customerId}`)
        return response
    }

    async refreshCustomerCreditCards(
        customerId: number
    ): Promise<ApiResponse<CustomerCreditCard[]>> {
        return this.cachedApi.get<CustomerCreditCard[]>(
            `/customers/${customerId}/credit-card`,
            undefined,
            `customer-cc:customer:${customerId}`,
            undefined,
            true
        )
    }
}
