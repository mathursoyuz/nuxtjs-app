import { StorageServiceImpl } from '~/services/storage/StorageServiceImpl';
import type { StorageService } from '~/services/storage/StorageService';

let storageServiceInstance: StorageService | null = null;

export function useStorageService(): StorageService {
    if (!storageServiceInstance) {
        storageServiceInstance = new StorageServiceImpl();
    }
    return storageServiceInstance;
}
