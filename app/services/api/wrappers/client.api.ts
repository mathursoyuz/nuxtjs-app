import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'

export interface Client {
    id: number
    name: string
    email: string
    password: string
    websiteUrl: string
    shippingCost: number
    referralCode: string | null
    description: string | null
    logo: string | null
    billingFirstName: string
    billingLastName: string
    billingCompany: string
    billingAddress: string
    billingCity: string
    billingStateCode: string
    billingPostalCode: string
    billingCountryCode: string
    billingPhone: string
    isActive: boolean
    squareAccessToken: string | null
    qbRealmId: string | null
    createdAt: string
    updatedAt: string
}

export interface ClientLookupOption {
    id: number
    name: string
}

export interface CreateClientDTO {
    name: string
    email: string
    password?: string | null
    websiteUrl: string
    shippingCost: number
    referralCode?: string | null
    description?: string | null
    logo?: string | null
    billingFirstName: string
    billingLastName: string
    billingCompany: string
    billingAddress: string
    billingCity: string
    billingStateCode: string
    billingPostalCode: string
    billingCountryCode: string
    billingPhone: string
    isActive: boolean
    squareAccessToken?: string | null
    qbRealmId?: string | null
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {}

/**
 * Client API wrapper service
 */
export class ClientApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllClients(): Promise<ApiResponse<Client[]>> {
        return this.cachedApi.get<Client[]>('/clients', undefined, 'clients:all', 5 * 60 * 1000)
    }

    async lookupClients(search = '', limit = 25): Promise<ApiResponse<ClientLookupOption[]>> {
        const normalizedSearch = search.trim()
        return this.cachedApi.get<ClientLookupOption[]>(
            '/clients/lookup',
            { params: { search: normalizedSearch, limit } },
            `clients:lookup:${normalizedSearch.toLowerCase()}:${limit}`,
            60 * 1000
        )
    }

    async getClientById(id: number): Promise<ApiResponse<Client>> {
        return this.cachedApi.get<Client>(
            `/clients/${id}`,
            undefined,
            `clients:${id}`,
            5 * 60 * 1000
        )
    }

    async createClient(data: CreateClientDTO): Promise<ApiResponse<Client>> {
        const response = await this.cachedApi.post<Client>(
            '/clients',
            data,
            undefined,
            'clients:.*'
        )
        return response
    }

    async updateClient(id: number, data: UpdateClientDTO): Promise<ApiResponse<Client>> {
        const response = await this.cachedApi.put<Client>(
            `/clients/${id}`,
            data,
            undefined,
            'clients:.*'
        )
        this.cachedApi.invalidate(`clients:${id}`)
        return response
    }

    async uploadClientLogo(id: number, file: File): Promise<ApiResponse<{ message: string }>> {
        const formData = new FormData()
        formData.append('uploadImage', file)

        const response = await this.cachedApi.patch<{ message: string }>(
            `/clients/${id}/uploadImage`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
            'clients:.*'
        )

        this.cachedApi.invalidate(`clients:${id}`)
        return response
    }

    async toggleActive(id: number, isActive: boolean): Promise<ApiResponse<Client>> {
        const response = await this.cachedApi.patch<Client>(
            `/clients/${id}`,
            { isActive },
            undefined,
            'clients:.*'
        )
        this.cachedApi.invalidate(`clients:${id}`)
        return response
    }

    async refreshClients(): Promise<ApiResponse<Client[]>> {
        return this.cachedApi.get<Client[]>('/clients', undefined, 'clients:all', undefined, true)
    }

    async checkEmailExists(
        email: string,
        clientId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return this.cachedApi.post<{ available: boolean }>('/clients/check-email', {
            email,
            clientId,
        })
    }

    async deleteClient(id: number): Promise<ApiResponse<{ message: string }>> {
        const response = await this.cachedApi.delete<{ message: string }>(
            `/clients/${id}`,
            undefined,
            'clients:.*'
        )
        this.cachedApi.invalidate(`clients:${id}`)
        this.cachedApi.invalidate('clients:all')
        return response
    }
}
