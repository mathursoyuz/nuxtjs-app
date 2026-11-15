import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'

export const createCategorySchema = z.object({
    parentId: z.number().int().positive().nullable(),
    name: z.string().min(1).max(LIMIT.CATEGORY_NAME),
    slug: z.string().min(1).max(LIMIT.CATEGORY_SLUG),
    description: z.string().max(LIMIT.SHORT_DESCRIPTION).nullable().optional(),
    image: z.string().max(LIMIT.CATEGORY_IMAGE).nullable().optional(),
    isActive: z.boolean(),
})

export const updateCategorySchema = createCategorySchema.partial()

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>
