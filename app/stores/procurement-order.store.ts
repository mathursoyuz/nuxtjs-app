import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { ProcurementOrder } from '~/types/order.types'

export const useProcurementOrderStore = defineStore('procurement-order', () => {
    const ordersByClientId = ref<Record<number, ProcurementOrder[]>>({})
    const loadingByClientId = ref<Record<number, boolean>>({})
    const errorByClientId = ref<Record<number, string | null>>({})

    function ordersForClient(clientId: number): ProcurementOrder[] {
        return ordersByClientId.value[clientId] ?? []
    }

    function isLoadingClient(clientId: number): boolean {
        return loadingByClientId.value[clientId] ?? false
    }

    function errorForClient(clientId: number): string | null {
        return errorByClientId.value[clientId] ?? null
    }

    function setOrders(clientId: number, orders: ProcurementOrder[]): void {
        ordersByClientId.value = {
            ...ordersByClientId.value,
            [clientId]: orders,
        }
    }

    function setLoading(clientId: number, loading: boolean): void {
        loadingByClientId.value = {
            ...loadingByClientId.value,
            [clientId]: loading,
        }
    }

    function setError(clientId: number, error: string | null): void {
        errorByClientId.value = {
            ...errorByClientId.value,
            [clientId]: error,
        }
    }

    return {
        ordersByClientId,
        loadingByClientId,
        errorByClientId,
        ordersForClient,
        isLoadingClient,
        errorForClient,
        setOrders,
        setLoading,
        setError,
    }
})
