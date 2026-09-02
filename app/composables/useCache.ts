import { CacheServiceImpl } from '~/services/cache/CacheServiceImpl';
import type { CacheService } from '~/services/cache/CacheService';

let cacheServiceInstance: CacheService | null = null;

export function useCacheService(): CacheService {
    if (!cacheServiceInstance) {
        cacheServiceInstance = new CacheServiceImpl();
    }
    return cacheServiceInstance;
}
