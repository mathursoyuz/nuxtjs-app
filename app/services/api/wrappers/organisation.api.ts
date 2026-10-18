import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'

export interface Organisation {
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

export interface OrganisationLookupOption {
    id: number
    name: string
}

export interface CreateOrganisationDTO {
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

export interface UpdateOrganisationDTO extends Partial<CreateOrganisationDTO> {}

/**
 * Organisation API wrapper service
 */
export class OrganisationApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllOrganisations(): Promise<ApiResponse<Organisation[]>> {
        return this.cachedApi.get<Organisation[]>('/organisations', undefined, 'organisations:all', 5 * 60 * 1000)
    }

    async lookupOrganisations(search = '', limit = 25): Promise<ApiResponse<OrganisationLookupOption[]>> {
        const normalizedSearch = search.trim()
        return this.cachedApi.get<OrganisationLookupOption[]>(
            '/organisations/lookup',
            { params: { search: normalizedSearch, limit } },
            `organisations:lookup:${normalizedSearch.toLowerCase()}:${limit}`,
            60 * 1000
        )
    }

    async getOrganisationById(id: number): Promise<ApiResponse<Organisation>> {
        return this.cachedApi.get<Organisation>(
            `/organisations/${id}`,
            undefined,
            `organisations:${id}`,
            5 * 60 * 1000
        )
    }

    async createOrganisation(data: CreateOrganisationDTO): Promise<ApiResponse<Organisation>> {
        const response = await this.cachedApi.post<Organisation>(
            '/organisations',
            data,
            undefined,
            'organisations:.*'
        )
        return response
    }

    async updateOrganisation(id: number, data: UpdateOrganisationDTO): Promise<ApiResponse<Organisation>> {
        const response = await this.cachedApi.put<Organisation>(
            `/organisations/${id}`,
            data,
            undefined,
            'organisations:.*'
        )
        this.cachedApi.invalidate(`organisations:${id}`)
        return response
    }

    async uploadOrganisationLogo(id: number, file: File): Promise<ApiResponse<{ message: string }>> {
        const formData = new FormData()
        formData.append('uploadImage', file)

        const response = await this.cachedApi.patch<{ message: string }>(
            `/organisations/${id}/uploadImage`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
            'organisations:.*'
        )

        this.cachedApi.invalidate(`organisations:${id}`)
        return response
    }

    async toggleActive(id: number, isActive: boolean): Promise<ApiResponse<Organisation>> {
        const response = await this.cachedApi.patch<Organisation>(
            `/organisations/${id}`,
            { isActive },
            undefined,
            'organisations:.*'
        )
        this.cachedApi.invalidate(`organisations:${id}`)
        return response
    }

    async refreshOrganisations(): Promise<ApiResponse<Organisation[]>> {
        return this.cachedApi.get<Organisation[]>('/organisations', undefined, 'organisations:all', undefined, true)
    }

    async checkEmailExists(
        email: string,
        organisationId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return this.cachedApi.post<{ available: boolean }>('/organisations/check-email', {
            email,
            organisationId,
        })
    }

    async deleteOrganisation(id: number): Promise<ApiResponse<{ message: string }>> {
        const response = await this.cachedApi.delete<{ message: string }>(
            `/organisations/${id}`,
            undefined,
            'organisations:.*'
        )
        this.cachedApi.invalidate(`organisations:${id}`)
        this.cachedApi.invalidate('organisations:all')
        return response
    }
}
