import { computed } from 'vue';
import { useToastStore } from '~/stores/toast.store';
import type { Toast } from '~/stores/toast.store';
import type { ApiResponse } from '~/types/api.types';
import { useApiMessage } from './useApiMessage';

export function useToast() {
    try {
        const toastStore = useToastStore();
        const { getSuccessMessage, getErrorMessage } = useApiMessage();

        const show = (message: string, type: Toast['type'] = 'info', timeout = 5000): string => {
            return toastStore.addToast(message, type, timeout);
        };

        const success = (message: string, timeout = 5000): string => {
            return toastStore.success(message, timeout);
        };

        const error = (message: string, timeout = 5000): string => {
            return toastStore.error(message, timeout);
        };

        const warning = (message: string, timeout = 5000): string => {
            return toastStore.warning(message, timeout);
        };

        const info = (message: string, timeout = 5000): string => {
            return toastStore.info(message, timeout);
        };

        /**
         * Show success toast from API response with fallback to constant
         * @param response - API response object
         * @param fallbackMessage - Fallback message constant
         * @param timeout - Toast timeout in milliseconds
         * @returns Toast ID
         */
        const successFromResponse = (
            response: ApiResponse<unknown> | undefined | null,
            fallbackMessage: string,
            timeout = 5000
        ): string => {
            const message = getSuccessMessage(response, fallbackMessage);
            return toastStore.success(message, timeout);
        };

        /**
         * Show error toast from error object with fallback to constant
         * @param error - Error object, AxiosError, or unknown
         * @param fallbackMessage - Fallback message constant
         * @param timeout - Toast timeout in milliseconds
         * @returns Toast ID
         */
        const errorFromError = (
            error: unknown,
            fallbackMessage: string,
            timeout = 5000
        ): string => {
            const message = getErrorMessage(error, fallbackMessage);
            return toastStore.error(message, timeout);
        };

        const remove = (id: string): void => {
            toastStore.removeToast(id);
        };

        const clearAll = (): void => {
            toastStore.clearAll();
        };

        return {
            toasts: computed(() => toastStore.visibleToasts),
            show,
            success,
            error,
            warning,
            info,
            remove,
            clearAll,
            // New helper methods
            successFromResponse,
            errorFromError,
        };
    } catch (err) {
        // Fallback if store is not initialized
        console.warn('Toast store not initialized:', err);
        const noop = () => {};
        const noopString = () => '';
        return {
            toasts: computed(() => []),
            show: noopString,
            success: noopString,
            error: noopString,
            warning: noopString,
            info: noopString,
            remove: noop,
            clearAll: noop,
            successFromResponse: noopString,
            errorFromError: noopString,
        };
    }
}
