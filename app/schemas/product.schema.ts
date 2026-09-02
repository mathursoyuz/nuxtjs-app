import { z } from 'zod'

export const bundleComponentSchema = z.object({
    componentVariantId: z.coerce.number().int().positive('Select a component variant'),
    quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
    sortOrder: z.coerce.number().int().min(0).default(0),
})

export const productVariantSchema = z.object({
    id: z.number().int().positive().optional(),
    sku: z.string().trim().min(1, 'SKU is required').max(100),
    price: z.coerce.number().min(0),
    cog: z.coerce.number().min(0),
    stockManaged: z.boolean(),
    lowStockThreshold: z.coerce.number().int().min(0),
    color: z.string().max(50).default(''),
    size: z.string().max(50).default(''),
    attributes: z.record(z.string(), z.string()).default({}),
    isDefault: z.boolean(),
    isActive: z.boolean(),
    bundleComponents: z.array(bundleComponentSchema).default([]),
})

const productSchema = z.object({
    slug: z.string().trim().min(1, 'Slug is required').max(255),
    name: z.string().trim().min(1, 'Product name is required').max(255),
    description: z.string().nullable(),
    isFeatured: z.boolean(),
    isActive: z.boolean(),
    categories: z.array(z.coerce.number().int().positive()).min(1, 'Select a category'),
    variants: z.array(productVariantSchema).min(1, 'Every product requires a variant'),
})

export const createProductSchema = productSchema.superRefine((data, context) => {
    const defaultCount = data.variants.filter((variant) => variant.isDefault).length
    if (defaultCount !== 1) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variants'],
            message: 'Select exactly one default variant',
        })
    }
    const defaultVariantIndex = data.variants.findIndex((variant) => variant.isDefault)
    if (
        data.isActive &&
        defaultVariantIndex >= 0 &&
        !data.variants[defaultVariantIndex]?.isActive
    ) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['variants', defaultVariantIndex, 'isActive'],
            message: 'An active product requires an active default variant',
        })
    }

    const categoryIds = new Set<number>()
    data.categories.forEach((categoryId, index) => {
        if (categoryIds.has(categoryId)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['categories', index],
                message: 'Each category can be selected only once',
            })
        }
        categoryIds.add(categoryId)
    })

    const skus = new Set<string>()
    data.variants.forEach((variant, index) => {
        const normalized = variant.sku.toLowerCase()
        if (skus.has(normalized)) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['variants', index, 'sku'],
                message: 'Variant SKUs must be unique',
            })
        }
        skus.add(normalized)

        const componentIds = new Set<number>()
        variant.bundleComponents.forEach((component, componentIndex) => {
            if (variant.id === component.componentVariantId) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [
                        'variants',
                        index,
                        'bundleComponents',
                        componentIndex,
                        'componentVariantId',
                    ],
                    message: 'A bundle variant cannot contain itself',
                })
            }
            if (componentIds.has(component.componentVariantId)) {
                context.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: [
                        'variants',
                        index,
                        'bundleComponents',
                        componentIndex,
                        'componentVariantId',
                    ],
                    message: 'Each bundle component can be selected only once',
                })
            }
            componentIds.add(component.componentVariantId)
        })
    })
})

export const updateProductSchema = createProductSchema

export type ProductVariantFormData = z.infer<typeof productVariantSchema>
export type CreateProductFormData = z.infer<typeof createProductSchema>
export type UpdateProductFormData = CreateProductFormData
