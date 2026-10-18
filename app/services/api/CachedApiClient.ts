import type { ApiClient } from './ApiClient'
import type { CacheService } from '../cache/CacheService'
import type { ApiResponse, RequestConfig } from '~/types/api.types'

/**
 * Wrapper around ApiClient that adds smart caching with invalidation
 */
export class CachedApiClient {
    private contextRevision = 0
    private authToken: string | null = null
    constructor(
        private readonly apiClient: ApiClient,
        private readonly cacheService: CacheService
    ) {}

    /**
     * GET request with caching
     * @param url - API endpoint
     * @param config - Request configuration
     * @param cacheKey - Optional custom cache key (defaults to URL + params)
     * @param ttl - Optional custom TTL in milliseconds (defaults to 5 minutes)
     * @param skipCache - Skip cache and force fresh request
     */
    async get<T>(
        url: string,
        config?: RequestConfig,
        cacheKey?: string,
        ttl?: number,
        skipCache = false
    ): Promise<ApiResponse<T>> {
        const revision = this.contextRevision
        const key = cacheKey || this.generateCacheKey('GET', url, config?.params)
        skipCache ||=
            /^\/(auth|access|products)(\/|$)/.test(url) || /\/organisation-products(\/|$)/.test(url)

        // Check cache first (unless skipCache is true)
        if (!skipCache) {
            const cached = this.cacheService.get<ApiResponse<T>>(key)
            if (cached) {
                return cached
            }
        }

        // Fetch from API
        const response = await this.apiClient.get<T>(url, config)
        if (revision !== this.contextRevision)
            throw new Error('Organisation or account changed while loading data.')

        // Cache successful responses
        if (response.data && !skipCache) {
            this.cacheService.set(key, response, ttl)
        }

        return response
    }

    /**
     * POST request (invalidates related GET caches)
     * @param url - API endpoint
     * @param data - Request body
     * @param config - Request configuration
     * @param invalidatePattern - Pattern to invalidate related cache entries
     */
    async post<T>(
        url: string,
        data?: unknown,
        config?: RequestConfig,
        invalidatePattern?: string
    ): Promise<ApiResponse<T>> {
        const response = await this.apiClient.post<T>(url, data, config)

        // Invalidate related caches
        if (invalidatePattern) {
            this.cacheService.invalidatePattern(invalidatePattern)
        } else {
            // Default: invalidate all GET requests for this endpoint
            this.cacheService.invalidatePattern(`GET:${url}.*`)
        }

        return response
    }

    /**
     * PUT request (invalidates related GET caches)
     */
    async put<T>(
        url: string,
        data?: unknown,
        config?: RequestConfig,
        invalidatePattern?: string
    ): Promise<ApiResponse<T>> {
        const response = await this.apiClient.put<T>(url, data, config)

        if (invalidatePattern) {
            this.cacheService.invalidatePattern(invalidatePattern)
        } else {
            this.cacheService.invalidatePattern(`GET:${url}.*`)
        }

        return response
    }

    /**
     * PATCH request (invalidates related GET caches)
     */
    async patch<T>(
        url: string,
        data?: unknown,
        config?: RequestConfig,
        invalidatePattern?: string
    ): Promise<ApiResponse<T>> {
        const response = await this.apiClient.patch<T>(url, data, config)

        if (invalidatePattern) {
            this.cacheService.invalidatePattern(invalidatePattern)
        } else {
            this.cacheService.invalidatePattern(`GET:${url}.*`)
        }

        return response
    }

    /**
     * DELETE request (invalidates related GET caches)
     */
    async delete<T>(
        url: string,
        config?: RequestConfig,
        invalidatePattern?: string
    ): Promise<ApiResponse<T>> {
        const response = await this.apiClient.delete<T>(url, config)

        if (invalidatePattern) {
            this.cacheService.invalidatePattern(invalidatePattern)
        } else {
            this.cacheService.invalidatePattern(`GET:${url}.*`)
        }

        return response
    }

    /**
     * Manually invalidate cache by key
     */
    invalidate(key: string): void {
        this.cacheService.invalidate(key)
    }

    /**
     * Manually invalidate cache by pattern
     */
    invalidatePattern(pattern: string): void {
        this.cacheService.invalidatePattern(pattern)
    }

    /**
     * Clear all cache
     */
    clearCache(): void {
        this.contextRevision++
        this.cacheService.clear()
    }

    /**
     * Generate cache key from method, URL, and params
     */
    private generateCacheKey(
        method: string,
        url: string,
        params?: Record<string, string | number | boolean>
    ): string {
        const paramsStr = params ? `?${JSON.stringify(params)}` : ''
        return `${method}:${url}${paramsStr}`
    }

    // Expose underlying API organisation methods
    setAuthToken(token: string | null): void {
        if (token !== this.authToken) this.clearCache()
        this.authToken = token
        this.apiClient.setAuthToken(token)
    }

    setBearerToken(token: string | null): void {
        this.apiClient.setBearerToken(token)
    }
}
