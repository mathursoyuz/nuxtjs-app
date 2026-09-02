import { CachedApiClient } from '~/services/api/CachedApiClient';
import { useApiClient } from './useApi';
import { useCacheService } from './useCache';

let cachedApiClientInstance: CachedApiClient | null = null;

/**
 * Get cached API client instance
 * This wraps the regular API client with smart caching
 */
export function useCachedApi(): CachedApiClient {
    if (!cachedApiClientInstance) {
        const apiClient = useApiClient();
        const cacheService = useCacheService();
        cachedApiClientInstance = new CachedApiClient(apiClient, cacheService);
    }
    return cachedApiClientInstance;
}
