import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';
import type {
    SquareCategory,
    SquareProduct,
    SquareLocation,
    SquareTransaction,
    SquareVendor,
    SquareDiscount,
    SearchResponse,
} from '~/types/square-import.types';

export function useSquareImport<T extends SquareCategory | SquareProduct | SquareLocation | SquareTransaction | SquareVendor | SquareDiscount>() {
    const nuxtApp = useNuxtApp();
    const squareImportApi = nuxtApp.$squareImportApi as import('~/services/api/wrappers/square-import.api').SquareImportApiService;

    const loading = ref(false);
    const importing = ref(false);
    const fetchedData = ref<SearchResponse<T>>({
        data: [],
    });
    const selectedItems = ref<string[]>([]);

    const hasSelectedItems = computed(() => selectedItems.value.length > 0);

    const clearSelection = () => {
        selectedItems.value = [];
    };

    return {
        loading,
        importing,
        fetchedData,
        selectedItems,
        hasSelectedItems,
        clearSelection,
        squareImportApi
    };
}
