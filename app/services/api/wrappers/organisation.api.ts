import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'

export interface Organisation {
    id: number
    name: string
    email: string
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

export type UpdateOrganisationBillingDTO = Pick<
    CreateOrganisationDTO,
    | 'billingFirstName'
    | 'billingLastName'
    | 'billingCompany'
    | 'billingAddress'
    | 'billingCity'
    | 'billingStateCode'
    | 'billingPostalCode'
    | 'billingCountryCode'
    | 'billingPhone'
>

/**
 * Organisation API wrapper service
 */
export class OrganisationApiService extends HttpFactory {
    async getAllOrganisations(): Promise<ApiResponse<Organisation[]>> {
        return await this.call<Organisation[]>('GET', '/organisations', undefined, {
            cacheKey: 'organisations:all',
            ttl: 5 * 60 * 1000,
        })
    }

    async lookupOrganisations(
        search: string = '',
        limit: number = 25
    ): Promise<ApiResponse<OrganisationLookupOption[]>> {
        const normalizedSearch = search.trim()
        return await this.call<OrganisationLookupOption[]>(
            'GET',
            '/organisations/lookup',
            undefined,
            {
                config: { params: { search: normalizedSearch, limit } },
                cacheKey: `organisations:lookup:${normalizedSearch.toLowerCase()}:${limit}`,
                ttl: 60 * 1000,
            }
        )
    }

    async getOrganisationById(id: number): Promise<ApiResponse<Organisation>> {
        return await this.call<Organisation>('GET', `/organisations/${id}`, undefined, {
            cacheKey: `organisations:${id}`,
            ttl: 5 * 60 * 1000,
        })
    }

    async createOrganisation(data: CreateOrganisationDTO): Promise<ApiResponse<Organisation>> {
        return await this.call<Organisation, CreateOrganisationDTO>(
            'POST',
            '/organisations',
            data,
            { invalidatePattern: 'organisations:.*' }
        )
    }

    async updateOrganisation(
        id: number,
        data: UpdateOrganisationDTO
    ): Promise<ApiResponse<Organisation>> {
        const response = await this.call<Organisation, UpdateOrganisationDTO>(
            'PUT',
            `/organisations/${id}`,
            data,
            { invalidatePattern: 'organisations:.*' }
        )
        this.invalidateCacheKey(`organisations:${id}`)
        return response
    }

    async updateOrganisationBilling(
        id: number,
        data: UpdateOrganisationBillingDTO
    ): Promise<ApiResponse<Organisation>> {
        const response = await this.call<Organisation, UpdateOrganisationBillingDTO>(
            'PATCH',
            `/organisations/${id}/billing`,
            data,
            { invalidatePattern: 'organisations:.*' }
        )
        this.invalidateCacheKey(`organisations:${id}`)
        return response
    }

    async uploadOrganisationLogo(
        id: number,
        file: File
    ): Promise<ApiResponse<{ message: string }>> {
        const formData = new FormData()
        formData.append('uploadImage', file)

        const response = await this.call<{ message: string }, FormData>(
            'PATCH',
            `/organisations/${id}/uploadImage`,
            formData,
            {
                config: {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
                invalidatePattern: 'organisations:.*',
            }
        )

        this.invalidateCacheKey(`organisations:${id}`)
        return response
    }

    async toggleActive(id: number, isActive: boolean): Promise<ApiResponse<Organisation>> {
        const response = await this.call<Organisation, { isActive: boolean }>(
            'PATCH',
            `/organisations/${id}`,
            { isActive },
            { invalidatePattern: 'organisations:.*' }
        )
        this.invalidateCacheKey(`organisations:${id}`)
        return response
    }

    async refreshOrganisations(): Promise<ApiResponse<Organisation[]>> {
        return await this.call<Organisation[]>('GET', '/organisations', undefined, {
            cacheKey: 'organisations:all',
            skipCache: true,
        })
    }

    async checkEmailExists(
        email: string,
        organisationId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        const data = { email, organisationId }
        return await this.call<{ available: boolean }, typeof data>(
            'POST',
            '/organisations/check-email',
            data
        )
    }

    async deleteOrganisation(id: number): Promise<ApiResponse<{ message: string }>> {
        const response = await this.call<{ message: string }>(
            'DELETE',
            `/organisations/${id}`,
            undefined,
            { invalidatePattern: 'organisations:.*' }
        )
        this.invalidateCacheKey(`organisations:${id}`)
        this.invalidateCacheKey('organisations:all')
        return response
    }
}

export default OrganisationApiService
