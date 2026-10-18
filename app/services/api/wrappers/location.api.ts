import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface Location {
    id: number;
    organisationId: number;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    phoneNumber: string | null;
    lat: string | null;
    long: string | null;
    squareLocationId: string | null;
    isSquareSynced: boolean;
    qbLocationId: string | null;
    isQbSynced: boolean;
    qbSyncErrorReason: string | null;
    qbLastSyncedAt: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationDTO {
    organisationId: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phoneNumber?: string;
    lat?: string;
    long?: string;
    squareLocationId?: string;
    isActive?: boolean;
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}

/**
 * Location API wrapper service
 */
export class LocationApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllLocations(organisationId?: number): Promise<ApiResponse<Location[]>> {
        const params = organisationId ? { organisationId } : undefined;
        const cacheKey = organisationId ? `locations:organisation:${organisationId}` : 'locations:all';
        return this.cachedApi.get<Location[]>('/locations', { params }, cacheKey, 5 * 60 * 1000);
    }

    async getLocationById(id: number): Promise<ApiResponse<Location>> {
        return this.cachedApi.get<Location>(`/locations/${id}`, undefined, `locations:${id}`, 5 * 60 * 1000);
    }

    async createLocation(data: CreateLocationDTO): Promise<ApiResponse<Location>> {
        const response = await this.cachedApi.post<Location>('/locations', data, undefined, 'locations:.*');
        return response;
    }

    async updateLocation(id: number, data: UpdateLocationDTO): Promise<ApiResponse<Location>> {
        const response = await this.cachedApi.put<Location>(`/locations/${id}`, data, undefined, 'locations:.*');
        this.cachedApi.invalidate(`locations:${id}`);
        return response;
    }

    async deleteLocation(id: number): Promise<ApiResponse<void>> {
        const response = await this.cachedApi.delete<void>(`/locations/${id}`, undefined, 'locations:.*');
        return response;
    }

    async refreshLocations(organisationId?: number): Promise<ApiResponse<Location[]>> {
        const params = organisationId ? { organisationId } : undefined;
        const cacheKey = organisationId ? `locations:organisation:${organisationId}` : 'locations:all';
        return this.cachedApi.get<Location[]>('/locations', { params }, cacheKey, undefined, true);
    }
}
