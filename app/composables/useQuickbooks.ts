import { computed } from 'vue';
import { useNuxtApp } from '#app';
import { useQuickBooksStore } from '~/stores/quickbooks.store';

export function useQuickbooks() {
    const nuxtApp = useNuxtApp();
    const quickbooksStore = useQuickBooksStore();
    const quickbooksApi = nuxtApp.$quickbooksApi as import('~/services/api/wrappers/quickbooks.api').QuickBooksApiService;

    if (!quickbooksApi) {
        throw new Error('QuickBooksApiService not available');
    }

    const initiateAuth = () => {
        const authUrl = quickbooksApi.getAuthUrl();
        window.location.href = authUrl;
    };

    const handleAuthCallback = async (code: string, realmId: string) => {
        quickbooksStore.setLoading(true);
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.handleAuthCallback(code, realmId);
            if (response.success && response.data) {
                quickbooksStore.setConnected(true);
                return response.data;
            }
            throw new Error(response.message || 'Failed to authenticate');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate';
            quickbooksStore.setError(errorMessage);
            throw error;
        } finally {
            quickbooksStore.setLoading(false);
        }
    };

    const refreshToken = async (slug: string) => {
        quickbooksStore.setLoading(true);
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.refreshToken(slug);
            if (response.success) {
                return response.data;
            }
            throw new Error(response.message || 'Failed to refresh token');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to refresh token';
            quickbooksStore.setError(errorMessage);
            throw error;
        } finally {
            quickbooksStore.setLoading(false);
        }
    };

    const importCategories = async () => {
        quickbooksStore.setSyncStatus('categories', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.importCategories();
            if (response.success) {
                quickbooksStore.setSyncStatus('categories', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to import categories');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import categories';
            quickbooksStore.setSyncStatus('categories', 'error', errorMessage);
            throw error;
        }
    };

    const syncCategoryToQB = async (categoryId: number) => {
        quickbooksStore.setSyncStatus('categories', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.syncCategoryToQB(categoryId);
            if (response.success) {
                quickbooksStore.setSyncStatus('categories', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to sync category');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sync category';
            quickbooksStore.setSyncStatus('categories', 'error', errorMessage);
            throw error;
        }
    };

    const batchSyncCategoriesToQB = async () => {
        quickbooksStore.setSyncStatus('categories', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.batchSyncCategoriesToQB();
            if (response.success) {
                quickbooksStore.setSyncStatus('categories', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to batch sync categories');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to batch sync categories';
            quickbooksStore.setSyncStatus('categories', 'error', errorMessage);
            throw error;
        }
    };

    const importProducts = async () => {
        quickbooksStore.setSyncStatus('products', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.importProducts();
            if (response.success) {
                quickbooksStore.setSyncStatus('products', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to import products');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import products';
            quickbooksStore.setSyncStatus('products', 'error', errorMessage);
            throw error;
        }
    };

    const syncProductToQB = async (productId: number) => {
        quickbooksStore.setSyncStatus('products', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.syncProductToQB(productId);
            if (response.success) {
                quickbooksStore.setSyncStatus('products', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to sync product');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sync product';
            quickbooksStore.setSyncStatus('products', 'error', errorMessage);
            throw error;
        }
    };

    const batchSyncProductsToQB = async () => {
        quickbooksStore.setSyncStatus('products', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.batchSyncProductsToQB();
            if (response.success) {
                quickbooksStore.setSyncStatus('products', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to batch sync products');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to batch sync products';
            quickbooksStore.setSyncStatus('products', 'error', errorMessage);
            throw error;
        }
    };

    const importCustomers = async () => {
        quickbooksStore.setSyncStatus('customers', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.importCustomers();
            if (response.success) {
                quickbooksStore.setSyncStatus('customers', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to import customers');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import customers';
            quickbooksStore.setSyncStatus('customers', 'error', errorMessage);
            throw error;
        }
    };

    const syncCustomerToQB = async (customerId: number) => {
        quickbooksStore.setSyncStatus('customers', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.syncCustomerToQB(customerId);
            if (response.success) {
                quickbooksStore.setSyncStatus('customers', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to sync customer');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to sync customer';
            quickbooksStore.setSyncStatus('customers', 'error', errorMessage);
            throw error;
        }
    };

    const batchSyncCustomersToQB = async () => {
        quickbooksStore.setSyncStatus('customers', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.batchSyncCustomersToQB();
            if (response.success) {
                quickbooksStore.setSyncStatus('customers', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to batch sync customers');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to batch sync customers';
            quickbooksStore.setSyncStatus('customers', 'error', errorMessage);
            throw error;
        }
    };

    const importTransactions = async (type?: string) => {
        quickbooksStore.setSyncStatus('transactions', 'syncing');
        quickbooksStore.clearError();

        try {
            const response = await quickbooksApi.importTransactions(type);
            if (response.success) {
                quickbooksStore.setSyncStatus('transactions', 'success');
                return response.data;
            }
            throw new Error(response.message || 'Failed to import transactions');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import transactions';
            quickbooksStore.setSyncStatus('transactions', 'error', errorMessage);
            throw error;
        }
    };

    return {
        isConnected: computed(() => quickbooksStore.isConnected),
        syncStatus: computed(() => quickbooksStore.syncStatus),
        loading: computed(() => quickbooksStore.loading),
        error: computed(() => quickbooksStore.error),
        isCategorySyncing: computed(() => quickbooksStore.isCategorySyncing),
        isProductSyncing: computed(() => quickbooksStore.isProductSyncing),
        isCustomerSyncing: computed(() => quickbooksStore.isCustomerSyncing),
        isTransactionSyncing: computed(() => quickbooksStore.isTransactionSyncing),
        initiateAuth,
        handleAuthCallback,
        refreshToken,
        importCategories,
        syncCategoryToQB,
        batchSyncCategoriesToQB,
        importProducts,
        syncProductToQB,
        batchSyncProductsToQB,
        importCustomers,
        syncCustomerToQB,
        batchSyncCustomersToQB,
        importTransactions,
    };
}
