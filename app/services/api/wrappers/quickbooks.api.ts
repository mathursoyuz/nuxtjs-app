import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'

export interface QuickBooksAuthResponse {
    accessToken: string
    refreshToken: string
    realmId: string
}

export interface QuickBooksCategory {
    Id: string
    Name: string
    FullyQualifiedName: string
    Active: boolean
    SubCategory: boolean
    SyncToken: string
}

export interface QuickBooksLocalProductMapping {
    id: number
    name: string
    sku: string | null
    isQbSynced: boolean
}

export interface QuickBooksProduct {
    Id: string
    Name: string
    SKU: string
    QtyOnHand: number
    Type: string
    Active: boolean
    SyncToken: string
    localProduct?: QuickBooksLocalProductMapping | null
}

export interface QuickBooksCustomer {
    Id: string
    DisplayName: string
    PrimaryEmailAddr: { Address: string }
    GivenName: string
    FamilyName: string
    Active: boolean
    SyncToken: string
}

export interface QuickBooksTransaction {
    Id: string
    TxnDate: string
    TotalAmt: number
    TxnType: string
    SyncToken: string
}

/**
 * QuickBooks API wrapper service
 */
export class QuickBooksApiService extends HttpFactory {
    // Auth endpoints
    getAuthUrl(): string {
        // Return the auth URL for the frontend to handle redirect
        return '/quickbooks/auth/get-auth-token'
    }

    async handleAuthCallback(
        code: string,
        realmId: string
    ): Promise<ApiResponse<QuickBooksAuthResponse>> {
        return await this.call<QuickBooksAuthResponse>(
            'GET',
            `/quickbooks/auth/auth-callback?code=${code}&realmId=${realmId}`
        )
    }

    async refreshToken(slug: string): Promise<ApiResponse<{ accessToken: string }>> {
        return await this.call<{ accessToken: string }>(
            'GET',
            `/quickbooks/auth/${slug}/refresh-token`,
            undefined,
            { cacheKey: `qb:auth:${slug}`, ttl: 5 * 60 * 1000 }
        )
    }

    // Category endpoints
    async getCategories(): Promise<ApiResponse<QuickBooksCategory[]>> {
        return await this.call<QuickBooksCategory[]>('GET', '/quickbooks/categories', undefined, {
            cacheKey: 'qb:categories',
            ttl: 5 * 60 * 1000,
        })
    }

    async getCategoryById(slug: string, id: string): Promise<ApiResponse<QuickBooksCategory>> {
        return await this.call<QuickBooksCategory>(
            'GET',
            `/quickbooks/categories/${id}?slug=${slug}`,
            undefined,
            { cacheKey: `qb:categories:${slug}:${id}`, ttl: 5 * 60 * 1000 }
        )
    }

    async createCategory(
        slug: string,
        data: Partial<QuickBooksCategory>
    ): Promise<ApiResponse<QuickBooksCategory>> {
        return await this.call<QuickBooksCategory, Partial<QuickBooksCategory>>(
            'POST',
            `/quickbooks/categories/create?slug=${slug}`,
            data,
            { invalidatePattern: `qb:categories:${slug}.*` }
        )
    }

    async updateCategory(
        slug: string,
        id: string,
        data: Partial<QuickBooksCategory>
    ): Promise<ApiResponse<QuickBooksCategory>> {
        const input = { ...data, Id: id }
        return await this.call<QuickBooksCategory, typeof input>(
            'POST',
            `/quickbooks/categories/update?slug=${slug}`,
            input,
            { invalidatePattern: `qb:categories:${slug}.*` }
        )
    }

    async deleteCategory(slug: string, id: string): Promise<ApiResponse<void>> {
        return await this.call<void, Record<string, never>>(
            'POST',
            `/quickbooks/categories/delete/${id}?slug=${slug}`,
            {},
            { invalidatePattern: `qb:categories:${slug}.*` }
        )
    }

    // Product endpoints
    async getProducts(): Promise<ApiResponse<QuickBooksProduct[]>> {
        return await this.call<QuickBooksProduct[]>('GET', '/quickbooks/products', undefined, {
            cacheKey: 'qb:products',
            ttl: 5 * 60 * 1000,
        })
    }

    async getProductById(slug: string, id: string): Promise<ApiResponse<QuickBooksProduct>> {
        return await this.call<QuickBooksProduct>(
            'GET',
            `/quickbooks/products/${id}?slug=${slug}`,
            undefined,
            { cacheKey: `qb:products:${slug}:${id}`, ttl: 5 * 60 * 1000 }
        )
    }

    async createProduct(
        slug: string,
        data: Partial<QuickBooksProduct>
    ): Promise<ApiResponse<QuickBooksProduct>> {
        return await this.call<QuickBooksProduct, Partial<QuickBooksProduct>>(
            'POST',
            `/quickbooks/products/create?slug=${slug}`,
            data,
            { invalidatePattern: `qb:products:${slug}.*` }
        )
    }

    async updateProduct(
        slug: string,
        id: string,
        data: Partial<QuickBooksProduct>
    ): Promise<ApiResponse<QuickBooksProduct>> {
        const input = { ...data, Id: id }
        return await this.call<QuickBooksProduct, typeof input>(
            'POST',
            `/quickbooks/products/update?slug=${slug}`,
            input,
            { invalidatePattern: `qb:products:${slug}.*` }
        )
    }

    async deleteProduct(slug: string, id: string): Promise<ApiResponse<void>> {
        return await this.call<void, Record<string, never>>(
            'POST',
            `/quickbooks/products/delete/${id}?slug=${slug}`,
            {},
            { invalidatePattern: `qb:products:${slug}.*` }
        )
    }

    // Customer endpoints
    async getCustomers(): Promise<ApiResponse<QuickBooksCustomer[]>> {
        return await this.call<QuickBooksCustomer[]>('GET', '/quickbooks/customers', undefined, {
            cacheKey: 'qb:customers',
            ttl: 5 * 60 * 1000,
        })
    }

    async getCustomerById(slug: string, id: string): Promise<ApiResponse<QuickBooksCustomer>> {
        return await this.call<QuickBooksCustomer>(
            'GET',
            `/quickbooks/customers/${id}?slug=${slug}`,
            undefined,
            { cacheKey: `qb:customers:${slug}:${id}`, ttl: 5 * 60 * 1000 }
        )
    }

    async createCustomer(
        slug: string,
        data: Partial<QuickBooksCustomer>
    ): Promise<ApiResponse<QuickBooksCustomer>> {
        return await this.call<QuickBooksCustomer, Partial<QuickBooksCustomer>>(
            'POST',
            `/quickbooks/customers/create?slug=${slug}`,
            data,
            { invalidatePattern: `qb:customers:${slug}.*` }
        )
    }

    async updateCustomer(
        slug: string,
        id: string,
        data: Partial<QuickBooksCustomer>
    ): Promise<ApiResponse<QuickBooksCustomer>> {
        const input = { ...data, Id: id }
        return await this.call<QuickBooksCustomer, typeof input>(
            'POST',
            `/quickbooks/customers/update?slug=${slug}`,
            input,
            { invalidatePattern: `qb:customers:${slug}.*` }
        )
    }

    async deleteCustomer(slug: string, id: string): Promise<ApiResponse<void>> {
        return await this.call<void, Record<string, never>>(
            'POST',
            `/quickbooks/customers/delete/${id}?slug=${slug}`,
            {},
            { invalidatePattern: `qb:customers:${slug}.*` }
        )
    }

    // Sync endpoints
    async importCategories(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/categories/import',
            {},
            { invalidatePattern: 'categories:.*' }
        )
    }

    async syncCategoryToQB(categoryId: number): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            `/quickbooks-sync/categories/${categoryId}/sync-to-qb`,
            {},
            { invalidatePattern: 'categories:.*' }
        )
    }

    async batchSyncCategoriesToQB(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/categories/batch-sync-to-qb',
            {},
            { invalidatePattern: 'categories:.*' }
        )
    }

    // Product sync endpoints
    async fetchProductsFromQB(): Promise<ApiResponse<QuickBooksProduct[]>> {
        return await this.call<QuickBooksProduct[], Record<string, never>>(
            'POST',
            '/quickbooks-sync/products/fetch',
            {},
            { invalidatePattern: 'qb:products:fetch' }
        )
    }

    async storeSelectedProductsToLocal(
        products: QuickBooksProduct[]
    ): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, { products: QuickBooksProduct[] }>(
            'POST',
            '/quickbooks-sync/products/store-selected',
            { products },
            { invalidatePattern: 'products:.*' }
        )
    }

    async importProducts(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/products/import',
            {},
            { invalidatePattern: 'products:.*' }
        )
    }

    async syncProductToQB(productId: number): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            `/quickbooks-sync/products/${productId}/sync-to-qb`,
            {},
            { invalidatePattern: 'products:.*' }
        )
    }

    async batchSyncProductsToQB(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/products/batch-sync-to-qb',
            {},
            { invalidatePattern: 'products:.*' }
        )
    }

    async importCustomers(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/customers/import',
            {},
            { invalidatePattern: 'customers:.*' }
        )
    }

    async syncCustomerToQB(customerId: number): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            `/quickbooks-sync/customers/${customerId}/sync-to-qb`,
            {},
            { invalidatePattern: 'customers:.*' }
        )
    }

    async batchSyncCustomersToQB(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/customers/batch-sync-to-qb',
            {},
            { invalidatePattern: 'customers:.*' }
        )
    }

    async importTransactions(type?: string): Promise<ApiResponse<unknown>> {
        const params = type ? { type } : undefined
        return await this.call<unknown, Record<string, never>>(
            'POST',
            '/quickbooks-sync/transactions/import',
            {},
            {
                config: params ? { params } : undefined,
                invalidatePattern: 'transactions:.*',
            }
        )
    }

    async getTransactions(type?: string): Promise<ApiResponse<QuickBooksTransaction[]>> {
        const params = type ? { type } : undefined
        return await this.call<QuickBooksTransaction[]>(
            'GET',
            '/quickbooks/transactions',
            undefined,
            {
                config: params ? { params } : undefined,
                cacheKey: `qb:transactions:${type ?? 'all'}`,
                ttl: 5 * 60 * 1000,
            }
        )
    }

    // Company endpoints
    async getCompanies(): Promise<
        ApiResponse<Array<{ id: number; name: string; realmId: string; slug: string }>>
    > {
        return await this.call<
            Array<{ id: number; name: string; realmId: string; slug: string }>
        >('GET', '/quickbooks/companies', undefined, {
            cacheKey: 'qb:companies',
            ttl: 5 * 60 * 1000,
        })
    }
}

export default QuickBooksApiService
