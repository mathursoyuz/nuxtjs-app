import type { ApiResponse } from '~/types/api.types';
import type { ApiErrorResponse } from '~/types/errors.types';
import {
    CLIENT_MESSAGES,
    CUSTOMER_MESSAGES,
    PRODUCT_MESSAGES,
    CATEGORY_MESSAGES,
    LOCATION_MESSAGES,
    ORDER_MESSAGES,
    INTEGRATION_MESSAGES,
    TRANSACTION_MESSAGES,
    VENDOR_MESSAGES,
    DISCOUNT_MESSAGES,
    INVENTORY_MESSAGES,
    GENERAL_MESSAGES,
} from '~/constants/messages.constants';

/**
 * Composable for extracting messages from API responses with fallback to constants
 * 
 * @example
 * const { getSuccessMessage, getErrorMessage } = useApiMessage();
 * const message = getSuccessMessage(response, CLIENT_MESSAGES.CREATE_SUCCESS);
 */
export function useApiMessage() {
    /**
     * Get message from API response, fallback to constant
     * @param response - API response object, error object, or string
     * @param fallbackMessage - Fallback message constant
     * @returns Message string
     */
    const getMessage = (
        response: ApiResponse<unknown> | ApiErrorResponse | string | undefined | null,
        fallbackMessage: string
    ): string => {
        // If response is a string, return it
        if (typeof response === 'string') {
            return response;
        }

        // If response is null/undefined, use fallback
        if (!response) {
            return fallbackMessage;
        }

        // Extract message from ApiResponse
        if ('message' in response && response.message) {
            return response.message;
        }

        // Extract message from ApiErrorResponse
        if ('error' in response && response.error) {
            return response.error;
        }

        // Use fallback
        return fallbackMessage;
    };

    /**
     * Get success message from API response
     * @param response - API response object
     * @param fallbackMessage - Fallback message constant
     * @returns Message string
     */
    const getSuccessMessage = (
        response: ApiResponse<unknown> | undefined | null,
        fallbackMessage: string
    ): string => {
        return getMessage(response, fallbackMessage);
    };

    /**
     * Get error message from API response or error object
     * @param error - Error object, AxiosError, or unknown
     * @param fallbackMessage - Fallback message constant
     * @returns Message string
     */
    const getErrorMessage = (
        error: unknown,
        fallbackMessage: string = GENERAL_MESSAGES.ERROR
    ): string => {
        // If error is a string, return it
        if (typeof error === 'string') {
            return error;
        }

        // If error is Error instance, check if it has API response
        if (error instanceof Error) {
            // Check if error has response property (AxiosError)
            const axiosError = error as { response?: { data?: ApiErrorResponse } };
            if (axiosError.response?.data) {
                return getMessage(axiosError.response.data, fallbackMessage);
            }
            return error.message || fallbackMessage;
        }

        // If error is ApiErrorResponse
        if (error && typeof error === 'object' && 'message' in error) {
            return getMessage(error as ApiErrorResponse, fallbackMessage);
        }

        return fallbackMessage;
    };

    /**
     * Helper to get formatted import result message
     * @param result - Import result with created, updated, skipped counts
     * @param successMessage - Base success message
     * @returns Formatted message string
     */
    const getImportResultMessage = (
        result: { created: number; updated: number; skipped: number },
        successMessage: string
    ): string => {
        const details = `${result.created} created, ${result.updated} updated, ${result.skipped} skipped`;
        return `${successMessage}: ${details}`;
    };

    /**
     * Helper to get formatted bulk import message
     * @param selectedCount - Number of items selected
     * @param result - Import result
     * @param itemName - Name of item type (e.g., 'product', 'category')
     * @returns Formatted message string
     */
    const getBulkImportMessage = (
        selectedCount: number,
        result: { created: number; updated: number; skipped: number; errors: Array<{ error: string }> },
        itemName: string = 'item'
    ): string => {
        const itemPlural = selectedCount !== 1 ? `${itemName}s` : itemName;
        const successCount = result.created + result.updated;
        const totalProcessed = result.created + result.updated + result.skipped;

        let message = `Imported ${selectedCount} ${itemPlural}: `;
        message += `${successCount} successful (${result.created} created, ${result.updated} updated)`;
        if (result.skipped > 0) {
            message += `, ${result.skipped} skipped`;
        }
        if (result.errors.length > 0) {
            message += `, ${result.errors.length} failed`;
        }

        return message;
    };

    /**
     * Helper to get formatted fetch success message
     * @param count - Number of items fetched
     * @param itemName - Name of item type
     * @param source - Source name (e.g., 'Square', 'QuickBooks')
     * @returns Formatted message string
     */
    const getFetchSuccessMessage = (
        count: number,
        itemName: string = 'item',
        source?: string
    ): string => {
        const itemPlural = count !== 1 ? `${itemName}s` : itemName;
        const sourceText = source ? ` from ${source}` : '';
        return `Successfully fetched ${count} ${itemPlural}${sourceText}`;
    };

    return {
        getMessage,
        getSuccessMessage,
        getErrorMessage,
        getImportResultMessage,
        getBulkImportMessage,
        getFetchSuccessMessage,
        // Export constants for direct access if needed
        CLIENT_MESSAGES,
        CUSTOMER_MESSAGES,
        PRODUCT_MESSAGES,
        CATEGORY_MESSAGES,
        LOCATION_MESSAGES,
        ORDER_MESSAGES,
        INTEGRATION_MESSAGES,
        TRANSACTION_MESSAGES,
        VENDOR_MESSAGES,
        DISCOUNT_MESSAGES,
        INVENTORY_MESSAGES,
        GENERAL_MESSAGES,
    };
}