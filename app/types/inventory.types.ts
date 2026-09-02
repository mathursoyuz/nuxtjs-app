import type { ProductStockStatus } from '~/types/product.types'

export type InventoryMovementType =
    | 'OPENING_BALANCE'
    | 'RESTOCK_RECEIVED'
    | 'MANUAL_ADJUSTMENT_IN'
    | 'MANUAL_ADJUSTMENT_OUT'
    | 'STOCK_RECOUNT'
    | 'LOCATION_TRANSFER'
    | 'DAMAGED'
    | 'EXPIRED'
    | 'LOST_OR_STOLEN'
    | 'RETURN_TO_VENDOR'

export interface InventoryBalance {
    id: number
    clientId: number
    productVariantId: number
    locationId: number
    locationName: string
    onHand: number
    reserved: number
    available: number
    stockStatus: ProductStockStatus
    lowStockThreshold: number
    version: number
    updatedAt: string
}

export interface InventoryMovement {
    id: number
    clientId: number
    productVariantId: number
    locationId: number
    locationName: string
    movementType: string
    quantity: number
    reservedDelta: number
    previousOnHand: number
    newOnHand: number
    previousReserved: number
    newReserved: number
    previousLowStockThreshold: number | null
    newLowStockThreshold: number | null
    referenceType: string
    referenceId: number | null
    referenceItemId: number | null
    correlationId: string | null
    reason: string
    notes: string | null
    createdByUserId: number | null
    createdAt: string
}

export interface InventorySnapshot {
    balances: InventoryBalance[]
    movements: InventoryMovement[]
    nextCursor: number | null
}

export interface CreateInventoryMovementDTO {
    movementType: InventoryMovementType
    locationId: number
    destinationLocationId?: number
    quantity: number
    reason: string
    notes?: string
    idempotencyKey: string
}

export interface UpdateInventoryThresholdDTO {
    locationId: number
    lowStockThreshold: number
    reason: string
    notes?: string
    idempotencyKey: string
}

export interface InventoryDraftBalance {
    locationId: number
    onHand: number
    lowStockThreshold: number
    reason: string
}
