import type { AxiosResponse, AxiosError } from 'axios'
import type { ApiErrorResponse } from '~/types/errors.types'
import { isApiErrorResponse } from '~/types/errors.types'
import { GENERAL_MESSAGES } from '~/constants/messages.constants'

export function createResponseInterceptor() {
    return (response: AxiosResponse): AxiosResponse => {
        // Note: Per-request loading removed - using task-based loading instead
        // Tasks are managed at component/page level
        return response
    }
}

export function createResponseErrorInterceptor() {
    return async (error: AxiosError<ApiErrorResponse>): Promise<never> => {
        // Note: Per-request loading removed - using task-based loading instead
        // Tasks are managed at component/page level

        if (error.response) {
            const { status, data } = error.response
            const isLoginOrRegister =
                error.config?.url?.includes('/auth/login') ||
                error.config?.url?.includes('/auth/register')

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
                        const { useAuthStore } = await import('~/stores/auth.store')
                        const authStore = useAuthStore()
                        await authStore.handleUnauthorized()
                    } catch (err) {
                        console.error('Error handling 401:', err)
                    }
                }
            }

            // Handle 403 - Forbidden (no permission)
            if (status === 403) {
                const message = data?.message || data?.error || GENERAL_MESSAGES.FORBIDDEN
                if (typeof window !== 'undefined') {
                    try {
                        const { useToast } = await import('~/composables/useToast')
                        const toast = useToast()
                        if (toast && toast.error) {
                            toast.error(message)
                        }
                    } catch (err) {
                        console.error('Error showing toast:', err)
                    }
                }
            }

            // Handle 422 - Validation errors (field-level errors)
            // These will be handled by the calling code to show field-level errors

            // Handle other errors - show toast notification
            if (status !== 401 && status !== 403 && status !== 422) {
                const message = data?.message || data?.error || GENERAL_MESSAGES.ERROR
                if (typeof window !== 'undefined') {
                    try {
                        const { useToast } = await import('~/composables/useToast')
                        const toast = useToast()
                        if (toast && toast.error) {
                            toast.error(message)
                        }
                    } catch (err) {
                        console.error('Error showing toast:', err)
                    }
                }
            }
        } else if (error.request) {
            // Network error
            if (typeof window !== 'undefined') {
                try {
                    const { useToast } = await import('~/composables/useToast')
                    const toast = useToast()
                    if (toast && toast.error) {
                        toast.error(GENERAL_MESSAGES.NETWORK_ERROR)
                    }
                } catch (err) {
                    console.error('Error showing toast:', err)
                }
            }
        } else {
            // Request setup error
            if (typeof window !== 'undefined') {
                try {
                    const { useToast } = await import('~/composables/useToast')
                    const toast = useToast()
                    if (toast && toast.error) {
                        toast.error(GENERAL_MESSAGES.UNEXPECTED_ERROR)
                    }
                } catch (err) {
                    console.error('Error showing toast:', err)
                }
            }
        }

        return Promise.reject(error)
    }
}
