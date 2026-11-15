import type { ApiErrorResponse } from './errors.types'

export interface ApiResponse<T> {
    statusCode: number
    success: true
    message: string
    timestamp: string
    data: T | null
}

export type ApiError = ApiErrorResponse

export interface RequestConfig {
    headers?: Record<string, string>
    params?: Record<string, string | number | boolean>
    timeout?: number
}
