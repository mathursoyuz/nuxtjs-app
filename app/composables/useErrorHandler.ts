import { ref, computed } from 'vue';
import type { ErrorInfo, ApiErrorResponse } from '~/types/errors.types';
import { isApiErrorResponse } from '~/types/errors.types';

const errors = ref<ErrorInfo[]>([]);
const showToast = ref(false);
const currentError = ref<ErrorInfo | null>(null);

interface ErrorWithCode {
    code?: string;
    message?: string;
}

function hasCode(error: unknown): error is ErrorWithCode {
    return typeof error === 'object' && error !== null && 'code' in error;
}

export function useErrorHandler() {
    const handleError = (error: unknown, context?: string): void => {
        let message = 'An unexpected error occurred';
        let code: string | undefined;
        let details: ApiErrorResponse | undefined;

        if (error instanceof Error) {
            message = error.message;
        } else if (isApiErrorResponse(error)) {
            message = error.message || 'PLEASE ADD MESSAGE FOR THIS CONDITION';
            details = error;
        } else if (hasCode(error)) {
            message = error.message || 'An unexpected error occurred';
            code = error.code;
        }

        const errorInfo: ErrorInfo = {
            message: context ? `${context}: ${message}` : message,
            code,
            details,
            timestamp: new Date(),
        };

        errors.value.push(errorInfo);
        currentError.value = errorInfo;
        showToast.value = true;

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            console.error('Error:', errorInfo);
        }

        // Auto-hide toast after 5 seconds
        setTimeout(() => {
            showToast.value = false;
        }, 5000);
    };

    const clearError = (): void => {
        currentError.value = null;
        showToast.value = false;
    };

    const clearAllErrors = (): void => {
        errors.value = [];
        currentError.value = null;
        showToast.value = false;
    };

    return {
        errors: computed(() => errors.value),
        currentError: computed(() => currentError.value),
        showToast: computed(() => showToast.value),
        handleError,
        clearError,
        clearAllErrors,
    };
}
