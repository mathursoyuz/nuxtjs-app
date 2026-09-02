import type { ApiResponse, ApiError, RequestConfig } from '~/types/api.types';

export interface ApiClient {
    get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
    post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
    put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
    patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>>;
    delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>>;
    setAuthToken(token: string | null): void;
    setBearerToken(token: string | null): void;
}
