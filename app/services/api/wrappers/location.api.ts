import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'

export interface Location {
    id: number
    organisationId: number
    name: string
    address: string | null
    city: string | null
    state: string | null
    country: string | null
    phoneNumber: string | null
    lat: string | null
    long: string | null
    squareLocationId: string | null
    isSquareSynced: boolean
    qbLocationId: string | null
    isQbSynced: boolean
    qbSyncErrorReason: string | null
    qbLastSyncedAt: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateLocationDTO {
    organisationId: number
    name: string
    address?: string
    city?: string
    state?: string
    country?: string
    phoneNumber?: string
    lat?: string
    long?: string
    squareLocationId?: string
    isActive?: boolean
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}

/**
 * Location API wrapper service
 */
export class LocationApiService extends HttpFactory {
    async getAllLocations(organisationId?: number): Promise<ApiResponse<Location[]>> {
        const params = organisationId ? { organisationId } : undefined
        const cacheKey = organisationId
            ? `locations:organisation:${organisationId}`
            : 'locations:all'
        return await this.call<Location[]>('GET', '/locations', undefined, {
            config: { params },
            cacheKey,
            ttl: 5 * 60 * 1000,
        })
    }

    async getLocationById(id: number): Promise<ApiResponse<Location>> {
        return await this.call<Location>('GET', `/locations/${id}`, undefined, {
            cacheKey: `locations:${id}`,
            ttl: 5 * 60 * 1000,
        })
    }

    async createLocation(data: CreateLocationDTO): Promise<ApiResponse<Location>> {
        return await this.call<Location, CreateLocationDTO>('POST', '/locations', data, {
            invalidatePattern: 'locations:.*',
        })
    }

    async updateLocation(id: number, data: UpdateLocationDTO): Promise<ApiResponse<Location>> {
        const response = await this.call<Location, UpdateLocationDTO>(
            'PUT',
            `/locations/${id}`,
            data,
            { invalidatePattern: 'locations:.*' }
        )
        this.invalidateCacheKey(`locations:${id}`)
        return response
    }

    async updateLocationStatus(id: number, isActive: boolean): Promise<ApiResponse<Location>> {
        return await this.call<Location, { isActive: boolean }>(
            'PATCH',
            `/locations/${id}/status`,
            { isActive },
            { invalidatePattern: 'locations:.*' }
        )
    }

    async deleteLocation(id: number): Promise<ApiResponse<void>> {
        return await this.call<void>('DELETE', `/locations/${id}`, undefined, {
            invalidatePattern: 'locations:.*',
        })
    }

    async refreshLocations(organisationId?: number): Promise<ApiResponse<Location[]>> {
        const params = organisationId ? { organisationId } : undefined
        const cacheKey = organisationId
            ? `locations:organisation:${organisationId}`
            : 'locations:all'
        return await this.call<Location[]>('GET', '/locations', undefined, {
            config: { params },
            cacheKey,
            skipCache: true,
        })
    }

    invalidateCache(): void {
        this.invalidateCacheKey('locations:.*')
    }
}

export default LocationApiService
