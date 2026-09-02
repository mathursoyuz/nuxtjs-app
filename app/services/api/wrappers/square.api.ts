import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface SquareCategory {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface SquareProduct {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface SquareTransaction {
    id: string;
    created_at: string;
    [key: string]: unknown;
}

export interface SquareVendor {
    id: string;
    name: string;
    [key: string]: unknown;
}

export interface SquareLocation {
    id: string;
    name: string;
    [key: string]: unknown;
}

/**
 * Square API wrapper service
 */
export class SquareApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getCategories(): Promise<ApiResponse<SquareCategory[]>> {
        return this.cachedApi.get<SquareCategory[]>('/square/categories', undefined, 'square:categories', 5 * 60 * 1000);
    }

    async getProducts(categoryIds: string[], locationIds?: string[]): Promise<ApiResponse<SquareProduct[]>> {
        const params: Record<string, string> = {
            categoryIds: categoryIds.join(','),
        };
        if (locationIds && locationIds.length > 0) {
            params.locationIds = locationIds.join(',');
        }
        return this.cachedApi.get<SquareProduct[]>('/square/products', { params }, `square:products:${categoryIds.join(',')}`, 5 * 60 * 1000);
    }

    async getTransactions(beginTime?: string, endTime?: string): Promise<ApiResponse<SquareTransaction[]>> {
        const params: Record<string, string> = {};
        if (beginTime) params.beginTime = beginTime;
        if (endTime) params.endTime = endTime;
        const cacheKey = `square:transactions:${beginTime || 'all'}:${endTime || 'all'}`;
        return this.cachedApi.get<SquareTransaction[]>('/square/transactions', { params }, cacheKey, 5 * 60 * 1000);
    }

    async getVendors(): Promise<ApiResponse<SquareVendor[]>> {
        return this.cachedApi.get<SquareVendor[]>('/square/vendors', undefined, 'square:vendors', 5 * 60 * 1000);
    }

    async getLocations(): Promise<ApiResponse<SquareLocation[]>> {
        return this.cachedApi.get<SquareLocation[]>('/square/locations', undefined, 'square:locations', 5 * 60 * 1000);
    }

    async refreshCategories(): Promise<ApiResponse<SquareCategory[]>> {
        return this.cachedApi.get<SquareCategory[]>('/square/categories', undefined, 'square:categories', undefined, true);
    }
}
