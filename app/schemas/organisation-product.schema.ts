import { z } from 'zod'
import { inventoryDraftBalanceSchema } from '~/schemas/inventory.schema'

export const organisationBundleComponentSchema = z.object({
    componentOrganisationProductVariantId: z.coerce
        .number()
        .int()
        .positive('Select an organisation variant'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    sortOrder: z.coerce.number().int().min(0).default(0),
})

export const organisationProductVariantFormSchema = z.object({
    id: z.number().int().positive().optional(),
    platformProductVariantId: z.coerce.number().int().positive().optional(),
    sku: z.string().trim().min(1, 'Organisation SKU is required').max(100),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    cog: z.coerce.number().min(0, 'COG cannot be negative'),
    stockManaged: z.boolean(),
    color: z.string().max(50),
    size: z.string().max(50),
    attributes: z.record(z.string(), z.string()),
    inventory: z.array(inventoryDraftBalanceSchema).default([]),
    bundleComponents: z.array(organisationBundleComponentSchema).default([]),
    isActive: z.boolean(),
})

export const organisationProductFormSchema = z
    .object({
        slug: z.string().trim().min(1, 'Organisation slug is required').max(255),
        name: z.string().trim().min(1, 'White-label product name is required').max(255),
        description: z.string().nullable(),
        categoryIds: z.array(z.coerce.number().int().positive()).default([]),
        variants: z
            .array(organisationProductVariantFormSchema)
            .min(1, 'Every organisation product requires at least one variant'),
        isActive: z.boolean(),
    })
    .superRefine((data, context) => {
        const sourceVariantIds = new Set<number>()
        const normalizedSkus = new Set<string>()

        data.variants.forEach((variant, index) => {
            if (
                variant.platformProductVariantId &&
                sourceVariantIds.has(variant.platformProductVariantId)
            ) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'platformProductVariantId'],
                    message: 'Each platform variant can be selected only once',
                })
            }
            if (variant.platformProductVariantId)
                sourceVariantIds.add(variant.platformProductVariantId)

            const normalizedSku = variant.sku.trim().toLowerCase()
            if (normalizedSkus.has(normalizedSku)) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['variants', index, 'sku'],
                    message: 'Organisation variant SKUs must be unique',
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

            const componentIds = new Set<number>()
            variant.bundleComponents.forEach((component, componentIndex) => {
                if (variant.id === component.componentOrganisationProductVariantId) {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [
                            'variants',
                            index,
                            'bundleComponents',
                            componentIndex,
                            'componentOrganisationProductVariantId',
                        ],
                        message: 'A bundle variant cannot contain itself',
                    })
                }
                if (componentIds.has(component.componentOrganisationProductVariantId)) {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        path: [
                            'variants',
                            index,
                            'bundleComponents',
                            componentIndex,
                            'componentOrganisationProductVariantId',
                        ],
                        message: 'Each bundle component can be selected only once',
                    })
                }
                componentIds.add(component.componentOrganisationProductVariantId)
            })
        })

        if (data.isActive && !data.variants.some((variant) => variant.isActive)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['variants'],
                message: 'An active organisation product requires at least one active variant',
            })
        }
    })

export type OrganisationProductVariantFormData = z.infer<
    typeof organisationProductVariantFormSchema
>
export type OrganisationProductFormData = z.infer<typeof organisationProductFormSchema>
