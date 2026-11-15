import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type { Location } from '~/types/location.types'

export interface BillingAddress {
    billingEmail: string
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

export interface CustomerImportResult {
    created: number
    updated: number
    skipped: number
    errors: Array<{ item: string; error: string }>
}

/**
 * Customer API wrapper service
 */
export class CustomerApiService extends HttpFactory {
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
        return await this.call<PaginatedCustomersResponse>('GET', '/customers', undefined, {
            config: { params },
            cacheKey,
            ttl: 5 * 60 * 1000,
        })
    }

    async getCustomerById(customerId: number): Promise<ApiResponse<Customer>> {
        return await this.call<Customer>('GET', `/customers/${customerId}`, undefined, {
            cacheKey: `customers:${customerId}`,
            ttl: 5 * 60 * 1000,
        })
    }

    async createCustomer(data: CreateCustomerDTO): Promise<ApiResponse<Customer>> {
        const response = await this.call<Customer, CreateCustomerDTO>('POST', '/customers', data, {
            invalidatePattern: `customers:organisation:${data.organisationId}.*`,
        })
        this.invalidateCachePattern(`customers:organisation:${data.organisationId}.*`)
        this.invalidateCachePattern('customers:all.*')
        return response
    }

    async updateCustomer(
        customerId: number,
        data: UpdateCustomerDTO
    ): Promise<ApiResponse<Customer>> {
        const response = await this.call<Customer, UpdateCustomerDTO>(
            'PUT',
            `/customers/${customerId}`,
            data,
            { invalidatePattern: `customers:organisation:${data.organisationId}.*` }
        )
        this.invalidateCacheKey(`customers:${customerId}`)
        if (data.organisationId) {
            this.invalidateCachePattern(`customers:organisation:${data.organisationId}.*`)
        }
        this.invalidateCachePattern('customers:all.*')
        return response
    }

    async addShippingAddress(
        customerId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        const response = await this.call<CustomerShippingAddress, CustomerShippingAddressDTO>(
            'POST',
            `/customers/${customerId}/shipping`,
            data,
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async updateShippingAddress(
        customerId: number,
        shippingId: number,
        data: CustomerShippingAddressDTO
    ): Promise<ApiResponse<CustomerShippingAddress>> {
        const response = await this.call<CustomerShippingAddress, CustomerShippingAddressDTO>(
            'PUT',
            `/customers/${customerId}/shipping/${shippingId}`,
            data,
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async deleteShippingAddress(
        customerId: number,
        shippingId: number
    ): Promise<ApiResponse<{ message: string }>> {
        const response = await this.call<{ message: string }>(
            'DELETE',
            `/customers/${customerId}/shipping/${shippingId}`,
            undefined,
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async uploadCustomerImage(
        customerId: number,
        file: File
    ): Promise<ApiResponse<{ message: string }>> {
        const formData = new FormData()
        formData.append('uploadImage', file)

        const response = await this.call<{ message: string }, FormData>(
            'PATCH',
            `/customers/${customerId}/uploadImage`,
            formData,
            {
                config: {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
                invalidatePattern: 'customers:.*',
            }
        )

        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async stageCustomerAvatar(
        organisationId: number,
        file: File
    ): Promise<ApiResponse<{ token: string }>> {
        const formData = new FormData()
        formData.append('uploadImage', file)
        return await this.call<{ token: string }, FormData>(
            'POST',
            `/organisations/${organisationId}/customers/avatar-staging`,
            formData,
            { config: { headers: { 'Content-Type': 'multipart/form-data' } } }
        )
    }

    async getCustomerCreateFormData(
        organisationId: number
    ): Promise<ApiResponse<{ locations: Location[] }>> {
        return await this.call<{ locations: Location[] }>(
            'GET',
            `/organisations/${organisationId}/customer-create-context`,
            undefined,
            { skipCache: true }
        )
    }

    async checkCustomerCreateEmail(
        organisationId: number,
        email: string
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.call<{ available: boolean }, { email: string }>(
            'POST',
            `/organisations/${organisationId}/customer-create-context/check-email`,
            { email }
        )
    }

    async toggleActive(customerId: number, isActive: boolean): Promise<ApiResponse<Customer>> {
        const response = await this.call<Customer, { isActive: boolean }>(
            'PATCH',
            `/customers/${customerId}`,
            { isActive },
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
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
        return await this.call<PaginatedCustomersResponse>('GET', '/customers', undefined, {
            config: { params },
            cacheKey,
            skipCache: true,
        })
    }

    async syncCustomerToQB(
        customerId: number
    ): Promise<ApiResponse<{ created: boolean; qbId: string }>> {
        const response = await this.call<{ created: boolean; qbId: string }, Record<string, never>>(
            'POST',
            `/quickbooks-sync/customers/${customerId}/sync-to-qb`,
            {},
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async importCustomersFromQB(): Promise<ApiResponse<CustomerImportResult>> {
        const response = await this.call<CustomerImportResult, Record<string, never>>(
            'POST',
            '/quickbooks-sync/customers/import',
            {},
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async importCustomersFromSquare(): Promise<ApiResponse<CustomerImportResult>> {
        const response = await this.call<CustomerImportResult, Record<string, never>>(
            'POST',
            '/square-sync/customers',
            {},
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async syncCustomerToSquare(
        customerId: number
    ): Promise<ApiResponse<{ created: boolean; squareId: string }>> {
        const response = await this.call<
            { created: boolean; squareId: string },
            Record<string, never>
        >(
            'POST',
            `/square-sync/customers/${customerId}/sync-to-square`,
            {},
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCachePattern('customers:.*')
        return response
    }

    async checkEmailExists(
        email: string,
        customerId?: number,
        organisationId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        const data = {
            email,
            ...(customerId === undefined ? {} : { customerId }),
            ...(organisationId === undefined ? {} : { organisationId }),
        }
        return await this.call<{ available: boolean }, typeof data>(
            'POST',
            '/customers/check-email',
            data
        )
    }

    async deleteCustomer(customerId: number): Promise<ApiResponse<{ message: string }>> {
        const response = await this.call<{ message: string }>(
            'DELETE',
            `/customers/${customerId}`,
            undefined,
            { invalidatePattern: 'customers:.*' }
        )
        this.invalidateCacheKey(`customers:${customerId}`)
        this.invalidateCachePattern('customers:.*')
        return response
    }
}

export default CustomerApiService
