import { computed } from 'vue'
import { useNuxtApp } from '#app'
import { useCustomerCreditCardStore } from '~/stores/customer-credit-card.store'
import type {
    CreateCustomerCreditCardDTO,
    CustomerCreditCard,
    CustomerCreditCardApiService,
} from '~/services/api/wrappers/customer-credit-card.api'
import {
    organisationContextRevision,
    isOrganisationContextCurrent,
} from '~/services/context/organisation-context-reset.registry'

export function useCustomerCreditCards(customerId: number | (() => number | null)) {
    const nuxtApp = useNuxtApp()
    const store = useCustomerCreditCardStore()
    const customerCreditCardApi = nuxtApp.$customerCreditCardApi as CustomerCreditCardApiService

    const resolvedCustomerId = computed(() =>
        typeof customerId === 'function' ? customerId() : customerId
    )
    const cards = computed(() => {
        const id = resolvedCustomerId.value
        return id ? store.cardsForCustomer(id) : []
    })

    async function fetchCards(): Promise<CustomerCreditCard[]> {
        const contextRevision = organisationContextRevision()
        const id = resolvedCustomerId.value
        if (!id) return []

        store.setLoading(true)
        store.setError(null)
        try {
            const response = await customerCreditCardApi.getAllCustomerCreditCards(id)
            const data = response.data ?? []
            if (isOrganisationContextCurrent(contextRevision)) store.setCards(id, data)
            return data
        } catch (error) {
            if (isOrganisationContextCurrent(contextRevision))
                store.setError(
                    error instanceof Error ? error.message : 'Failed to load credit cards'
                )
            throw error
        } finally {
            if (isOrganisationContextCurrent(contextRevision)) store.setLoading(false)
        }
    }

    async function addCard(data: CreateCustomerCreditCardDTO): Promise<CustomerCreditCard> {
        const id = resolvedCustomerId.value
        if (!id) throw new Error('Customer is required')

        store.setLoading(true)
        store.setError(null)
        try {
            const response = await customerCreditCardApi.createCustomerCreditCard(id, data)
            if (!response.data) throw new Error(response.message || 'Failed to add credit card')
            await fetchCards()
            return response.data
        } catch (error) {
            store.setError(error instanceof Error ? error.message : 'Failed to add credit card')
            throw error
        } finally {
            store.setLoading(false)
        }
    }

    async function activateCard(cardId: number): Promise<void> {
        const id = resolvedCustomerId.value
        if (!id) throw new Error('Customer is required')

        store.setLoading(true)
        store.setError(null)
        try {
            await customerCreditCardApi.toggleActive(id, cardId, true)
            await fetchCards()
        } catch (error) {
            store.setError(
                error instanceof Error ? error.message : 'Failed to activate credit card'
            )
            throw error
        } finally {
            store.setLoading(false)
        }
    }

    return {
        cards,
        loading: computed(() => store.loading),
        error: computed(() => store.error),
        fetchCards,
        addCard,
        activateCard,
    }
}
