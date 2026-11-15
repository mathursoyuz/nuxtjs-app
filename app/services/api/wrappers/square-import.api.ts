import HttpFactory from '@/repository/factory';
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
    BatchSyncResponse,
} from '~/types/square-import.types';

export interface SquareImportResult<T> {
    data: T[];
    result: SyncResult;
}

export interface SquareCustomerCursorPage {
    customers: SquareCustomer[];
    cursor?: string;
    hasMore: boolean;
    count?: number;
}

export interface SquareCustomerStorePage {
    result: SyncResult;
    cursor?: string;
    hasMore: boolean;
}

export interface SquareInventoryRecord {
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
}

/**
 * Square Import API wrapper service
 */
export class SquareImportApiService extends HttpFactory {
    // Categories
    async searchCategories(): Promise<ApiResponse<SquareCategory[]>> {
        return await this.call<SquareCategory[]>(
            'GET',
            '/square-import/categories/search',
            undefined,
            { cacheKey: 'square-import:categories:search', ttl: 0 }
        );
    }

    async importCategories(categories?: SquareCategory[]): Promise<ApiResponse<SquareImportResult<SquareCategory>>> {
        return await this.call<SquareImportResult<SquareCategory>, { categories?: SquareCategory[] }>(
            'POST',
            '/square-import/categories/import',
            { categories },
            { invalidatePattern: 'square-import:categories:.*' }
        );
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

        return await this.call<SquareProduct[]>(
            'GET',
            '/square-import/products/search',
            undefined,
            { config: { params: queryParams }, ttl: 0, skipCache: true }
        );
    }

    async importProducts(products?: SquareProduct[]): Promise<ApiResponse<SquareImportResult<SquareProduct>>> {
        return await this.call<SquareImportResult<SquareProduct>, { products?: SquareProduct[] }>(
            'POST',
            '/square-import/products/import',
            { products },
            { invalidatePattern: 'square-import:products:.*' }
        );
    }

    // Locations
    async searchLocations(): Promise<ApiResponse<SquareLocation[]>> {
        return await this.call<SquareLocation[]>(
            'GET',
            '/square-import/locations/search',
            undefined,
            { cacheKey: 'square-import:locations:search', ttl: 0 }
        );
    }

    async importLocations(locations?: SquareLocation[]): Promise<ApiResponse<SquareImportResult<SquareLocation>>> {
        return await this.call<SquareImportResult<SquareLocation>, { locations?: SquareLocation[] }>(
            'POST',
            '/square-import/locations/import',
            { locations },
            { invalidatePattern: 'square-import:locations:.*' }
        );
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

        return await this.call<SquareTransaction[]>(
            'GET',
            '/square-import/transactions/search',
            undefined,
            {
                config: { params: queryParams },
                cacheKey: 'square-import:transactions:search',
                ttl: 0,
            }
        );
    }

    async importTransactions(transactions?: SquareTransaction[]): Promise<ApiResponse<SquareImportResult<SquareTransaction>>> {
        return await this.call<SquareImportResult<SquareTransaction>, { transactions?: SquareTransaction[] }>(
            'POST',
            '/square-import/transactions/import',
            { transactions },
            { invalidatePattern: 'square-import:transactions:.*' }
        );
    }

    // Vendors
    async searchVendors(): Promise<ApiResponse<SquareVendor[]>> {
        return await this.call<SquareVendor[]>(
            'GET',
            '/square-import/vendors/search',
            undefined,
            { cacheKey: 'square-import:vendors:search', ttl: 0 }
        );
    }

    async importVendors(vendors?: SquareVendor[]): Promise<ApiResponse<SquareImportResult<SquareVendor>>> {
        return await this.call<SquareImportResult<SquareVendor>, { vendors?: SquareVendor[] }>(
            'POST',
            '/square-import/vendors/import',
            { vendors },
            { invalidatePattern: 'square-import:vendors:.*' }
        );
    }

    // Discounts
    async searchDiscounts(): Promise<ApiResponse<SquareDiscount[]>> {
        return await this.call<SquareDiscount[]>(
            'GET',
            '/square-import/discounts/search',
            undefined,
            { cacheKey: 'square-import:discounts:search', ttl: 0 }
        );
    }

    async importDiscounts(discounts?: SquareDiscount[]): Promise<ApiResponse<SquareImportResult<SquareDiscount>>> {
        return await this.call<SquareImportResult<SquareDiscount>, { discounts?: SquareDiscount[] }>(
            'POST',
            '/square-import/discounts/import',
            { discounts },
            { invalidatePattern: 'square-import:discounts:.*' }
        );
    }

    // Batch Sync
    async batchSync(params: {
        entity: string;
        batchSize?: number;
        cursor?: string;
        beginTime?: string;
        endTime?: string;
        defaultOrganisationId?: number;
    }): Promise<ApiResponse<BatchSyncResponse>> {
        const queryParams: Record<string, string> = {
            entity: params.entity,
        };
        if (params.batchSize) queryParams.batchSize = params.batchSize.toString();
        if (params.cursor) queryParams.cursor = params.cursor;
        if (params.beginTime) queryParams.beginTime = params.beginTime;
        if (params.endTime) queryParams.endTime = params.endTime;
        if (params.defaultOrganisationId) queryParams.defaultOrganisationId = params.defaultOrganisationId.toString();

        return await this.call<BatchSyncResponse, Record<string, never>>(
            'POST',
            '/square-import/batch/sync',
            {},
            {
                config: { params: queryParams },
                invalidatePattern: 'square-import:batch:.*',
            }
        );
    }

    // Customers
    async getAllCustomers(): Promise<ApiResponse<SquareCustomer[]>> {
        return await this.call<SquareCustomer[]>(
            'GET',
            '/square-import/customers',
            undefined,
            { cacheKey: 'square-import:customers:all', ttl: 0 }
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

        return await this.call<SquareCustomer[]>(
            'GET',
            '/square-import/customers/search',
            undefined,
            { config: { params: queryParams }, ttl: 0, skipCache: true }
        );
    }

    async importCustomers(customers?: SquareCustomer[], organisationId?: number): Promise<ApiResponse<SquareImportResult<SquareCustomer>>> {
        const queryParams: Record<string, string> = {};
        if (organisationId) queryParams.organisationId = organisationId.toString();

        return await this.call<SquareImportResult<SquareCustomer>, { customers?: SquareCustomer[] }>(
            'POST',
            '/square-import/customers/import',
            { customers },
            {
                config: { params: queryParams },
                invalidatePattern: 'square-import:customers:.*',
            }
        );
    }

    async fetchAndImportCustomers(organisationId?: number): Promise<ApiResponse<SquareImportResult<SquareCustomer>>> {
        const queryParams: Record<string, string> = {};
        if (organisationId) queryParams.organisationId = organisationId.toString();

        return await this.call<SquareImportResult<SquareCustomer>, Record<string, never>>(
            'POST',
            '/square-import/customers/fetch-and-import',
            {},
            {
                config: { params: queryParams },
                invalidatePattern: 'square-import:customers:.*',
            }
        );
    }

    // New cursor-based pagination methods
    async fetchCustomersWithCursor(cursor?: string): Promise<ApiResponse<SquareCustomerCursorPage>> {
        const queryParams: Record<string, string> = {};
        if (cursor) queryParams.cursor = cursor;

        return await this.call<SquareCustomerCursorPage>(
            'GET',
            '/square-import/customers/fetch',
            undefined,
            { config: { params: queryParams }, ttl: 0, skipCache: true }
        );
    }

    async fetchAndStoreCustomersWithCursor(cursor?: string, organisationId?: number): Promise<ApiResponse<SquareCustomerStorePage>> {
        const queryParams: Record<string, string> = {};
        if (cursor) queryParams.cursor = cursor;
        if (organisationId) queryParams.organisationId = organisationId.toString();

        return await this.call<SquareCustomerStorePage, Record<string, never>>(
            'POST',
            '/square-import/customers/fetch-and-store',
            {},
            {
                config: { params: queryParams },
                invalidatePattern: 'square-import:customers:.*',
            }
        );
    }

    async storeSelectedCustomers(customers: SquareCustomer[], organisationId?: number): Promise<ApiResponse<SquareImportResult<SquareCustomer>>> {
        const queryParams: Record<string, string> = {};
        if (organisationId) queryParams.organisationId = organisationId.toString();

        return await this.call<SquareImportResult<SquareCustomer>, { customers: SquareCustomer[] }>(
            'POST',
            '/square-import/customers/store-selected',
            { customers },
            {
                config: { params: queryParams },
                invalidatePattern: 'square-import:customers:.*',
            }
        );
    }

    // Inventory
    async getAllInventory(organisationId: number): Promise<ApiResponse<SquareInventoryRecord[]>> {
        return await this.call<SquareInventoryRecord[]>(
            'GET',
            `/organisations/${organisationId}/square-import/inventory`,
            undefined,
            { cacheKey: `square-import:inventory:${organisationId}`, ttl: 0 }
        );
    }
}

export default SquareImportApiService;
