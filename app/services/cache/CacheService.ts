export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // Time to live in milliseconds
}

export interface CacheService {
    get<T>(key: string): T | null;
    set<T>(key: string, data: T, ttl?: number): void;
    invalidate(key: string): void;
    invalidatePattern(pattern: string): void;
    clear(): void;
    isStale(key: string): boolean;
}
