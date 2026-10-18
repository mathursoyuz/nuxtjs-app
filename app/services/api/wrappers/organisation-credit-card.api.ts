import type { CachedApiClient } from '../CachedApiClient'
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
export class OrganisationCreditCardApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllOrganisationCreditCards(organisationId: number): Promise<ApiResponse<OrganisationCreditCard[]>> {
        return this.cachedApi.get<OrganisationCreditCard[]>(
            `/organisations/${organisationId}/credit-card`,
            undefined,
            `organisation-cc:organisation:${organisationId}`,
            5 * 60 * 1000
        )
    }

    async getOrganisationCreditCardById(
        organisationId: number,
        id: number
    ): Promise<ApiResponse<OrganisationCreditCard>> {
        return this.cachedApi.get<OrganisationCreditCard>(
            `/organisations/${organisationId}/credit-card/${id}`,
            undefined,
            `organisation-cc:${id}`,
            5 * 60 * 1000
        )
    }

    async createOrganisationCreditCard(
        organisationId: number,
        data: CreateOrganisationCreditCardDTO
    ): Promise<ApiResponse<OrganisationCreditCard>> {
        const response = await this.cachedApi.post<OrganisationCreditCard>(
            `/organisations/${organisationId}/credit-card`,
            data,
            undefined,
            'organisation-cc:.*'
        )
        return response
    }

    async toggleActive(
        organisationId: number,
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<OrganisationCreditCard>> {
        const response = await this.cachedApi.patch<OrganisationCreditCard>(
            `/organisations/${organisationId}/credit-card/${id}`,
            { isActive },
            undefined,
            'organisation-cc:.*'
        )
        this.cachedApi.invalidate(`organisation-cc:${id}`)
        return response
    }

    async refreshOrganisationCreditCards(organisationId: number): Promise<ApiResponse<OrganisationCreditCard[]>> {
        return this.cachedApi.get<OrganisationCreditCard[]>(
            `/organisations/${organisationId}/credit-card`,
            undefined,
            `organisation-cc:organisation:${organisationId}`,
            undefined,
            true
        )
    }
}
