import { AUTH_ENDPOINT, AUTHORIZATION_HEADER, BEARER_PREFIX } from '~/constants/auth.constants'
import type { AxiosResponse, AxiosError } from 'axios'
import type { ApiErrorResponse } from '~/types/errors.types'
import { GENERAL_MESSAGES } from '~/constants/messages.constants'

const responseMessage = (response: ApiErrorResponse | undefined, fallbackMessage: string): string =>
    response?.message?.trim() || fallbackMessage

const showErrorToast = async (message: string): Promise<void> => {
    if (typeof window === 'undefined') return
    try {
        const { useToast } = await import('~/composables/useToast')
        useToast().error(message)
    } catch {
        console.error('Unable to show the API error notification')
    }
}

export const createResponseInterceptor = (): ((response: AxiosResponse) => AxiosResponse) => {
    return (response: AxiosResponse): AxiosResponse => {
        // Note: Per-request loading removed - using task-based loading instead
        // Tasks are managed at component/page level
        return response
    }
}

export const createResponseErrorInterceptor = (): ((
    error: AxiosError<ApiErrorResponse>
) => Promise<never>) => {
    return async (error: AxiosError<ApiErrorResponse>): Promise<never> => {
        // Note: Per-request loading removed - using task-based loading instead
        // Tasks are managed at component/page level

        if (error.response) {
            const { status, data } = error.response
            const isLoginOrRegister =
                error.config?.url === AUTH_ENDPOINT.LOGIN ||
                error.config?.url === AUTH_ENDPOINT.REGISTER

            // Handle 401 - Unauthorized (token expired/invalid)
            if (status === 401) {
                if (typeof window !== 'undefined') {
                    try {
                        // If it's a login/register request, don't logout - just let the error propagate
                        // The login/register page will handle showing the error message
                        if (isLoginOrRegister) {
                            // Don't show toast here - let the component handle it
                            return Promise.reject(error)
                        }

                        // Keep session cleanup and navigation in one idempotent store action.
                        const { useSessionStore } = await import('~/stores/session.store')
                        const session = useSessionStore()
                        const header = error.config?.headers?.[AUTHORIZATION_HEADER]
                        if (typeof header === 'string' && header.startsWith(BEARER_PREFIX))
                            await session.handleUnauthorized(header.slice(BEARER_PREFIX.length))
                    } catch {
                        console.error('Unable to clear the unauthorized session')
                    }
                }
            }

            // Handle 403 - Forbidden (no permission)
            if (status === 403) {
                await showErrorToast(responseMessage(data, GENERAL_MESSAGES.FORBIDDEN))
            }

            // Handle 422 - Validation errors (field-level errors)
            // These will be handled by the calling code to show field-level errors

            // Handle other errors - show toast notification
            if (status !== 401 && status !== 403 && status !== 422) {
                await showErrorToast(responseMessage(data, GENERAL_MESSAGES.ERROR))
            }
        } else if (error.request) {
            await showErrorToast(GENERAL_MESSAGES.NETWORK_ERROR)
        } else {
            await showErrorToast(GENERAL_MESSAGES.UNEXPECTED_ERROR)
        }

        return Promise.reject(error)
    }
}
