import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'

export interface BillingAddress {
    company: string | null
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
}

export interface ShippingAddress {
    firstName: string | null
    lastName: string | null
    company: string | null
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
}

export interface Customer {
    id: number
    organisationId: number
    email: string
    firstName: string
    lastName: string
    avatar: string | null
    phoneNumber: string
    pickupLocation: number
    signupLocation: number
    deliveryMethod: number
    cpi: string | null
    dob: string | null
    isAppUser: boolean
    isActive: boolean
    qbCustomerId?: string | null
    isQbSynced?: boolean
    qbSyncErrorReason?: string | null
    qbLastSyncedAt?: string | null
    squareCustomerId?: string | null
    isSquareSynced?: boolean
    squareSyncErrorReason?: string | null
    squareLastSyncedAt?: string | null
    createdAt: string
    updatedAt: string | null
    billing: BillingAddress
    shipping: ShippingAddress
    shippingAddresses?: CustomerShippingAddress[]
}

export interface CustomerShippingAddress {
    id: number
    customerId: number
    type: number
    firstName: string
    lastName: string
    company: string | null
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
    isActive: boolean
    createdAt: string
    updatedAt: string | null
}

export interface CreateCustomerDTO {
    organisationId: number
    firstName: string
    lastName: string
    email: string
    password: string
    avatar?: string | null
    phoneNumber: string
    pickupLocation: number
    signupLocation: number
    deliveryMethod: number
    cpi?: string
    dob?: string | null
    isAppUser?: boolean
    isActive: boolean
    billingCompany?: string | null
    billingAddress: string
    billingCity: string
    billingStateCode: string
    billingPostalCode: string
    billingCountryCode: string
    shippingFirstName: string
    shippingLastName: string
    shippingCompany?: string | null
    shippingAddress: string
    shippingCity: string
    shippingStateCode: string
    shippingPostalCode: string
    shippingCountryCode: string
    creditCard?: {
        cardNumber: string
        expMonth: string
        expYear: string
        isActive: boolean
        cvc: string
    } | null
}

export interface UpdateCustomerDTO extends Partial<CreateCustomerDTO> {
    password?: string
}

export interface CustomerShippingAddressDTO {
    type: number
    firstName: string
    lastName: string
    company?: string | null
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
    isActive: boolean
}

export interface PaginatedCustomersResponse {
    customers: Customer[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Customer API wrapper service
 */
export class CustomerApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllCustomers(
        organisationId: number | null | undefined,
        page: number = 1,
        limit: number = 25,
        search?: string
    ): Promise<ApiResponse<PaginatedCustomersResponse>> {
        const params: { page: number; limit: number; organisationId?: number; search?: string } = {
            page,
            limit,
        }
        if (organisationId) {
            params.organisationId = organisationId
        }
        if (search?.trim()) {
            params.search = search.trim()
        }
        const cacheKey = organisationId
            ? `customers:organisation:${organisationId}:page:${page}:limit:${limit}:search:${search ?? ''}`
            : `customers:all:page:${page}:limit:${limit}:search:${search ?? ''}`
        return this.cachedApi.get<PaginatedCustomersResponse>(
            `/customers`,
            { params },
            cacheKey,
            5 * 60 * 1000
        )
    }

    async getCustomerById(customerId: number): Promise<ApiResponse<Customer>> {
        return this.cachedApi.get<Customer>(
            `/customers/${customerId}`,
            undefined,
            `customers:${customerId}`,
            5 * 60 * 1000
        )
    }

    async createCustomer(data: CreateCustomerDTO): Promise<ApiResponse<Customer>> {
        const response = await this.cachedApi.post<Customer>(
            `/customers`,
            data,
            undefined,
            `customers:organisation:${data.organisationId}.*`
        )
        this.cachedApi.invalidatePattern(`customers:organisation:${data.organisationId}.*`)
        this.cachedApi.invalidatePattern('customers:all.*')
        return response
    }

    async updateCustomer(
        customerId: number,
        data: UpdateCustomerDTO
    ): Promise<ApiResponse<Customer>> {
        const response = await this.cachedApi.put<Customer>(
            `/customers/${customerId}`,
            data,
            undefined,
            `customers:organisation:${data.organisationId}.*`
        )
        this.cachedApi.invalidate(`customers:${customerId}`)
        if (data.organisationId) {
            this.cachedApi.invalidatePattern(`customers:organisation:${data.organisationId}.*`)
        }
        this.cachedApi.invalidatePattern('customers:all.*')
        return response
    }

    async addShippingAddress(
        customerId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        const response = await this.cachedApi.post<CustomerShippingAddress>(
            `/customers/${customerId}/shipping`,
            data,
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async updateShippingAddress(
        customerId: number,
        shippingId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        const response = await this.cachedApi.put<CustomerShippingAddress>(
            `/customers/${customerId}/shipping/${shippingId}`,
            data,
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async deleteShippingAddress(
        customerId: number,
        shippingId: number
    ): Promise<ApiResponse<{ message: string }>> {
        const response = await this.cachedApi.delete<{ message: string }>(
            `/customers/${customerId}/shipping/${shippingId}`,
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async uploadCustomerImage(
        customerId: number,
        file: File
    ): Promise<ApiResponse<{ message: string }>> {
        const formData = new FormData()
        formData.append('uploadImage', file)

        const response = await this.cachedApi.patch<{ message: string }>(
            `/customers/${customerId}/uploadImage`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
            `customers:.*`
        )

        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async toggleActive(customerId: number, isActive: boolean): Promise<ApiResponse<Customer>> {
        const response = await this.cachedApi.patch<Customer>(
            `/customers/${customerId}`,
            { isActive },
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async refreshCustomers(
        organisationId: number | null | undefined,
        page: number = 1,
        limit: number = 10
    ): Promise<ApiResponse<PaginatedCustomersResponse>> {
        const params: { page: number; limit: number; organisationId?: number } = { page, limit }
        if (organisationId) {
            params.organisationId = organisationId
        }
        const cacheKey = organisationId
            ? `customers:organisation:${organisationId}:page:${page}:limit:${limit}`
            : `customers:all:page:${page}:limit:${limit}`
        return this.cachedApi.get<PaginatedCustomersResponse>(
            `/customers`,
            { params },
            cacheKey,
            undefined,
            true
        )
    }

    async syncCustomerToQB(
        customerId: number
    ): Promise<ApiResponse<{ created: boolean; qbId: string }>> {
        const response = await this.cachedApi.post<{ created: boolean; qbId: string }>(
            `/quickbooks-sync/customers/${customerId}/sync-to-qb`,
            {},
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async importCustomersFromQB(): Promise<
        ApiResponse<{
            created: number
            updated: number
            skipped: number
            errors: Array<{ item: string; error: string }>
        }>
    > {
        const response = await this.cachedApi.post<{
            created: number
            updated: number
            skipped: number
            errors: Array<{ item: string; error: string }>
        }>(`/quickbooks-sync/customers/import`, {}, undefined, `customers:.*`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async importCustomersFromSquare(): Promise<
        ApiResponse<{
            created: number
            updated: number
            skipped: number
            errors: Array<{ item: string; error: string }>
        }>
    > {
        const response = await this.cachedApi.post<{
            created: number
            updated: number
            skipped: number
            errors: Array<{ item: string; error: string }>
        }>(`/square-sync/customers`, {}, undefined, `customers:.*`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async syncCustomerToSquare(
        customerId: number
    ): Promise<ApiResponse<{ created: boolean; squareId: string }>> {
        const response = await this.cachedApi.post<{ created: boolean; squareId: string }>(
            `/square-sync/customers/${customerId}/sync-to-square`,
            {},
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }

    async checkEmailExists(
        email: string,
        customerId?: number,
        organisationId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return this.cachedApi.post<{ available: boolean }>(
            `/customers/check-email`,
            {
                email,
                ...(customerId === undefined ? {} : { customerId }),
                ...(organisationId === undefined ? {} : { organisationId }),
            },
            undefined,
            undefined
        )
    }

    async deleteCustomer(customerId: number): Promise<ApiResponse<{ message: string }>> {
        const response = await this.cachedApi.delete<{ message: string }>(
            `/customers/${customerId}`,
            undefined,
            `customers:.*`
        )
        this.cachedApi.invalidate(`customers:${customerId}`)
        this.cachedApi.invalidatePattern('customers:.*')
        return response
    }
}
