import type { CachedApiClient } from '~/services/api/CachedApiClient'
import type { ApiResponse, RequestConfig } from '~/types/api.types'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpCallOptions {
    config?: RequestConfig
    cacheKey?: string
    ttl?: number
    skipCache?: boolean
    invalidatePattern?: string
}

/**
 * Shared base for API modules.
 *
 * It centralises request dispatch without bypassing the existing authenticated,
 * organisation-aware cache client. API modules should expose domain-specific
 * methods and use call() rather than constructing transport requests directly.
 */
class HttpFactory {
    constructor(protected readonly cachedApi: CachedApiClient) {}

    protected async call<TResponse, TRequest = unknown>(
        method: HttpMethod,
        path: string,
        data?: TRequest,
        options: HttpCallOptions = {}
    ): Promise<ApiResponse<TResponse>> {
        switch (method) {
            case 'GET':
                return await this.cachedApi.get<TResponse>(
                    path,
                    options.config,
                    options.cacheKey,
                    options.ttl,
                    options.skipCache
                )
            case 'POST':
                return await this.cachedApi.post<TResponse>(
                    path,
                    data,
                    options.config,
                    options.invalidatePattern
                )
            case 'PUT':
                return await this.cachedApi.put<TResponse>(
                    path,
                    data,
                    options.config,
                    options.invalidatePattern
                )
            case 'PATCH':
                return await this.cachedApi.patch<TResponse>(
                    path,
                    data,
                    options.config,
                    options.invalidatePattern
                )
            case 'DELETE':
                return await this.cachedApi.delete<TResponse>(
                    path,
                    options.config,
                    options.invalidatePattern
                )
        }
    }

    protected invalidateCacheKey(key: string): void {
        this.cachedApi.invalidate(key)
    }

    protected invalidateCachePattern(pattern: string): void {
        this.cachedApi.invalidatePattern(pattern)
    }
}

export default HttpFactory
