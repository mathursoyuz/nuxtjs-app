import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ProcurementOrder } from '~/types/order.types'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useProcurementOrderStore = defineStore('procurement-order', () => {
    const ordersByOrganisationId = ref<Record<number, ProcurementOrder[]>>({})
    const loadingByOrganisationId = ref<Record<number, boolean>>({})
    const errorByOrganisationId = ref<Record<number, string | null>>({})

    const ordersForOrganisation = (organisationId: number): ProcurementOrder[] => {
        return ordersByOrganisationId.value[organisationId] ?? []
    }

    const isLoadingOrganisation = (organisationId: number): boolean => {
        return loadingByOrganisationId.value[organisationId] ?? false
    }

    const errorForOrganisation = (organisationId: number): string | null => {
        return errorByOrganisationId.value[organisationId] ?? null
    }

    const setOrders = (organisationId: number, orders: ProcurementOrder[]): void => {
        ordersByOrganisationId.value = {
            ...ordersByOrganisationId.value,
            [organisationId]: orders,
        }
    }

    const setLoading = (organisationId: number, loading: boolean): void => {
        loadingByOrganisationId.value = {
            ...loadingByOrganisationId.value,
            [organisationId]: loading,
        }
    }

    const setError = (organisationId: number, error: string | null): void => {
        errorByOrganisationId.value = {
            ...errorByOrganisationId.value,
            [organisationId]: error,
        }
    }

    const resetForOrganisationContext = (): void => {
        ordersByOrganisationId.value = {}
        loadingByOrganisationId.value = {}
        errorByOrganisationId.value = {}
    }

    registerOrganisationContextReset('procurement-orders', resetForOrganisationContext)

    return {
        ordersByOrganisationId,
        loadingByOrganisationId,
        errorByOrganisationId,
        ordersForOrganisation,
        isLoadingOrganisation,
        errorForOrganisation,
        setOrders,
        setLoading,
        setError,
        resetForOrganisationContext,
    }
})
