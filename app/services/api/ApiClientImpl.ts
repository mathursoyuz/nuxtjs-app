import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import type { ApiClient } from './ApiClient';
import type { ApiResponse, RequestConfig } from '~/types/api.types';
import { createRequestInterceptor, createRequestErrorInterceptor } from './interceptors/request.interceptor';
import { createResponseInterceptor, createResponseErrorInterceptor } from './interceptors/response.interceptor';

export class ApiClientImpl implements ApiClient {
    private client: AxiosInstance;
    private authToken: string | null = null;
    private bearerToken: string | null = null;

    constructor(baseURL: string) {
        this.client = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Setup request interceptor with closure to access current tokens
        this.client.interceptors.request.use(
            (config) => {
                return createRequestInterceptor({
                    bearerToken: this.bearerToken,
                    authToken: this.authToken,
                })(config);
            },
            createRequestErrorInterceptor()
        );

        // Setup response interceptor
        this.client.interceptors.response.use(
            createResponseInterceptor(),
            createResponseErrorInterceptor()
        );
    }

    async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        const axiosConfig: AxiosRequestConfig = {
            headers: config?.headers,
            params: config?.params,
            timeout: config?.timeout,
        };
        const response = await this.client.get<ApiResponse<T>>(url, axiosConfig);
        return response.data;
    }

    async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
        const axiosConfig: AxiosRequestConfig = {
            headers: config?.headers,
            params: config?.params,
            timeout: config?.timeout,
        };
        const response = await this.client.post<ApiResponse<T>>(url, data, axiosConfig);
        return response.data;
    }

    async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
        const axiosConfig: AxiosRequestConfig = {
            headers: config?.headers,
            params: config?.params,
            timeout: config?.timeout,
        };
        const response = await this.client.put<ApiResponse<T>>(url, data, axiosConfig);
        return response.data;
    }

    async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
        const axiosConfig: AxiosRequestConfig = {
            headers: config?.headers,
            params: config?.params,
            timeout: config?.timeout,
        };
        const response = await this.client.patch<ApiResponse<T>>(url, data, axiosConfig);
        return response.data;
    }

    async delete<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
        const axiosConfig: AxiosRequestConfig = {
            headers: config?.headers,
            params: config?.params,
            timeout: config?.timeout,
        };
        const response = await this.client.delete<ApiResponse<T>>(url, axiosConfig);
        return response.data;
    }

    setAuthToken(token: string | null): void {
        this.authToken = token;
    }

    setBearerToken(token: string | null): void {
        this.bearerToken = token;
    }
}
