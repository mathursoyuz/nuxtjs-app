import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface CreateCustomerProfileInputDTO {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface CustomerProfileResult {
    customerProfileId: string;
    [key: string]: unknown;
}

/**
 * Authorize.net API wrapper service
 */
export class AuthorizeNetApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async createCustomerProfile(data: CreateCustomerProfileInputDTO): Promise<ApiResponse<CustomerProfileResult>> {
        return this.cachedApi.post<CustomerProfileResult>('/payments/create-profile', data);
    }
}
