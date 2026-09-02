export interface SquareCategory {
    type: string;
    id: string;
    updated_at: string;
    created_at: string;
    version: number;
    is_deleted: boolean;
    category_data: {
        name: string;
        ordinal?: number;
        label_color?: string;
        category_type: string;
        parent_category?: {
            ordinal?: number;
        };
        is_top_level: boolean;
        online_visibility?: boolean;
    };
    localCategory?: {
        id: number;
        name: string;
        slug: string;
        squareCategoryId: string | null;
        isSquareSynced: boolean;
        [key: string]: unknown;
    };
}

export interface SquareProduct {
    type: string;
    id: string;
    updated_at: string;
    created_at: string;
    version: number;
    is_deleted: boolean;
    item_data: {
        name: string;
        description?: string;
        category_id?: string;
        variations?: SquareProductVariation[];
        product_type?: string;
        skip_modifier_screen?: boolean;
        image_ids?: string[];
        reporting_category: {
            id: string;
        };
    };
    localCategoryName?: string;
    localCategoryId?: string;
    localProduct?: {
        id: number;
        sku: string;
        name: string;
        squareVariationId: string | null;
        isSquareSynced: boolean;
        [key: string]: unknown;
    };
}

export interface SquareProductVariation {
    type: string;
    id: string;
    updated_at: string;
    created_at: string;
    version: number;
    is_deleted: boolean;
    item_variation_data: {
        item_id: string;
        name?: string;
        sku?: string;
        pricing_type?: string;
        price_money?: {
            amount: number;
            currency: string;
        };
        track_inventory?: boolean;
        inventory_alert_type?: string;
        inventory_alert_threshold?: number;
        user_data?: string;
        present_at_all_locations?: boolean;
        present_at_location_ids?: string[];
        absent_at_location_ids?: string[];
    };
}

export interface SquareImage {
    type: string;
    id: string;
    updated_at: string;
    created_at: string;
    version: number;
    is_deleted: boolean;
    image_data: {
        name?: string;
        url?: string;
        caption?: string;
    };
}

export interface SquareLocation {
    id: string;
    name: string;
    address?: {
        address_line_1?: string;
        address_line_2?: string;
        locality?: string;
        administrative_district_level_1?: string;
        postal_code?: string;
        country?: string;
    };
    timezone?: string;
    capabilities?: string[];
    status?: string;
    created_at?: string;
    merchant_id?: string;
    country?: string;
    language_code?: string;
    currency?: string;
    phone_number?: string;
    business_name?: string;
    type?: string;
    website_url?: string;
    business_hours?: unknown;
    business_email?: string;
    description?: string;
    twitter_username?: string;
    instagram_username?: string;
    facebook_url?: string;
    coordinates?: {
        latitude?: number;
        longitude?: number;
    };
    logo_url?: string;
    pos_background_url?: string;
    mcc?: string;
    full_format_logo_url?: string;
    tax_ids?: unknown;
    localLocation?: {
        id: number;
        name: string;
        address: string | null;
        city: string | null;
        state: string | null;
        country: string | null;
        squareLocationId: string | null;
        isSquareSynced: boolean;
        isQbSynced: boolean;
        qbSyncErrorReason: string | null;
        [key: string]: unknown;
    };
}

export interface SquareTransaction {
    id: string;
    created_at: string;
    updated_at?: string;
    amount_money?: {
        amount: number;
        currency: string;
    };
    status?: string;
    source_type?: string;
    location_id?: string;
    order_id?: string;
    [key: string]: unknown;
}

export interface SquareVendor {
    id: string;
    name: string;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface SquareDiscount {
    type: string;
    id: string;
    updated_at: string;
    created_at: string;
    version: number;
    is_deleted: boolean;
    discount_data?: {
        name: string;
        discount_type?: string;
        percentage?: string;
        amount_money?: {
            amount: number;
            currency: string;
        };
        [key: string]: unknown;
    };
}

export interface SquareCustomer {
    id: string;
    created_at?: string;
    updated_at?: string;
    given_name?: string;
    family_name?: string;
    company_name?: string;
    nickname?: string;
    email_address?: string;
    phone_number?: string;
    address?: {
        address_line_1?: string;
        address_line_2?: string;
        locality?: string;
        administrative_district_level_1?: string;
        postal_code?: string;
        country?: string;
    };
    birthday?: string;
    reference_id?: string;
    note?: string;
    preferences?: {
        email_unsubscribed?: boolean;
    };
    creation_source?: string;
    groups?: Array<{
        id?: string;
        name?: string;
    }>;
    segment_ids?: string[];
    version?: number;
    tax_ids?: Array<{
        type?: string;
        value?: string;
    }>;
    localCustomer?: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        squareCustomerId: string | null;
        isSquareSynced: boolean;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface SyncResult {
    created: number;
    updated: number;
    skipped: number;
    errors: Array<{ item: string; error: string }>;
}

export interface SearchResponse<T> {
    data: T[]; // Processed/enriched data
}

export interface ImportResponse<T = unknown> {
    data: T[]; // Processed/enriched data
    result: SyncResult; // Import operation result
}

// Legacy type - kept for backward compatibility if needed
export interface FetchResponse<T> {
    data: T[];
    pagination: {
        cursor?: string;
        hasMore: boolean;
        totalFetched: number;
    };
    filters: Record<string, unknown>;
}

export interface BatchSyncResponse {
    entity: string;
    batchNumber: number;
    processed: number;
    result: SyncResult;
    nextCursor?: string;
    hasMore: boolean;
    totalProcessed: number;
}
