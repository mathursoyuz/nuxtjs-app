import type { ApiErrorResponse } from './errors.types';

export interface ApiResponse<T> {
    data?: T;
    message?: string;
    statusCode?: number;
    success?: boolean;
    // Support for direct response formats (e.g., auth responses)
    [key: string]: unknown;
}

export interface ApiError extends ApiErrorResponse {
    message: string;
    statusCode: number;
}

export interface RequestConfig {
    headers?: Record<string, string>;
    params?: Record<string, string | number | boolean>;
    timeout?: number;
}
