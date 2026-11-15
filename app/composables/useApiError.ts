import { isAxiosError, type AxiosError } from 'axios'
import type { ApiErrorResponse, FieldErrors } from '~/types/errors.types'
import { isApiErrorResponse } from '~/types/errors.types'
import { GENERAL_MESSAGES } from '~/constants/messages.constants'

export const useApiError = (): {
    getErrorMessage: (error: unknown) => string
    getFieldErrors: (error: AxiosError<ApiErrorResponse>) => FieldErrors
    hasFieldErrors: (error: AxiosError<ApiErrorResponse>) => boolean
    handleApiError: (error: AxiosError<ApiErrorResponse>) => {
        message: string
        fieldErrors: FieldErrors
    }
} => {
    /**
     * Parse API error and extract user-friendly message
     * @param error - Axios error or unknown error
     * @returns User-friendly error message
     */
    const getErrorMessage = (error: unknown): string => {
        if (isApiErrorResponse(error)) {
            return error.message
        }

        if (isAxiosError<ApiErrorResponse>(error) && isApiErrorResponse(error.response?.data)) {
            return error.response.data.message
        }

        if (error instanceof Error) {
            return error.message
        }

        return GENERAL_MESSAGES.UNEXPECTED_ERROR
    }

    /**
     * Extract field-level errors from API error response
     * @param error - Axios error
     * @returns Field errors object
     */
    const getFieldErrors = (error: AxiosError<ApiErrorResponse>): FieldErrors => {
        return fieldErrorsFromDetails(error.response?.data.error.details)
    }

    /**
     * Check if error has field-level errors (422 status)
     * @param error - Axios error
     * @returns true if error has field-level errors
     */
    const hasFieldErrors = (error: AxiosError<ApiErrorResponse>): boolean => {
        return error.response?.status === 422 && thisHasFieldDetails(error.response.data)
    }

    /**
     * Handle API error - extract message and field errors
     * @param error - Axios error
     * @returns Object with message and field errors
     */
    const handleApiError = (
        error: AxiosError<ApiErrorResponse>
    ): { message: string; fieldErrors: FieldErrors } => {
        const message = getErrorMessage(error.response?.data || error)
        const fieldErrors = getFieldErrors(error)

        return { message, fieldErrors }
    }

    return {
        getErrorMessage,
        getFieldErrors,
        hasFieldErrors,
        handleApiError,
    }
}

const thisHasFieldDetails = (response: ApiErrorResponse | undefined): boolean => {
    return Object.keys(fieldErrorsFromDetails(response?.error.details)).length > 0
}

const fieldErrorsFromDetails = (details: unknown): FieldErrors => {
    if (Array.isArray(details)) {
        return details.reduce<FieldErrors>((errors, detail) => {
            if (typeof detail !== 'string') return errors
            const separator = detail.indexOf(':')
            const field = separator > 0 ? detail.slice(0, separator).trim() : 'form'
            const message = separator > 0 ? detail.slice(separator + 1).trim() : detail.trim()
            if (!message) return errors
            errors[field] = [...(errors[field] ?? []), message]
            return errors
        }, {})
    }

    if (!details || typeof details !== 'object') return {}

    return Object.entries(details).reduce<FieldErrors>((errors, [field, value]) => {
        const messages = Array.isArray(value)
            ? value.filter((message): message is string => typeof message === 'string')
            : typeof value === 'string'
              ? [value]
              : []
        if (messages.length > 0) errors[field] = messages
        return errors
    }, {})
}
