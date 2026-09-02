import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';
import type {
    SquareCategory,
    SquareProduct,
    SquareLocation,
    SquareTransaction,
    SquareVendor,
    SquareDiscount,
    SquareCustomer,
    SyncResult,
    SearchResponse,
    ImportResponse,
    BatchSyncResponse,
} from '~/types/square-import.types';

/**
 * Square Import API wrapper service
 */
export class SquareImportApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    // Categories
    async searchCategories(): Promise<ApiResponse<SquareCategory[]>> {
        return this.cachedApi.get<SquareCategory[]>(
            '/square-import/categories/search',
            undefined,
            'square-import:categories:search',
            0
        );
    }

    async importCategories(categories?: SquareCategory[]): Promise<ApiResponse<{ data: SquareCategory[]; result: SyncResult }>> {
        return this.cachedApi.post<{ data: SquareCategory[]; result: SyncResult }>('/square-import/categories/import', { categories }, undefined, 'square-import:categories:.*');
    }

    // Products
    async searchProducts(params?: {
        categoryIds?: string[];
        locationIds?: string[];
        squareVariationIds?: string[];
        skus?: string[];
        limit?: number;
    }): Promise<ApiResponse<SquareProduct[]>> {
        const queryParams: Record<string, string> = {};
        if (params?.categoryIds?.length) queryParams.categoryIds = params.categoryIds.join(',');
        if (params?.locationIds?.length) queryParams.locationIds = params.locationIds.join(',');
        if (params?.squareVariationIds?.length) queryParams.squareVariationIds = params.squareVariationIds.join(',');
        if (params?.skus?.length) queryParams.skus = params.skus.join(',');
        if (params?.limit) queryParams.limit = params.limit.toString();

        return this.cachedApi.get<SquareProduct[]>(
            '/square-import/products/search',
            { params: queryParams },
            undefined, // Let it auto-generate cache key based on params
            0, // TTL 0 means don't cache
            true // Skip cache to always fetch fresh data
        );
    }

    async importProducts(products?: SquareProduct[]): Promise<ApiResponse<{ data: SquareProduct[]; result: SyncResult }>> {
        return this.cachedApi.post<{ data: SquareProduct[]; result: SyncResult }>('/square-import/products/import', { products }, undefined, 'square-import:products:.*');
    }

    // Locations
    async searchLocations(): Promise<ApiResponse<SquareLocation[]>> {
        return this.cachedApi.get<SquareLocation[]>(
            '/square-import/locations/search',
            undefined,
            'square-import:locations:search',
            0
        );
    }

    async importLocations(locations?: SquareLocation[]): Promise<ApiResponse<{ data: SquareLocation[]; result: SyncResult }>> {
        return this.cachedApi.post<{ data: SquareLocation[]; result: SyncResult }>('/square-import/locations/import', { locations }, undefined, 'square-import:locations:.*');
    }

    // Transactions
    async searchTransactions(params?: {
        beginTime?: string;
        endTime?: string;
        cursor?: string;
        limit?: number;
    }): Promise<ApiResponse<SquareTransaction[]>> {
        const queryParams: Record<string, string> = {};
        if (params?.beginTime) queryParams.beginTime = params.beginTime;
        if (params?.endTime) queryParams.endTime = params.endTime;
        if (params?.cursor) queryParams.cursor = params.cursor;
        if (params?.limit) queryParams.limit = params.limit.toString();

        return this.cachedApi.get<SquareTransaction[]>(
            '/square-import/transactions/search',
            { params: queryParams },
            'square-import:transactions:search',
            0
        );
    }

    async importTransactions(transactions?: SquareTransaction[]): Promise<ApiResponse<{ data: SquareTransaction[]; result: SyncResult }>> {
        return this.cachedApi.post<{ data: SquareTransaction[]; result: SyncResult }>('/square-import/transactions/import', { transactions }, undefined, 'square-import:transactions:.*');
    }

    // Vendors
    async searchVendors(): Promise<ApiResponse<SquareVendor[]>> {
        return this.cachedApi.get<SquareVendor[]>(
            '/square-import/vendors/search',
            undefined,
            'square-import:vendors:search',
            0
        );
    }

    async importVendors(vendors?: SquareVendor[]): Promise<ApiResponse<{ data: SquareVendor[]; result: SyncResult }>> {
        return this.cachedApi.post<{ data: SquareVendor[]; result: SyncResult }>('/square-import/vendors/import', { vendors }, undefined, 'square-import:vendors:.*');
    }

    // Discounts
    async searchDiscounts(): Promise<ApiResponse<SquareDiscount[]>> {
        return this.cachedApi.get<SquareDiscount[]>(
            '/square-import/discounts/search',
            undefined,
            'square-import:discounts:search',
            0
        );
    }

    async importDiscounts(discounts?: SquareDiscount[]): Promise<ApiResponse<{ data: SquareDiscount[]; result: SyncResult }>> {
        return this.cachedApi.post<{ data: SquareDiscount[]; result: SyncResult }>('/square-import/discounts/import', { discounts }, undefined, 'square-import:discounts:.*');
    }

    // Batch Sync
    async batchSync(params: {
        entity: string;
        batchSize?: number;
        cursor?: string;
        beginTime?: string;
        endTime?: string;
        defaultClientId?: number;
    }): Promise<ApiResponse<BatchSyncResponse>> {
        const queryParams: Record<string, string> = {
            entity: params.entity,
        };
        if (params.batchSize) queryParams.batchSize = params.batchSize.toString();
        if (params.cursor) queryParams.cursor = params.cursor;
        if (params.beginTime) queryParams.beginTime = params.beginTime;
        if (params.endTime) queryParams.endTime = params.endTime;
        if (params.defaultClientId) queryParams.defaultClientId = params.defaultClientId.toString();

        return this.cachedApi.post<BatchSyncResponse>(
            '/square-import/batch/sync',
            {},
            { params: queryParams },
            'square-import:batch:.*'
        );
    }

    // Customers
    async getAllCustomers(): Promise<ApiResponse<SquareCustomer[]>> {
        return this.cachedApi.get<SquareCustomer[]>(
            '/square-import/customers',
            undefined,
            'square-import:customers:all',
            0
        );
    }

    async searchCustomers(params?: {
        email?: string;
        phoneNumber?: string;
        createdAtFrom?: string;
        createdAtTo?: string;
        updatedAtFrom?: string;
        updatedAtTo?: string;
        customAttributeKey?: string;
        customAttributeValue?: string;
    }): Promise<ApiResponse<SquareCustomer[]>> {
        const queryParams: Record<string, string> = {};
        if (params?.email) queryParams.email = params.email;
        if (params?.phoneNumber) queryParams.phoneNumber = params.phoneNumber;
        if (params?.createdAtFrom) queryParams.createdAtFrom = params.createdAtFrom;
        if (params?.createdAtTo) queryParams.createdAtTo = params.createdAtTo;
        if (params?.updatedAtFrom) queryParams.updatedAtFrom = params.updatedAtFrom;
        if (params?.updatedAtTo) queryParams.updatedAtTo = params.updatedAtTo;
        if (params?.customAttributeKey) queryParams.customAttributeKey = params.customAttributeKey;
        if (params?.customAttributeValue) queryParams.customAttributeValue = params.customAttributeValue;

        return this.cachedApi.get<SquareCustomer[]>(
            '/square-import/customers/search',
            { params: queryParams },
            undefined, // Let it auto-generate cache key based on params
            0, // TTL 0 means don't cache
            true // Skip cache to always fetch fresh data
        );
    }

    async importCustomers(customers?: SquareCustomer[], clientId?: number): Promise<ApiResponse<{ data: SquareCustomer[]; result: SyncResult }>> {
        const queryParams: Record<string, string> = {};
        if (clientId) queryParams.clientId = clientId.toString();

        return this.cachedApi.post<{ data: SquareCustomer[]; result: SyncResult }>(
            '/square-import/customers/import',
            { customers },
            { params: queryParams },
            'square-import:customers:.*'
        );
    }

    async fetchAndImportCustomers(clientId?: number): Promise<ApiResponse<{ data: SquareCustomer[]; result: SyncResult }>> {
        const queryParams: Record<string, string> = {};
        if (clientId) queryParams.clientId = clientId.toString();

        return this.cachedApi.post<{ data: SquareCustomer[]; result: SyncResult }>(
            '/square-import/customers/fetch-and-import',
            {},
            { params: queryParams },
            'square-import:customers:.*'
        );
    }

    // New cursor-based pagination methods
    async fetchCustomersWithCursor(cursor?: string): Promise<ApiResponse<{
        customers: SquareCustomer[];
        cursor?: string;
        hasMore: boolean;
        count?: number;
    }>> {
        const queryParams: Record<string, string> = {};
        if (cursor) queryParams.cursor = cursor;

        return this.cachedApi.get<{
            customers: SquareCustomer[];
            cursor?: string;
            hasMore: boolean;
        }>(
            '/square-import/customers/fetch',
            { params: queryParams },
            undefined, // No cache key for pagination
            0, // TTL 0 means don't cache
            true // Skip cache to always fetch fresh data
        );
    }

    async fetchAndStoreCustomersWithCursor(cursor?: string, clientId?: number): Promise<ApiResponse<{
        result: SyncResult;
        cursor?: string;
        hasMore: boolean;
    }>> {
        const queryParams: Record<string, string> = {};
        if (cursor) queryParams.cursor = cursor;
        if (clientId) queryParams.clientId = clientId.toString();

        return this.cachedApi.post<{
            result: SyncResult;
            cursor?: string;
            hasMore: boolean;
        }>(
            '/square-import/customers/fetch-and-store',
            {},
            { params: queryParams },
            'square-import:customers:.*'
        );
    }

    async storeSelectedCustomers(customers: SquareCustomer[], clientId?: number): Promise<ApiResponse<{ data: SquareCustomer[]; result: SyncResult }>> {
        const queryParams: Record<string, string> = {};
        if (clientId) queryParams.clientId = clientId.toString();

        return this.cachedApi.post<{ data: SquareCustomer[]; result: SyncResult }>(
            '/square-import/customers/store-selected',
            { customers },
            { params: queryParams },
            'square-import:customers:.*'
        );
    }

    // Inventory
    async getAllInventory(clientId: number): Promise<ApiResponse<Array<{
        id: number;
        productId: number;
        squareVariationId: string;
        locationId: number;
        qtyCustom: number;
        qtyInStock: number;
        qtySold: number;
        qtySoldOnline: number;
        qtyReservedForSale: number;
        qtyReturnedByCustomer: number;
        qtyWaitingForSupplier: number;
        qtyOrderedFromVendor: number;
        qtyNone: number;
        qtyDamaged: number;
        qtyWaste: number;
        qtyUnlinkedReturn: number;
        qtyComposed: number;
        qtyDecomposed: number;
        qtySupportedByNewerVersion: number;
        qtyInTransit: number;
        qtyOnHand: number;
        lastSyncedAt: string | null;
        updatedAt: string;
        createdAt: string;
        product: {
            id: number;
            name: string;
            sku: string;
            squareVariationId: string | null;
        } | null;
        location: {
            id: number;
            name: string;
            squareLocationId: string | null;
        } | null;
    }>>> {
        return this.cachedApi.get<Array<{
            id: number;
            productId: number;
            squareVariationId: string;
            locationId: number;
            qtyCustom: number;
            qtyInStock: number;
            qtySold: number;
            qtySoldOnline: number;
            qtyReservedForSale: number;
            qtyReturnedByCustomer: number;
            qtyWaitingForSupplier: number;
            qtyOrderedFromVendor: number;
            qtyNone: number;
            qtyDamaged: number;
            qtyWaste: number;
            qtyUnlinkedReturn: number;
            qtyComposed: number;
            qtyDecomposed: number;
            qtySupportedByNewerVersion: number;
            qtyInTransit: number;
            qtyOnHand: number;
            lastSyncedAt: string | null;
            updatedAt: string;
            createdAt: string;
            product: {
                id: number;
                name: string;
                sku: string;
                squareVariationId: string | null;
            } | null;
            location: {
                id: number;
                name: string;
                squareLocationId: string | null;
            } | null;
        }>>(
            `/clients/${clientId}/square-import/inventory`,
            undefined,
            `square-import:inventory:${clientId}`,
            0
        );
    }
}
