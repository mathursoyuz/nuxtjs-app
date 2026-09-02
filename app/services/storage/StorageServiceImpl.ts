import type { StorageService } from './StorageService';

export class StorageServiceImpl implements StorageService {
    private storage: Storage;

    constructor(storage: Storage = localStorage) {
        this.storage = storage;
    }

    get<T>(key: string): T | null {
        if (typeof window === 'undefined') {
            return null;
        }

        try {
            const item = this.storage.getItem(key);
            if (item === null) {
                return null;
            }
            return JSON.parse(item) as T;
        } catch {
            return null;
        }
    }

    set<T>(key: string, value: T): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    }

    remove(key: string): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            this.storage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    }

    clear(): void {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            this.storage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }

    has(key: string): boolean {
        if (typeof window === 'undefined') {
            return false;
        }

        return this.storage.getItem(key) !== null;
    }
}
