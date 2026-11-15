import HttpFactory from '@/repository/factory';
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
export class SquareApiService extends HttpFactory {
    async getCategories(): Promise<ApiResponse<SquareCategory[]>> {
        return await this.call<SquareCategory[]>('GET', '/square/categories', undefined, {
            cacheKey: 'square:categories',
            ttl: 5 * 60 * 1000,
        });
    }

    async getProducts(categoryIds: string[], locationIds?: string[]): Promise<ApiResponse<SquareProduct[]>> {
        const params: Record<string, string> = {
            categoryIds: categoryIds.join(','),
        };
        if (locationIds && locationIds.length > 0) {
            params.locationIds = locationIds.join(',');
        }
        return await this.call<SquareProduct[]>('GET', '/square/products', undefined, {
            config: { params },
            cacheKey: `square:products:${categoryIds.join(',')}`,
            ttl: 5 * 60 * 1000,
        });
    }

    async getTransactions(beginTime?: string, endTime?: string): Promise<ApiResponse<SquareTransaction[]>> {
        const params: Record<string, string> = {};
        if (beginTime) params.beginTime = beginTime;
        if (endTime) params.endTime = endTime;
        const cacheKey = `square:transactions:${beginTime || 'all'}:${endTime || 'all'}`;
        return await this.call<SquareTransaction[]>('GET', '/square/transactions', undefined, {
            config: { params },
            cacheKey,
            ttl: 5 * 60 * 1000,
        });
    }

    async getVendors(): Promise<ApiResponse<SquareVendor[]>> {
        return await this.call<SquareVendor[]>('GET', '/square/vendors', undefined, {
            cacheKey: 'square:vendors',
            ttl: 5 * 60 * 1000,
        });
    }

    async getLocations(): Promise<ApiResponse<SquareLocation[]>> {
        return await this.call<SquareLocation[]>('GET', '/square/locations', undefined, {
            cacheKey: 'square:locations',
            ttl: 5 * 60 * 1000,
        });
    }

    async refreshCategories(): Promise<ApiResponse<SquareCategory[]>> {
        return await this.call<SquareCategory[]>('GET', '/square/categories', undefined, {
            cacheKey: 'square:categories',
            skipCache: true,
        });
    }
}

export default SquareApiService;
