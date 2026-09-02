import type { InventoryMovementType } from '~/types/inventory.types'

export const INVENTORY_STOCK_STATUS = {
    IN_STOCK: 'in_stock',
    LOW_STOCK: 'low_stock',
    OUT_OF_STOCK: 'out_of_stock',
} as const

export const INVENTORY_MOVEMENT_TYPE = {
    OPENING_BALANCE: 'OPENING_BALANCE',
    RESTOCK_RECEIVED: 'RESTOCK_RECEIVED',
    MANUAL_ADJUSTMENT_IN: 'MANUAL_ADJUSTMENT_IN',
    MANUAL_ADJUSTMENT_OUT: 'MANUAL_ADJUSTMENT_OUT',
    STOCK_RECOUNT: 'STOCK_RECOUNT',
    LOCATION_TRANSFER: 'LOCATION_TRANSFER',
    DAMAGED: 'DAMAGED',
    EXPIRED: 'EXPIRED',
    LOST_OR_STOLEN: 'LOST_OR_STOLEN',
    RETURN_TO_VENDOR: 'RETURN_TO_VENDOR',
} as const

export const INVENTORY_MOVEMENT_OPTIONS: Array<{
    title: string
    value: InventoryMovementType
}> = [
    { title: 'Opening balance', value: INVENTORY_MOVEMENT_TYPE.OPENING_BALANCE },
    { title: 'Restock received', value: INVENTORY_MOVEMENT_TYPE.RESTOCK_RECEIVED },
    { title: 'Manual increase', value: INVENTORY_MOVEMENT_TYPE.MANUAL_ADJUSTMENT_IN },
    { title: 'Manual decrease', value: INVENTORY_MOVEMENT_TYPE.MANUAL_ADJUSTMENT_OUT },
    { title: 'Stock recount', value: INVENTORY_MOVEMENT_TYPE.STOCK_RECOUNT },
    { title: 'Location transfer', value: INVENTORY_MOVEMENT_TYPE.LOCATION_TRANSFER },
    { title: 'Damaged stock', value: INVENTORY_MOVEMENT_TYPE.DAMAGED },
    { title: 'Expired stock', value: INVENTORY_MOVEMENT_TYPE.EXPIRED },
    { title: 'Lost or stolen', value: INVENTORY_MOVEMENT_TYPE.LOST_OR_STOLEN },
    { title: 'Return to vendor', value: INVENTORY_MOVEMENT_TYPE.RETURN_TO_VENDOR },
]

export const INVENTORY_MESSAGES = {
    FETCH_ERROR: 'Failed to load inventory',
    MOVEMENT_SUCCESS: 'Inventory movement recorded successfully',
    MOVEMENT_ERROR: 'Failed to record inventory movement',
    THRESHOLD_SUCCESS: 'Low-stock threshold updated successfully',
    THRESHOLD_ERROR: 'Failed to update low-stock threshold',
    DRAFT_REASON: 'Opening balance entered during product creation',
    EXISTING_BALANCE: 'Existing inventory balance',
    SAVE_TRACKING_FIRST: 'Save the product with inventory tracking enabled, then manage inventory.',
} as const
