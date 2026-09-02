import type { AxiosError } from 'axios';
import type { ApiErrorResponse, FieldErrors } from '~/types/errors.types';
import { isApiErrorResponse } from '~/types/errors.types';

export function useApiError() {
    /**
     * Parse API error and extract user-friendly message
     * @param error - Axios error or unknown error
     * @returns User-friendly error message
     */
    const getErrorMessage = (error: unknown): string => {
        if (isApiErrorResponse(error)) {
            return error.message || error.error || 'PLEASE ADD MESSAGE FOR THIS CONDITION';
        }

        if (error instanceof Error) {
            return error.message;
        }

        return 'PLEASE ADD MESSAGE FOR THIS CONDITION';
    };

    /**
     * Extract field-level errors from API error response
     * @param error - Axios error
     * @returns Field errors object
     */
    const getFieldErrors = (error: AxiosError<ApiErrorResponse>): FieldErrors => {
        const fieldErrors: FieldErrors = {};

        if (error.response?.data?.errors) {
            return error.response.data.errors;
        }

        return fieldErrors;
    };

    /**
     * Check if error has field-level errors (422 status)
     * @param error - Axios error
     * @returns true if error has field-level errors
     */
    const hasFieldErrors = (error: AxiosError<ApiErrorResponse>): boolean => {
        return error.response?.status === 422 && !!error.response?.data?.errors;
    };

    /**
     * Handle API error - extract message and field errors
     * @param error - Axios error
     * @returns Object with message and field errors
     */
    const handleApiError = (error: AxiosError<ApiErrorResponse>): { message: string; fieldErrors: FieldErrors } => {
        const message = getErrorMessage(error.response?.data || error);
        const fieldErrors = getFieldErrors(error);

        return { message, fieldErrors };
    };

    return {
        getErrorMessage,
        getFieldErrors,
        hasFieldErrors,
        handleApiError,
    };
}
