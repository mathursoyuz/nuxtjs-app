import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Customer, CustomerShippingAddress } from '~/services/api/wrappers/customer.api'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

interface PaginationState {
    total: number
    page: number
    limit: number
    totalPages: number
}

export const useCustomerStore = defineStore('customer', () => {
    const customers = ref<Customer[]>([])
    const currentCustomer = ref<Customer | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const pagination = ref<PaginationState | null>(null)

    const activeCustomers = computed(() => customers.value.filter((customer) => customer.isActive))
    const customerById = computed(
        () => (id: number) => customers.value.find((customer) => customer.id === id)
    )

    const setCustomers = (value: Customer[]): void => {
        customers.value = value
    }

    const setCurrentCustomer = (value: Customer | null): void => {
        currentCustomer.value = value
    }

    const addCustomer = (customer: Customer): void => {
        customers.value.push(customer)
    }

    const updateCustomer = (customer: Customer): void => {
        const index = customers.value.findIndex((item) => item.id === customer.id)
        if (index >= 0) customers.value[index] = customer
        if (currentCustomer.value?.id === customer.id) currentCustomer.value = customer
    }

    const removeCustomer = (id: number): void => {
        customers.value = customers.value.filter((customer) => customer.id !== id)
        if (currentCustomer.value?.id === id) currentCustomer.value = null
    }

    const addShippingAddress = (customerId: number, address: CustomerShippingAddress): void => {
        const listedCustomer = customers.value.find((customer) => customer.id === customerId)
        if (listedCustomer) {
            listedCustomer.shippingAddresses ??= []
            listedCustomer.shippingAddresses.push(address)
        }

        if (currentCustomer.value?.id === customerId && currentCustomer.value !== listedCustomer) {
            currentCustomer.value.shippingAddresses ??= []
            currentCustomer.value.shippingAddresses.push(address)
        }
    }

    const updateShippingAddress = (
        customerId: number,
        addressId: number,
        address: CustomerShippingAddress
    ): void => {
        const listedCustomer = customers.value.find((customer) => customer.id === customerId)
        replaceShippingAddress(listedCustomer, addressId, address)
        if (currentCustomer.value !== listedCustomer) {
            replaceShippingAddress(currentCustomer.value, addressId, address)
        }
    }

    const removeShippingAddress = (customerId: number, addressId: number): void => {
        const listedCustomer = customers.value.find((customer) => customer.id === customerId)
        deleteShippingAddressFromCustomer(listedCustomer, addressId)
        if (currentCustomer.value !== listedCustomer) {
            deleteShippingAddressFromCustomer(currentCustomer.value, addressId)
        }
    }

    const replaceShippingAddress = (
        customer: Customer | null | undefined,
        addressId: number,
        address: CustomerShippingAddress
    ): void => {
        if (!customer?.shippingAddresses) return
        const index = customer.shippingAddresses.findIndex((item) => item.id === addressId)
        if (index >= 0) customer.shippingAddresses[index] = address
    }

    const deleteShippingAddressFromCustomer = (
        customer: Customer | null | undefined,
        addressId: number
    ): void => {
        if (!customer?.shippingAddresses) return
        customer.shippingAddresses = customer.shippingAddresses.filter(
            (address) => address.id !== addressId
        )
    }

    const setLoading = (value: boolean): void => {
        loading.value = value
    }

    const setError = (value: string | null): void => {
        error.value = value
    }

    const clearError = (): void => {
        error.value = null
    }

    const setPagination = (value: PaginationState): void => {
        pagination.value = value
    }

    const clearPagination = (): void => {
        pagination.value = null
    }

    const resetForOrganisationContext = (): void => {
        customers.value = []
        currentCustomer.value = null
        pagination.value = null
        loading.value = false
        error.value = null
    }

    registerOrganisationContextReset('customers', resetForOrganisationContext)

    return {
        customers,
        currentCustomer,
        loading,
        error,
        pagination,
        activeCustomers,
        customerById,
        setCustomers,
        setCurrentCustomer,
        addCustomer,
        updateCustomer,
        removeCustomer,
        addShippingAddress,
        updateShippingAddress,
        removeShippingAddress,
        setLoading,
        setError,
        clearError,
        setPagination,
        clearPagination,
        resetForOrganisationContext,
    }
})
