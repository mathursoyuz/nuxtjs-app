import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type { OrganisationCreditCard, CreateOrganisationCreditCardDTO } from '~/types/organisation-credit-card.types'

export type {
    OrganisationCreditCard,
    CreateOrganisationCreditCardDTO,
    UpdateOrganisationCreditCardDTO,
} from '~/types/organisation-credit-card.types'

/**
 * Organisation Credit Card API wrapper service
 */
export class OrganisationCreditCardApiService extends HttpFactory {
    async getAllOrganisationCreditCards(organisationId: number): Promise<ApiResponse<OrganisationCreditCard[]>> {
        return await this.call<OrganisationCreditCard[]>(
            'GET',
            `/organisations/${organisationId}/credit-card`,
            undefined,
            {
                cacheKey: `organisation-cc:organisation:${organisationId}`,
                ttl: 5 * 60 * 1000,
            }
        )
    }

    async getOrganisationCreditCardById(
        organisationId: number,
        id: number
    ): Promise<ApiResponse<OrganisationCreditCard>> {
        return await this.call<OrganisationCreditCard>(
            'GET',
            `/organisations/${organisationId}/credit-card/${id}`,
            undefined,
            { cacheKey: `organisation-cc:${id}`, ttl: 5 * 60 * 1000 }
        )
    }

    async createOrganisationCreditCard(
        organisationId: number,
        data: CreateOrganisationCreditCardDTO
    ): Promise<ApiResponse<OrganisationCreditCard>> {
        return await this.call<OrganisationCreditCard, CreateOrganisationCreditCardDTO>(
            'POST',
            `/organisations/${organisationId}/credit-card`,
            data,
            { invalidatePattern: 'organisation-cc:.*' }
        )
    }

    async toggleActive(
        organisationId: number,
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<OrganisationCreditCard>> {
        const response = await this.call<OrganisationCreditCard, { isActive: boolean }>(
            'PATCH',
            `/organisations/${organisationId}/credit-card/${id}`,
            { isActive },
            { invalidatePattern: 'organisation-cc:.*' }
        )
        this.invalidateCacheKey(`organisation-cc:${id}`)
        return response
    }

    async refreshOrganisationCreditCards(organisationId: number): Promise<ApiResponse<OrganisationCreditCard[]>> {
        return await this.call<OrganisationCreditCard[]>(
            'GET',
            `/organisations/${organisationId}/credit-card`,
            undefined,
            {
                cacheKey: `organisation-cc:organisation:${organisationId}`,
                skipCache: true,
            }
        )
    }
}

export default OrganisationCreditCardApiService
