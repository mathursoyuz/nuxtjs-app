import { computed } from 'vue'
import { useNuxtApp } from '#app'
import { useCustomerStore } from '~/stores/customer.store'
import { useToast } from '~/composables/useToast'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import type {
    CreateCustomerDTO,
    UpdateCustomerDTO,
    CustomerShippingAddressDTO,
    PaginatedCustomersResponse,
} from '~/services/api/wrappers/customer.api'
import {
    organisationContextRevision,
    isOrganisationContextCurrent,
} from '~/services/context/organisation-context-reset.registry'

export function useCustomer() {
    const nuxtApp = useNuxtApp()
    const customerStore = useCustomerStore()
    const customerApi =
        nuxtApp.$customerApi as import('~/services/api/wrappers/customer.api').CustomerApiService
    const { successFromResponse, errorFromError } = useToast()

    if (!customerApi) {
        throw new Error('CustomerApiService not available')
    }

    const fetchCustomers = async (
        organisationId: number | null | undefined,
        page: number = 1,
        limit: number = 25,
        search?: string
    ): Promise<PaginatedCustomersResponse> => {
        const contextRevision = organisationContextRevision()
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.getAllCustomers(organisationId, page, limit, search)
            if (response.success && response.data) {
                if (!isOrganisationContextCurrent(contextRevision)) return response.data
                customerStore.setCustomers(response.data.customers)
                customerStore.setPagination({
                    total: response.data.total,
                    page: response.data.page,
                    limit: response.data.limit,
                    totalPages: response.data.totalPages,
                })
                successFromResponse(response, CUSTOMER_MESSAGES.FETCH_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to fetch customers')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to fetch customers'
            if (isOrganisationContextCurrent(contextRevision)) {
                customerStore.setError(errorMessage)
                errorFromError(error, CUSTOMER_MESSAGES.FETCH_ERROR)
            }
            throw error
        } finally {
            if (isOrganisationContextCurrent(contextRevision)) customerStore.setLoading(false)
        }
    }

    const fetchCustomerById = async (
        customerId: number
    ): Promise<import('~/services/api/wrappers/customer.api').Customer> => {
        const contextRevision = organisationContextRevision()
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.getCustomerById(customerId)
            if (response.success && response.data) {
                if (isOrganisationContextCurrent(contextRevision))
                    customerStore.setCurrentCustomer(response.data)
                successFromResponse(response, CUSTOMER_MESSAGES.FETCH_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to fetch customer')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch customer'
            if (isOrganisationContextCurrent(contextRevision)) {
                customerStore.setError(errorMessage)
                errorFromError(error, CUSTOMER_MESSAGES.FETCH_ERROR)
            }
            throw error
        } finally {
            if (isOrganisationContextCurrent(contextRevision)) customerStore.setLoading(false)
        }
    }

    const createCustomer = async (
        data: CreateCustomerDTO
    ): Promise<import('~/services/api/wrappers/customer.api').Customer> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.createCustomer(data)
            if (response.success && response.data) {
                customerStore.addCustomer(response.data)
                successFromResponse(response, CUSTOMER_MESSAGES.CREATE_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to create customer')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to create customer'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.CREATE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const updateCustomer = async (
        customerId: number,
        data: UpdateCustomerDTO
    ): Promise<import('~/services/api/wrappers/customer.api').Customer> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.updateCustomer(customerId, data)
            if (response.success && response.data) {
                customerStore.updateCustomer(response.data)
                successFromResponse(response, CUSTOMER_MESSAGES.UPDATE_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to update customer')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to update customer'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.UPDATE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const addShippingAddress = async (
        customerId: number,
        data: CustomerShippingAddressDTO
    ): Promise<import('~/services/api/wrappers/customer.api').CustomerShippingAddress> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.addShippingAddress(customerId, data)
            if (response.success && response.data) {
                customerStore.addShippingAddress(customerId, response.data)
                successFromResponse(response, CUSTOMER_MESSAGES.SHIPPING_ADD_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to add shipping address')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to add shipping address'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.SHIPPING_SAVE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const updateShippingAddress = async (
        customerId: number,
        shippingId: number,
        data: CustomerShippingAddressDTO
    ): Promise<import('~/services/api/wrappers/customer.api').CustomerShippingAddress> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.updateShippingAddress(customerId, shippingId, data)
            if (response.success && response.data) {
                customerStore.updateShippingAddress(customerId, shippingId, response.data)
                successFromResponse(response, CUSTOMER_MESSAGES.SHIPPING_UPDATE_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to update shipping address')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to update shipping address'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.SHIPPING_SAVE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const deleteShippingAddress = async (customerId: number, shippingId: number): Promise<void> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.deleteShippingAddress(customerId, shippingId)
            if (!response.success) {
                throw new Error(response.message || 'Failed to delete shipping address')
            }
            customerStore.removeShippingAddress(customerId, shippingId)
            successFromResponse(response, CUSTOMER_MESSAGES.SHIPPING_REMOVE_SUCCESS)
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to delete shipping address'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.SHIPPING_REMOVE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const checkEmailExists = async (email: string, customerId?: number): Promise<boolean> => {
        const response = await customerApi.checkEmailExists(email, customerId)
        return response.data?.available ?? false
    }

    const uploadImage = async (customerId: number, file: File): Promise<void> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.uploadCustomerImage(customerId, file)
            if (!response.success) {
                throw new Error(response.message || 'Failed to upload image')
            }
            successFromResponse(response, 'Customer image uploaded successfully')
            await fetchCustomerById(customerId)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.AVATAR_UPDATE_FAILED)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const toggleActive = async (
        customerId: number,
        isActive: boolean
    ): Promise<import('~/services/api/wrappers/customer.api').Customer> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.toggleActive(customerId, isActive)
            if (response.success && response.data) {
                customerStore.updateCustomer(response.data)
                const fallbackMessage = isActive
                    ? 'Customer activated successfully'
                    : 'Customer deactivated successfully'
                successFromResponse(response, fallbackMessage)
                return response.data
            }
            throw new Error(response.message || 'Failed to toggle customer status')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to toggle customer status'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.UPDATE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const syncCustomerToQB = async (
        customerId: number
    ): Promise<{ created: boolean; qbId: string }> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.syncCustomerToQB(customerId)
            if (response.success && response.data) {
                successFromResponse(response, CUSTOMER_MESSAGES.SYNC_QB_SUCCESS)
                // Refresh customers to get updated sync status
                await fetchCustomers(null, 1, 10)
                return response.data
            }
            throw new Error(response.message || 'Failed to sync customer to QuickBooks')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to sync customer to QuickBooks'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.SYNC_QB_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const importCustomersFromQB = async (): Promise<{
        created: number
        updated: number
        skipped: number
        errors: Array<{ item: string; error: string }>
    }> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.importCustomersFromQB()
            if (response.success && response.data) {
                successFromResponse(response, CUSTOMER_MESSAGES.IMPORT_QB_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to import customers from QuickBooks')
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to import customers from QuickBooks'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.IMPORT_QB_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const importCustomersFromSquare = async (): Promise<{
        created: number
        updated: number
        skipped: number
        errors: Array<{ item: string; error: string }>
    }> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.importCustomersFromSquare()
            if (response.success && response.data) {
                successFromResponse(response, CUSTOMER_MESSAGES.IMPORT_SQUARE_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to import customers from Square')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to import customers from Square'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.IMPORT_SQUARE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const syncCustomerToSquare = async (
        customerId: number
    ): Promise<{ created: boolean; squareId: string }> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.syncCustomerToSquare(customerId)
            if (response.success && response.data) {
                successFromResponse(response, CUSTOMER_MESSAGES.SYNC_SQUARE_SUCCESS)
                // Refresh customers to get updated sync status
                await fetchCustomers(null, 1, 10)
                return response.data
            }
            throw new Error(response.message || 'Failed to sync customer to Square')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to sync customer to Square'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.SYNC_SQUARE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    const deleteCustomer = async (customerId: number): Promise<void> => {
        customerStore.setLoading(true)
        customerStore.clearError()

        try {
            const response = await customerApi.deleteCustomer(customerId)
            if (response.success) {
                customerStore.removeCustomer(customerId)
                successFromResponse(response, CUSTOMER_MESSAGES.DELETE_SUCCESS)
            } else {
                throw new Error(response.message || 'Failed to delete customer')
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to delete customer'
            customerStore.setError(errorMessage)
            errorFromError(error, CUSTOMER_MESSAGES.DELETE_ERROR)
            throw error
        } finally {
            customerStore.setLoading(false)
        }
    }

    return {
        customers: computed(() => customerStore.customers),
        currentCustomer: computed(() => customerStore.currentCustomer),
        loading: computed(() => customerStore.loading),
        error: computed(() => customerStore.error),
        activeCustomers: computed(() => customerStore.activeCustomers),
        pagination: computed(() => customerStore.pagination),
        fetchCustomers,
        fetchCustomerById,
        createCustomer,
        updateCustomer,
        addShippingAddress,
        updateShippingAddress,
        deleteShippingAddress,
        checkEmailExists,
        uploadImage,
        toggleActive,
        syncCustomerToQB,
        importCustomersFromQB,
        importCustomersFromSquare,
        syncCustomerToSquare,
        deleteCustomer,
    }
}
