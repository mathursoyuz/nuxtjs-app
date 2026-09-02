import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface CorksyOrder {
    [key: string]: unknown;
}

export interface CorksyConfig {
    id: number;
    brandName: string;
    brandSlug: string;
}

/**
 * Corksy API wrapper service
 */
export class CorksyApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAccessToken(brandSlug: string): Promise<ApiResponse<string>> {
        return this.cachedApi.get<string>(`/corksy/${brandSlug}/access-token`, undefined, `corksy:token:${brandSlug}`, 60 * 60 * 1000);
    }

    /**
     * Fetch orders stored in WinerySupport DB, optionally filtered by brandSlug.
     */
    async listStoredOrders(brandSlug?: string): Promise<ApiResponse<CorksyOrder[]>> {
        const params = brandSlug ? `?brandSlug=${encodeURIComponent(brandSlug)}` : '';
        return this.cachedApi.get<CorksyOrder[]>(`/corksy/orders${params}`);
    }

    /**
     * Trigger fresh fetch from Corksy API for given brandSlug and store in DB.
     */
    async syncOrdersFromCorksy(brandSlug: string): Promise<ApiResponse<CorksyOrder[]>> {
        return this.cachedApi.get<CorksyOrder[]>(`/corksy/${brandSlug}/get-orders`);
    }

    /**
     * Get available Corksy site configs (brands).
     */
    async listConfigs(): Promise<ApiResponse<CorksyConfig[]>> {
        return this.cachedApi.get<CorksyConfig[]>(`/corksy/configs`);
    }
}
