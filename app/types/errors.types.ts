/**
 * Strict error type definitions
 * No `any` or `unknown` without proper type guards
 */

export interface ApiErrorResponse {
    success: false
    message: string
    statusCode: number
    path: string
    timestamp: string
    error: {
        code: string
        details?: unknown
    }
}

export type FieldErrors = Record<string, string[]>

export interface ValidationError {
    field: string
    messages: string[]
}

export interface ErrorInfo {
    message: string
    code?: string
    details?: ApiErrorResponse
    timestamp: Date
}

export const isApiErrorResponse = (error: unknown): error is ApiErrorResponse => {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'statusCode' in error &&
        'success' in error &&
        error.success === false &&
        typeof (error as ApiErrorResponse).message === 'string' &&
        typeof (error as ApiErrorResponse).statusCode === 'number'
    )
}
