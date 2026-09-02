import { computed } from 'vue';
import { useLoadingStore } from '~/stores/loading.store';

/**
 * Composable for task-based loading
 * Wraps operations in loading tasks for automatic spinner management
 */
export function useLoadingTask(taskId: string, message?: string) {
    const loadingStore = useLoadingStore();

    /**
     * Execute an operation with loading state management
     * @param operation - The async operation to execute
     * @returns Promise that resolves when operation completes
     */
    const execute = async <T>(operation: () => Promise<T>): Promise<T> => {
        loadingStore.startTask(taskId, message);
        try {
            return await operation();
        } finally {
            loadingStore.stopTask(taskId);
        }
    };

    /**
     * Start the loading task manually
     */
    const start = (customMessage?: string) => {
        loadingStore.startTask(taskId, customMessage || message);
    };

    /**
     * Stop the loading task manually
     */
    const stop = () => {
        loadingStore.stopTask(taskId);
    };

    /**
     * Check if this task is currently active
     */
    const isActive = computed(() => loadingStore.isTaskActive(taskId));

    return {
        execute,
        start,
        stop,
        isActive,
    };
}
