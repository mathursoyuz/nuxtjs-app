/**
 * Strict error type definitions
 * No `any` or `unknown` without proper type guards
 */

export interface ApiErrorResponse {
    message: string;
    statusCode: number;
    error?: string;
    errors?: Record<string, string[]>; // Field-level errors
    timestamp?: string;
}

export interface ValidationError {
    field: string;
    messages: string[];
}

export interface ErrorInfo {
    message: string;
    code?: string;
    details?: ApiErrorResponse;
    timestamp: Date;
}

export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'statusCode' in error &&
        typeof (error as ApiErrorResponse).message === 'string' &&
        typeof (error as ApiErrorResponse).statusCode === 'number'
    );
}
