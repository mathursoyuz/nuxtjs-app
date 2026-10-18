import type { InventoryDraftBalance } from '~/types/inventory.types'

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock'
export type DerivedProductType = 'simple' | 'variable' | 'bundle'

export interface BundleComponent {
    id?: number
    bundleVariantId?: number
    componentVariantId: number
    quantity: number
    sortOrder: number
}

export interface ProductIntegration {
    provider: string
    externalId: string | null
    isSynced: boolean
    syncErrorReason: string | null
    lastSyncedAt: string | null
    inventorySyncCounter: number
}

export interface ProductVariant {
    id: number
    productId: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    color: string
    size: string
    thumbnail: string | null
    attributes: Record<string, string>
    isDefault: boolean
    isActive: boolean
    isDeleted: boolean
    sortOrder: number
    gallery: string[]
    bundleComponents: BundleComponent[]
    integrations: ProductIntegration[]
    createdAt: string
    updatedAt: string
}

export interface Product {
    id: number
    slug: string
    name: string
    thumbnail: string | null
    description: string | null
    isFeatured: boolean
    isActive: boolean
    isDeleted: boolean
    categories: number[]
    gallery: string[]
    variants: ProductVariant[]
    createdAt: string
    updatedAt: string

    /** Derived compatibility fields returned by the API from the default variant. */
    defaultVariantId: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    type: DerivedProductType
    children: number[]
    squareVariationId: string | null
    isSquareSynced: boolean
    qbProductId: string | null
    isQbSynced: boolean
    qbSyncErrorReason: string | null
    qbLastSyncedAt: string | null
}

export interface BundleComponentInput {
    componentVariantId: number
    quantity: number
    sortOrder: number
}

export interface ProductVariantInput {
    id?: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    color: string
    size: string
    attributes: Record<string, string>
    inventory: InventoryDraftBalance[]
    isDefault: boolean
    isActive: boolean
    bundleComponents: BundleComponentInput[]
}

export interface CreateProductDTO {
    slug: string
    name: string
    description: string | null
    isFeatured: boolean
    isActive: boolean
    categories: number[]
    variants: ProductVariantInput[]
}

export type UpdateProductDTO = Partial<CreateProductDTO>
export interface CheckSkuResponse {
    available: boolean
}

export interface ToggleProductResponse {
    id: number
    isActive: boolean
}
