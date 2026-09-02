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

    function setConnected(value: boolean): void {
        isConnected.value = value
    }

    function setSyncStatus(entity: SyncEntity, status: SyncState, syncError?: string): void {
        const previous = syncStatus.value[entity]
        syncStatus.value[entity] = {
            status,
            lastSync: status === 'success' ? new Date() : previous.lastSync,
            error: status === 'error' ? syncError : undefined,
        }
    }

    function setLoading(value: boolean): void {
        loading.value = value
    }

    function setError(value: string | null): void {
        error.value = value
    }

    function clearError(): void {
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
