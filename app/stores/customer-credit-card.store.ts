import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useCustomerCreditCardStore = defineStore('customer-credit-card', () => {
    const cardsByCustomer = ref<Record<number, CustomerCreditCard[]>>({})
    const loading = ref(false)
    const error = ref<string | null>(null)

    const cardsForCustomer = computed(
        () => (customerId: number) => cardsByCustomer.value[customerId] ?? []
    )

    const setCards = (customerId: number, cards: CustomerCreditCard[]): void => {
        cardsByCustomer.value[customerId] = cards
    }

    const setLoading = (value: boolean): void => {
        loading.value = value
    }

    const setError = (value: string | null): void => {
        error.value = value
    }

    const resetForOrganisationContext = (): void => {
        cardsByCustomer.value = {}
        loading.value = false
        error.value = null
    }

    registerOrganisationContextReset('customer-credit-cards', resetForOrganisationContext)

    return {
        cardsByCustomer,
        cardsForCustomer,
        loading,
        error,
        setCards,
        setLoading,
        setError,
        resetForOrganisationContext,
    }
})
