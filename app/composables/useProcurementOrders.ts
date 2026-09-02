import { useNuxtApp } from '#app'
import { useProcurementOrderStore } from '~/stores/procurement-order.store'
import { useToast } from '~/composables/useToast'
import type { ProcurementOrder } from '~/types/order.types'

const PROCUREMENT_ORDER_LOAD_ERROR = 'Failed to load procurement orders'

export function useProcurementOrders() {
    const nuxtApp = useNuxtApp()
    const procurementOrderStore = useProcurementOrderStore()
    const clientProductApi =
        nuxtApp.$clientProductApi as import('~/services/api/wrappers/client-product.api').ClientProductApiService
    const { errorFromError } = useToast()

    if (!clientProductApi) {
        throw new Error('ClientProductApiService is not available')
    }

    async function fetchProcurementOrders(
        clientId: number,
        forceRefresh = false
    ): Promise<ProcurementOrder[]> {
        procurementOrderStore.setLoading(clientId, true)
        procurementOrderStore.setError(clientId, null)

        try {
            const response = await clientProductApi.getProcurementOrders(
                clientId,
                undefined,
                forceRefresh
            )
            const orders = response.data?.data ?? []
            procurementOrderStore.setOrders(clientId, orders)
            return orders
        } catch (error) {
            const message = error instanceof Error ? error.message : PROCUREMENT_ORDER_LOAD_ERROR
            procurementOrderStore.setOrders(clientId, [])
            procurementOrderStore.setError(clientId, message)
            errorFromError(error, PROCUREMENT_ORDER_LOAD_ERROR)
            return []
        } finally {
            procurementOrderStore.setLoading(clientId, false)
        }
    }

    return {
        ordersForClient: procurementOrderStore.ordersForClient,
        isLoadingClient: procurementOrderStore.isLoadingClient,
        errorForClient: procurementOrderStore.errorForClient,
        fetchProcurementOrders,
    }
}
