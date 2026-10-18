import { AUTHORIZATION_HEADER, BEARER_PREFIX } from '~/constants/auth.constants'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'

export interface RequestInterceptorConfig {
    bearerToken: string | null
    authToken: string | null
}

export function createRequestInterceptor(config: RequestInterceptorConfig) {
    return (axiosConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
        // Add Bearer token (app-level authentication)
        if (config.bearerToken) {
            axiosConfig.headers['X-App-Token'] = config.bearerToken
        }

        // Add JWT token (user-level authentication)
        if (config.authToken) {
            axiosConfig.headers[AUTHORIZATION_HEADER] = `${BEARER_PREFIX}${config.authToken}`
        }

        // Note: Per-request loading removed - using task-based loading instead
        // Tasks are managed at component/page level

        return axiosConfig
    }
}

export function createRequestErrorInterceptor() {
    return (error: unknown): Promise<never> => {
        return Promise.reject(error)
    }
}
