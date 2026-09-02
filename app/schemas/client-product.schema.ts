import { z } from 'zod'
import { inventoryDraftBalanceSchema } from '~/schemas/inventory.schema'

export const clientProductVariantFormSchema = z.object({
    id: z.number().int().positive().optional(),
    sourceProductVariantId: z.coerce.number().int().positive('Select a platform variant'),
    sku: z.string().trim().min(1, 'Client SKU is required').max(100),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    cog: z.coerce.number().min(0, 'COG cannot be negative'),
    stockManaged: z.boolean(),
    lowStockThreshold: z.coerce.number().int().min(0),
    inventory: z.array(inventoryDraftBalanceSchema).default([]),
    isActive: z.boolean(),
})

export const clientProductFormSchema = z
    .object({
        slug: z.string().trim().min(1, 'Client slug is required').max(255),
        name: z.string().trim().min(1, 'White-label product name is required').max(255),
        description: z.string().nullable(),
        variants: z
            .array(clientProductVariantFormSchema)
            .min(1, 'Every client product requires at least one variant'),
        isActive: z.boolean(),
    })
    .superRefine((data, context) => {
        const sourceVariantIds = new Set<number>()
        const normalizedSkus = new Set<string>()

        data.variants.forEach((variant, index) => {
            if (sourceVariantIds.has(variant.sourceProductVariantId)) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'sourceProductVariantId'],
                    message: 'Each platform variant can be selected only once',
                })
            }
            sourceVariantIds.add(variant.sourceProductVariantId)

            const normalizedSku = variant.sku.trim().toLowerCase()
            if (normalizedSkus.has(normalizedSku)) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'sku'],
                    message: 'Client variant SKUs must be unique',
                })
            }
            normalizedSkus.add(normalizedSku)

            if (!variant.stockManaged && variant.inventory.length > 0) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'inventory'],
                    message: 'Enable stock tracking before adding opening inventory',
                })
            }
        })

        if (data.isActive && !data.variants.some((variant) => variant.isActive)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['variants'],
                message: 'An active client product requires at least one active variant',
            })
        }
    })

export type ClientProductVariantFormData = z.infer<typeof clientProductVariantFormSchema>
export type ClientProductFormData = z.infer<typeof clientProductFormSchema>
