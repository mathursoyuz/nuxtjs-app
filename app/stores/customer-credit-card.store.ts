import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'

export const useCustomerCreditCardStore = defineStore('customer-credit-card', () => {
    const cardsByCustomer = ref<Record<number, CustomerCreditCard[]>>({})
    const loading = ref(false)
    const error = ref<string | null>(null)

    const cardsForCustomer = computed(
        () => (customerId: number) => cardsByCustomer.value[customerId] ?? []
    )

    function setCards(customerId: number, cards: CustomerCreditCard[]): void {
        cardsByCustomer.value[customerId] = cards
    }

    function setLoading(value: boolean): void {
        loading.value = value
    }

    function setError(value: string | null): void {
        error.value = value
    }

    return {
        cardsByCustomer,
        cardsForCustomer,
        loading,
        error,
        setCards,
        setLoading,
        setError,
    }
})
