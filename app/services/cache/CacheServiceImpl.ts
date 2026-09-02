import type { CacheService, CacheEntry } from './CacheService';

export class CacheServiceImpl implements CacheService {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes
    private maxSize = 1000; // Maximum cache entries to prevent memory bloat
    private accessOrder: string[] = []; // Track access order for LRU eviction

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }

        if (this.isStale(key)) {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
            return null;
        }

        // Update access order (move to end for LRU)
        this.updateAccessOrder(key);

        return entry.data as T;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        // Check if cache is full and evict oldest if needed
        if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
            this.evictOldest();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        });

        // Update access order
        this.updateAccessOrder(key);
    }

    private updateAccessOrder(key: string): void {
        // Remove from current position
        this.removeFromAccessOrder(key);
        // Add to end (most recently used)
        this.accessOrder.push(key);
    }

    private removeFromAccessOrder(key: string): void {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            this.accessOrder.splice(index, 1);
        }
    }

    private evictOldest(): void {
        if (this.accessOrder.length > 0) {
            const oldestKey = this.accessOrder[0];
            this.cache.delete(oldestKey);
            this.accessOrder.shift();
        }
    }

    invalidate(key: string): void {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
    }

    invalidatePattern(pattern: string): void {
        const regex = new RegExp(pattern);
        const keysToDelete: string[] = [];
        
        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                keysToDelete.push(key);
            }
        }

        keysToDelete.forEach((key) => {
            this.cache.delete(key);
            this.removeFromAccessOrder(key);
        });
    }

    clear(): void {
        this.cache.clear();
        this.accessOrder = [];
    }

    isStale(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) {
            return true;
        }

        const age = Date.now() - entry.timestamp;
        return age >= entry.ttl;
    }
}
