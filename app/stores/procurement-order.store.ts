import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ProcurementOrder } from '~/types/order.types'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useProcurementOrderStore = defineStore('procurement-order', () => {
    const ordersByOrganisationId = ref<Record<number, ProcurementOrder[]>>({})
    const loadingByOrganisationId = ref<Record<number, boolean>>({})
    const errorByOrganisationId = ref<Record<number, string | null>>({})

    function ordersForOrganisation(organisationId: number): ProcurementOrder[] {
        return ordersByOrganisationId.value[organisationId] ?? []
    }

    function isLoadingOrganisation(organisationId: number): boolean {
        return loadingByOrganisationId.value[organisationId] ?? false
    }

    function errorForOrganisation(organisationId: number): string | null {
        return errorByOrganisationId.value[organisationId] ?? null
    }

    function setOrders(organisationId: number, orders: ProcurementOrder[]): void {
        ordersByOrganisationId.value = {
            ...ordersByOrganisationId.value,
            [organisationId]: orders,
        }
    }

    function setLoading(organisationId: number, loading: boolean): void {
        loadingByOrganisationId.value = {
            ...loadingByOrganisationId.value,
            [organisationId]: loading,
        }
    }

    function setError(organisationId: number, error: string | null): void {
        errorByOrganisationId.value = {
            ...errorByOrganisationId.value,
            [organisationId]: error,
        }
    }

    function resetForOrganisationContext(): void {
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
