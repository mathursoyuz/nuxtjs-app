import { useNuxtApp } from '#app'
import { useProcurementOrderStore } from '~/stores/procurement-order.store'
import { useToast } from '~/composables/useToast'
import type { ProcurementOrder } from '~/types/order.types'

const PROCUREMENT_ORDER_LOAD_ERROR = 'Failed to load procurement orders'

export function useProcurementOrders() {
    const nuxtApp = useNuxtApp()
    const procurementOrderStore = useProcurementOrderStore()
    const organisationProductApi =
        nuxtApp.$organisationProductApi as import('~/services/api/wrappers/organisation-product.api').OrganisationProductApiService
    const { errorFromError } = useToast()

    if (!organisationProductApi) {
        throw new Error('OrganisationProductApiService is not available')
    }

    async function fetchProcurementOrders(
        organisationId: number,
        forceRefresh = false
    ): Promise<ProcurementOrder[]> {
        procurementOrderStore.setLoading(organisationId, true)
        procurementOrderStore.setError(organisationId, null)

        try {
            const response = await organisationProductApi.getProcurementOrders(
                organisationId,
                undefined,
                forceRefresh
            )
            const orders = response.data?.data ?? []
            procurementOrderStore.setOrders(organisationId, orders)
            return orders
        } catch (error) {
            const message = error instanceof Error ? error.message : PROCUREMENT_ORDER_LOAD_ERROR
            procurementOrderStore.setOrders(organisationId, [])
            procurementOrderStore.setError(organisationId, message)
            errorFromError(error, PROCUREMENT_ORDER_LOAD_ERROR)
            return []
        } finally {
            procurementOrderStore.setLoading(organisationId, false)
        }
    }

    return {
        ordersForOrganisation: procurementOrderStore.ordersForOrganisation,
        isLoadingOrganisation: procurementOrderStore.isLoadingOrganisation,
        errorForOrganisation: procurementOrderStore.errorForOrganisation,
        fetchProcurementOrders,
    }
}
