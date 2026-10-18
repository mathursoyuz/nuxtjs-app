import type { ProductStockStatus } from '~/types/product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'

export interface OrganisationInventoryBalance {
    id: number
    locationId: number
    onHand: number
    reserved: number
    available: number
    stockStatus: ProductStockStatus
    lowStockThreshold: number
}

export interface OrganisationBundleComponent {
    id?: number
    bundleOrganisationProductVariantId?: number
    componentOrganisationProductVariantId: number
    quantity: number
    sortOrder: number
}

export interface OrganisationProductVariant {
    id: number
    organisationProductId: number
    organisationId: number
    platformProductVariantId: number | null
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    color: string
    size: string
    thumbnail: string | null
    gallery: string[]
    attributes: Record<string, string>
    isActive: boolean
    isDeleted: boolean
    qty: number
    reservedQty: number
    availableQty: number
    stockStatus: ProductStockStatus
    inventory: OrganisationInventoryBalance[]
    bundleComponents: OrganisationBundleComponent[]
    createdAt: string
    updatedAt: string
}

export interface OrganisationProduct {
    id: number
    organisationId: number
    platformProductId: number | null
    isPlatformProduct: boolean
    productId: number
    slug: string
    name: string
    thumbnail: string | null
    description: string | null
    isActive: boolean
    isDeleted: boolean
    gallery: string[]
    variants: OrganisationProductVariant[]
    organisationProductVariantId: number
    platformProductVariantId: number | null
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    qty: number
    reservedQty: number
    availableQty: number
    stockStatus: ProductStockStatus
    createdAt: string
    updatedAt: string
}

export interface OrganisationProductVariantInput {
    id?: number
    platformProductVariantId?: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    color: string
    size: string
    attributes: Record<string, string>
    inventory?: InventoryDraftBalance[]
    bundleComponents: OrganisationBundleComponent[]
    isActive: boolean
}

export interface CreateOrganisationProductDTO {
    slug: string
    name: string
    description: string | null
    variants: OrganisationProductVariantInput[]
    isActive: boolean
}

export interface UpdateOrganisationProductDTO {
    slug?: string
    name?: string
    description?: string | null
    variants?: OrganisationProductVariantInput[]
    isActive?: boolean
}
