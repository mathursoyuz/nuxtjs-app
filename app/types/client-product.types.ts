import type { ProductStockStatus } from '~/types/product.types'
import type { InventoryDraftBalance } from '~/types/inventory.types'

export interface ClientInventoryBalance {
    id: number
    locationId: number
    onHand: number
    reserved: number
    available: number
    stockStatus: ProductStockStatus
    lowStockThreshold: number
}

export interface ClientProductVariant {
    id: number
    clientProductId: number
    clientId: number
    sourceProductVariantId: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    lowStockThreshold: number
    isActive: boolean
    isDeleted: boolean
    qty: number
    reservedQty: number
    availableQty: number
    stockStatus: ProductStockStatus
    inventory: ClientInventoryBalance[]
    createdAt: string
    updatedAt: string
}

export interface ClientProduct {
    id: number
    clientId: number
    sourceProductId: number
    productId: number
    slug: string
    name: string
    thumbnail: string | null
    description: string | null
    isActive: boolean
    isDeleted: boolean
    gallery: string[]
    variants: ClientProductVariant[]
    clientProductVariantId: number
    sourceProductVariantId: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    qty: number
    reservedQty: number
    availableQty: number
    stockStatus: ProductStockStatus
    lowStockThreshold: number
    createdAt: string
    updatedAt: string
}

export interface ClientProductVariantInput {
    id?: number
    sourceProductVariantId: number
    sku: string
    price: number
    cog: number
    stockManaged: boolean
    lowStockThreshold: number
    inventory?: InventoryDraftBalance[]
    isActive: boolean
}

export interface CreateClientProductDTO {
    slug: string
    name: string
    description: string | null
    variants: ClientProductVariantInput[]
    isActive: boolean
}

export type UpdateClientProductDTO = Partial<CreateClientProductDTO>
