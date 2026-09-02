import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type { ClientCreditCard, CreateClientCreditCardDTO } from '~/types/client-credit-card.types'

export type {
    ClientCreditCard,
    CreateClientCreditCardDTO,
    UpdateClientCreditCardDTO,
} from '~/types/client-credit-card.types'

/**
 * Client Credit Card API wrapper service
 */
export class ClientCreditCardApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllClientCreditCards(clientId: number): Promise<ApiResponse<ClientCreditCard[]>> {
        return this.cachedApi.get<ClientCreditCard[]>(
            `/clients/${clientId}/credit-card`,
            undefined,
            `client-cc:client:${clientId}`,
            5 * 60 * 1000
        )
    }

    async getClientCreditCardById(
        clientId: number,
        id: number
    ): Promise<ApiResponse<ClientCreditCard>> {
        return this.cachedApi.get<ClientCreditCard>(
            `/clients/${clientId}/credit-card/${id}`,
            undefined,
            `client-cc:${id}`,
            5 * 60 * 1000
        )
    }

    async createClientCreditCard(
        clientId: number,
        data: CreateClientCreditCardDTO
    ): Promise<ApiResponse<ClientCreditCard>> {
        const response = await this.cachedApi.post<ClientCreditCard>(
            `/clients/${clientId}/credit-card`,
            data,
            undefined,
            'client-cc:.*'
        )
        return response
    }

    async toggleActive(
        clientId: number,
        id: number,
        isActive: boolean
    ): Promise<ApiResponse<ClientCreditCard>> {
        const response = await this.cachedApi.patch<ClientCreditCard>(
            `/clients/${clientId}/credit-card/${id}`,
            { isActive },
            undefined,
            'client-cc:.*'
        )
        this.cachedApi.invalidate(`client-cc:${id}`)
        return response
    }

    async refreshClientCreditCards(clientId: number): Promise<ApiResponse<ClientCreditCard[]>> {
        return this.cachedApi.get<ClientCreditCard[]>(
            `/clients/${clientId}/credit-card`,
            undefined,
            `client-cc:client:${clientId}`,
            undefined,
            true
        )
    }
}
