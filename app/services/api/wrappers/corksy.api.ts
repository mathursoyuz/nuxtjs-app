import HttpFactory from '@/repository/factory';
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
export class CorksyApiService extends HttpFactory {
    async getAccessToken(brandSlug: string): Promise<ApiResponse<string>> {
        return await this.call<string>('GET', `/corksy/${brandSlug}/access-token`, undefined, {
            cacheKey: `corksy:token:${brandSlug}`,
            ttl: 60 * 60 * 1000,
        });
    }

    /**
     * Fetch orders stored in WinerySupport DB, optionally filtered by brandSlug.
     */
    async listStoredOrders(brandSlug?: string): Promise<ApiResponse<CorksyOrder[]>> {
        const params = brandSlug ? `?brandSlug=${encodeURIComponent(brandSlug)}` : '';
        return await this.call<CorksyOrder[]>('GET', `/corksy/orders${params}`);
    }

    /**
     * Trigger fresh fetch from Corksy API for given brandSlug and store in DB.
     */
    async syncOrdersFromCorksy(brandSlug: string): Promise<ApiResponse<CorksyOrder[]>> {
        return await this.call<CorksyOrder[]>('GET', `/corksy/${brandSlug}/get-orders`);
    }

    /**
     * Get available Corksy site configs (brands).
     */
    async listConfigs(): Promise<ApiResponse<CorksyConfig[]>> {
        return await this.call<CorksyConfig[]>('GET', '/corksy/configs');
    }
}

export default CorksyApiService;
