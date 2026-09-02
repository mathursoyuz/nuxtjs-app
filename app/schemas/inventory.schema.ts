import { z } from 'zod'
import { INVENTORY_MOVEMENT_TYPE } from '~/constants/inventory.constants'

const movementTypes = [
    INVENTORY_MOVEMENT_TYPE.OPENING_BALANCE,
    INVENTORY_MOVEMENT_TYPE.RESTOCK_RECEIVED,
    INVENTORY_MOVEMENT_TYPE.MANUAL_ADJUSTMENT_IN,
    INVENTORY_MOVEMENT_TYPE.MANUAL_ADJUSTMENT_OUT,
    INVENTORY_MOVEMENT_TYPE.STOCK_RECOUNT,
    INVENTORY_MOVEMENT_TYPE.LOCATION_TRANSFER,
    INVENTORY_MOVEMENT_TYPE.DAMAGED,
    INVENTORY_MOVEMENT_TYPE.EXPIRED,
    INVENTORY_MOVEMENT_TYPE.LOST_OR_STOLEN,
    INVENTORY_MOVEMENT_TYPE.RETURN_TO_VENDOR,
] as const

export const inventoryMovementSchema = z
    .object({
        movementType: z.enum(movementTypes),
        locationId: z.coerce.number().int().positive('Select a location'),
        destinationLocationId: z.coerce.number().int().positive().optional(),
        quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative'),
        reason: z.string().trim().min(3, 'Reason must contain at least 3 characters').max(255),
        notes: z.string().trim().max(500).optional(),
    })
    .superRefine((data, context) => {
        if (
            data.movementType !== INVENTORY_MOVEMENT_TYPE.STOCK_RECOUNT &&
            data.quantity <= 0
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['quantity'],
                message: 'Quantity must be greater than zero',
            })
        }
        if (
            data.movementType === INVENTORY_MOVEMENT_TYPE.LOCATION_TRANSFER &&
            !data.destinationLocationId
        ) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['destinationLocationId'],
                message: 'Select a destination location',
            })
        }
        if (data.locationId === data.destinationLocationId) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['destinationLocationId'],
                message: 'Destination must be different from the source location',
            })
        }
    })

export const inventoryThresholdSchema = z.object({
    locationId: z.coerce.number().int().positive(),
    lowStockThreshold: z.coerce.number().int().min(0),
    reason: z.string().trim().min(3).max(255),
    notes: z.string().trim().max(500).optional(),
})

export const inventoryDraftBalanceSchema = z.object({
    locationId: z.coerce.number().int().positive('Select a location'),
    onHand: z.coerce.number().int().min(0),
    lowStockThreshold: z.coerce.number().int().min(0),
    reason: z.string().trim().min(3).max(255),
})

export type InventoryMovementFormData = z.infer<typeof inventoryMovementSchema>
export type InventoryThresholdFormData = z.infer<typeof inventoryThresholdSchema>
