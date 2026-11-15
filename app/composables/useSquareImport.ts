import { computed, ref, shallowRef } from 'vue'
import { useNuxtApp } from '#app'
import type { SquareImportApiService } from '~/services/api/wrappers/square-import.api'
import type {
    SquareCategory,
    SquareProduct,
    SquareLocation,
    SquareTransaction,
    SquareVendor,
    SquareDiscount,
    SquareCustomer,
    SearchResponse,
} from '~/types/square-import.types'

type SquareImportEntity =
    | SquareCategory
    | SquareProduct
    | SquareLocation
    | SquareTransaction
    | SquareVendor
    | SquareDiscount
    | SquareCustomer

export const useSquareImport = <T extends SquareImportEntity = SquareImportEntity>() => {
    const nuxtApp = useNuxtApp()
    const squareImportApi =
        nuxtApp.$squareImportApi as import('~/services/api/wrappers/square-import.api').SquareImportApiService

    const loading = ref(false)
    const importing = ref(false)
    const fetchedData = shallowRef<SearchResponse<T>>({
        data: [],
    })
    const selectedItems = ref<string[]>([])

    const hasSelectedItems = computed(() => selectedItems.value.length > 0)
    const allSelected = computed(
        () =>
            fetchedData.value.data.length > 0 &&
            fetchedData.value.data.every((item) => selectedItems.value.includes(item.id))
    )

    const selectAll = (): void => {
        selectedItems.value = allSelected.value ? [] : fetchedData.value.data.map((item) => item.id)
    }

    const clearSelection = () => {
        selectedItems.value = []
    }

    const operations = {
        searchCategories: (
            ...args: Parameters<SquareImportApiService['searchCategories']>
        ): ReturnType<SquareImportApiService['searchCategories']> =>
            squareImportApi.searchCategories(...args),
        importCategories: (
            ...args: Parameters<SquareImportApiService['importCategories']>
        ): ReturnType<SquareImportApiService['importCategories']> =>
            squareImportApi.importCategories(...args),
        searchProducts: (
            ...args: Parameters<SquareImportApiService['searchProducts']>
        ): ReturnType<SquareImportApiService['searchProducts']> =>
            squareImportApi.searchProducts(...args),
        importProducts: (
            ...args: Parameters<SquareImportApiService['importProducts']>
        ): ReturnType<SquareImportApiService['importProducts']> =>
            squareImportApi.importProducts(...args),
        searchLocations: (
            ...args: Parameters<SquareImportApiService['searchLocations']>
        ): ReturnType<SquareImportApiService['searchLocations']> =>
            squareImportApi.searchLocations(...args),
        importLocations: (
            ...args: Parameters<SquareImportApiService['importLocations']>
        ): ReturnType<SquareImportApiService['importLocations']> =>
            squareImportApi.importLocations(...args),
        searchTransactions: (
            ...args: Parameters<SquareImportApiService['searchTransactions']>
        ): ReturnType<SquareImportApiService['searchTransactions']> =>
            squareImportApi.searchTransactions(...args),
        importTransactions: (
            ...args: Parameters<SquareImportApiService['importTransactions']>
        ): ReturnType<SquareImportApiService['importTransactions']> =>
            squareImportApi.importTransactions(...args),
        searchVendors: (
            ...args: Parameters<SquareImportApiService['searchVendors']>
        ): ReturnType<SquareImportApiService['searchVendors']> =>
            squareImportApi.searchVendors(...args),
        importVendors: (
            ...args: Parameters<SquareImportApiService['importVendors']>
        ): ReturnType<SquareImportApiService['importVendors']> =>
            squareImportApi.importVendors(...args),
        searchDiscounts: (
            ...args: Parameters<SquareImportApiService['searchDiscounts']>
        ): ReturnType<SquareImportApiService['searchDiscounts']> =>
            squareImportApi.searchDiscounts(...args),
        importDiscounts: (
            ...args: Parameters<SquareImportApiService['importDiscounts']>
        ): ReturnType<SquareImportApiService['importDiscounts']> =>
            squareImportApi.importDiscounts(...args),
        batchSync: (
            ...args: Parameters<SquareImportApiService['batchSync']>
        ): ReturnType<SquareImportApiService['batchSync']> => squareImportApi.batchSync(...args),
        getAllCustomers: (
            ...args: Parameters<SquareImportApiService['getAllCustomers']>
        ): ReturnType<SquareImportApiService['getAllCustomers']> =>
            squareImportApi.getAllCustomers(...args),
        searchCustomers: (
            ...args: Parameters<SquareImportApiService['searchCustomers']>
        ): ReturnType<SquareImportApiService['searchCustomers']> =>
            squareImportApi.searchCustomers(...args),
        importCustomers: (
            ...args: Parameters<SquareImportApiService['importCustomers']>
        ): ReturnType<SquareImportApiService['importCustomers']> =>
            squareImportApi.importCustomers(...args),
        fetchAndImportCustomers: (
            ...args: Parameters<SquareImportApiService['fetchAndImportCustomers']>
        ): ReturnType<SquareImportApiService['fetchAndImportCustomers']> =>
            squareImportApi.fetchAndImportCustomers(...args),
        fetchCustomersWithCursor: (
            ...args: Parameters<SquareImportApiService['fetchCustomersWithCursor']>
        ): ReturnType<SquareImportApiService['fetchCustomersWithCursor']> =>
            squareImportApi.fetchCustomersWithCursor(...args),
        fetchAndStoreCustomersWithCursor: (
            ...args: Parameters<SquareImportApiService['fetchAndStoreCustomersWithCursor']>
        ): ReturnType<SquareImportApiService['fetchAndStoreCustomersWithCursor']> =>
            squareImportApi.fetchAndStoreCustomersWithCursor(...args),
        storeSelectedCustomers: (
            ...args: Parameters<SquareImportApiService['storeSelectedCustomers']>
        ): ReturnType<SquareImportApiService['storeSelectedCustomers']> =>
            squareImportApi.storeSelectedCustomers(...args),
        getAllInventory: (
            ...args: Parameters<SquareImportApiService['getAllInventory']>
        ): ReturnType<SquareImportApiService['getAllInventory']> =>
            squareImportApi.getAllInventory(...args),
    }

    return {
        loading,
        importing,
        fetchedData,
        selectedItems,
        hasSelectedItems,
        allSelected,
        selectAll,
        clearSelection,
        operations,
    }
}
