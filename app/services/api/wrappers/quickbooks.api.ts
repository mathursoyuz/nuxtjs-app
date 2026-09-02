import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface QuickBooksAuthResponse {
    accessToken: string;
    refreshToken: string;
    realmId: string;
}

export interface QuickBooksCategory {
    Id: string;
    Name: string;
    FullyQualifiedName: string;
    Active: boolean;
    SubCategory: boolean;
    SyncToken: string;
}

export interface QuickBooksLocalProductMapping {
    id: number;
    name: string;
    sku: string | null;
    isQbSynced: boolean;
}

export interface QuickBooksProduct {
    Id: string;
    Name: string;
    SKU: string;
    QtyOnHand: number;
    Type: string;
    Active: boolean;
    SyncToken: string;
    localProduct?: QuickBooksLocalProductMapping | null;
}

export interface QuickBooksCustomer {
    Id: string;
    DisplayName: string;
    PrimaryEmailAddr: { Address: string };
    GivenName: string;
    FamilyName: string;
    Active: boolean;
    SyncToken: string;
}

export interface QuickBooksTransaction {
    Id: string;
    TxnDate: string;
    TotalAmt: number;
    TxnType: string;
    SyncToken: string;
}

/**
 * QuickBooks API wrapper service
 */
export class QuickBooksApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    // Auth endpoints
    getAuthUrl(): string {
        // Return the auth URL for the frontend to handle redirect
        return '/quickbooks/auth/get-auth-token';
    }

    async handleAuthCallback(code: string, realmId: string): Promise<ApiResponse<QuickBooksAuthResponse>> {
        return this.cachedApi.get<QuickBooksAuthResponse>(`/quickbooks/auth/auth-callback?code=${code}&realmId=${realmId}`);
    }

    async refreshToken(slug: string): Promise<ApiResponse<{ accessToken: string }>> {
        return this.cachedApi.get<{ accessToken: string }>(`/quickbooks/auth/${slug}/refresh-token`, undefined, `qb:auth:${slug}`, 5 * 60 * 1000);
    }

    // Category endpoints
    async getCategories(): Promise<ApiResponse<QuickBooksCategory[]>> {
        return this.cachedApi.get<QuickBooksCategory[]>(`/quickbooks/categories`, undefined, `qb:categories`, 5 * 60 * 1000);
    }

    async getCategoryById(slug: string, id: string): Promise<ApiResponse<QuickBooksCategory>> {
        return this.cachedApi.get<QuickBooksCategory>(`/quickbooks/categories/${id}?slug=${slug}`, undefined, `qb:categories:${slug}:${id}`, 5 * 60 * 1000);
    }

    async createCategory(slug: string, data: Partial<QuickBooksCategory>): Promise<ApiResponse<QuickBooksCategory>> {
        const response = await this.cachedApi.post<QuickBooksCategory>(`/quickbooks/categories/create?slug=${slug}`, data, undefined, `qb:categories:${slug}.*`);
        return response;
    }

    async updateCategory(slug: string, id: string, data: Partial<QuickBooksCategory>): Promise<ApiResponse<QuickBooksCategory>> {
        const response = await this.cachedApi.post<QuickBooksCategory>(`/quickbooks/categories/update?slug=${slug}`, { ...data, Id: id }, undefined, `qb:categories:${slug}.*`);
        return response;
    }

    async deleteCategory(slug: string, id: string): Promise<ApiResponse<void>> {
        const response = await this.cachedApi.post<void>(`/quickbooks/categories/delete/${id}?slug=${slug}`, {}, undefined, `qb:categories:${slug}.*`);
        return response;
    }

    // Product endpoints
    async getProducts(): Promise<ApiResponse<QuickBooksProduct[]>> {
        return this.cachedApi.get<QuickBooksProduct[]>(`/quickbooks/products`, undefined, `qb:products`, 5 * 60 * 1000);
    }

    async getProductById(slug: string, id: string): Promise<ApiResponse<QuickBooksProduct>> {
        return this.cachedApi.get<QuickBooksProduct>(`/quickbooks/products/${id}?slug=${slug}`, undefined, `qb:products:${slug}:${id}`, 5 * 60 * 1000);
    }

    async createProduct(slug: string, data: Partial<QuickBooksProduct>): Promise<ApiResponse<QuickBooksProduct>> {
        const response = await this.cachedApi.post<QuickBooksProduct>(`/quickbooks/products/create?slug=${slug}`, data, undefined, `qb:products:${slug}.*`);
        return response;
    }

    async updateProduct(slug: string, id: string, data: Partial<QuickBooksProduct>): Promise<ApiResponse<QuickBooksProduct>> {
        const response = await this.cachedApi.post<QuickBooksProduct>(`/quickbooks/products/update?slug=${slug}`, { ...data, Id: id }, undefined, `qb:products:${slug}.*`);
        return response;
    }

    async deleteProduct(slug: string, id: string): Promise<ApiResponse<void>> {
        const response = await this.cachedApi.post<void>(`/quickbooks/products/delete/${id}?slug=${slug}`, {}, undefined, `qb:products:${slug}.*`);
        return response;
    }

    // Customer endpoints
    async getCustomers(): Promise<ApiResponse<QuickBooksCustomer[]>> {
        return this.cachedApi.get<QuickBooksCustomer[]>(`/quickbooks/customers`, undefined, `qb:customers`, 5 * 60 * 1000);
    }

    async getCustomerById(slug: string, id: string): Promise<ApiResponse<QuickBooksCustomer>> {
        return this.cachedApi.get<QuickBooksCustomer>(`/quickbooks/customers/${id}?slug=${slug}`, undefined, `qb:customers:${slug}:${id}`, 5 * 60 * 1000);
    }

    async createCustomer(slug: string, data: Partial<QuickBooksCustomer>): Promise<ApiResponse<QuickBooksCustomer>> {
        const response = await this.cachedApi.post<QuickBooksCustomer>(`/quickbooks/customers/create?slug=${slug}`, data, undefined, `qb:customers:${slug}.*`);
        return response;
    }

    async updateCustomer(slug: string, id: string, data: Partial<QuickBooksCustomer>): Promise<ApiResponse<QuickBooksCustomer>> {
        const response = await this.cachedApi.post<QuickBooksCustomer>(`/quickbooks/customers/update?slug=${slug}`, { ...data, Id: id }, undefined, `qb:customers:${slug}.*`);
        return response;
    }

    async deleteCustomer(slug: string, id: string): Promise<ApiResponse<void>> {
        const response = await this.cachedApi.post<void>(`/quickbooks/customers/delete/${id}?slug=${slug}`, {}, undefined, `qb:customers:${slug}.*`);
        return response;
    }

    // Sync endpoints
    async importCategories(): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/categories/import`, {}, undefined, 'categories:.*');
        return response;
    }

    async syncCategoryToQB(categoryId: number): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/categories/${categoryId}/sync-to-qb`, {}, undefined, 'categories:.*');
        return response;
    }

    async batchSyncCategoriesToQB(): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/categories/batch-sync-to-qb`, {}, undefined, 'categories:.*');
        return response;
    }

    // Product sync endpoints
    async fetchProductsFromQB(): Promise<ApiResponse<QuickBooksProduct[]>> {
        return this.cachedApi.post<QuickBooksProduct[]>(`/quickbooks-sync/products/fetch`, {}, undefined, 'qb:products:fetch', 5 * 60 * 1000);
    }

    async storeSelectedProductsToLocal(products: QuickBooksProduct[]): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/products/store-selected`, { products }, undefined, 'products:.*');
        return response;
    }

    async importProducts(): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/products/import`, {}, undefined, 'products:.*');
        return response;
    }

    async syncProductToQB(productId: number): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/products/${productId}/sync-to-qb`, {}, undefined, 'products:.*');
        return response;
    }

    async batchSyncProductsToQB(): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/products/batch-sync-to-qb`, {}, undefined, 'products:.*');
        return response;
    }

    async importCustomers(): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/customers/import`, {}, undefined, 'customers:.*');
        return response;
    }

    async syncCustomerToQB(customerId: number): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/customers/${customerId}/sync-to-qb`, {}, undefined, 'customers:.*');
        return response;
    }

    async batchSyncCustomersToQB(): Promise<ApiResponse<unknown>> {
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/customers/batch-sync-to-qb`, {}, undefined, 'customers:.*');
        return response;
    }

    async importTransactions(type?: string): Promise<ApiResponse<unknown>> {
        const params = type ? { type } : undefined;
        const response = await this.cachedApi.post<unknown>(`/quickbooks-sync/transactions/import`, {}, params ? { params } : undefined, 'transactions:.*');
        return response;
    }

    async getTransactions(
        type?: string
    ): Promise<ApiResponse<QuickBooksTransaction[]>> {
        const params = type ? { type } : undefined;
        return this.cachedApi.get<QuickBooksTransaction[]>(
            `/quickbooks/transactions`,
            params ? { params } : undefined,
            `qb:transactions:${type ?? 'all'}`,
            5 * 60 * 1000
        );
    }

    // Company endpoints
    async getCompanies(): Promise<ApiResponse<Array<{ id: number; name: string; realmId: string; slug: string }>>> {
        return this.cachedApi.get<Array<{ id: number; name: string; realmId: string; slug: string }>>(
            '/quickbooks/companies',
            undefined,
            'qb:companies',
            5 * 60 * 1000
        );
    }
}
