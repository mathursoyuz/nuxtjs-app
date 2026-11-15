import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

type SyncEntity = 'categories' | 'products' | 'customers' | 'transactions'
type SyncState = 'idle' | 'syncing' | 'success' | 'error'

interface SyncStatus {
    status: SyncState
    lastSync?: Date
    error?: string
}

export const useQuickBooksStore = defineStore('quickbooks', () => {
    const isConnected = ref(false)
    const syncStatus = ref<Record<SyncEntity, SyncStatus>>({
        categories: { status: 'idle' },
        products: { status: 'idle' },
        customers: { status: 'idle' },
        transactions: { status: 'idle' },
    })
    const loading = ref(false)
    const error = ref<string | null>(null)

    const isCategorySyncing = computed(() => syncStatus.value.categories.status === 'syncing')
    const isProductSyncing = computed(() => syncStatus.value.products.status === 'syncing')
    const isCustomerSyncing = computed(() => syncStatus.value.customers.status === 'syncing')
    const isTransactionSyncing = computed(() => syncStatus.value.transactions.status === 'syncing')

    const setConnected = (value: boolean): void => {
        isConnected.value = value
    }

    const setSyncStatus = (entity: SyncEntity, status: SyncState, syncError?: string): void => {
        const previous = syncStatus.value[entity]
        syncStatus.value[entity] = {
            status,
            lastSync: status === 'success' ? new Date() : previous.lastSync,
            error: status === 'error' ? syncError : undefined,
        }
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

    return {
        isConnected,
        syncStatus,
        loading,
        error,
        isCategorySyncing,
        isProductSyncing,
        isCustomerSyncing,
        isTransactionSyncing,
        setConnected,
        setSyncStatus,
        setLoading,
        setError,
        clearError,
    }
})
