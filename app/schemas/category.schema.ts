import { z } from 'zod';

export const createCategorySchema = z.object({
    parentId: z.number().int().min(0),
    name: z.string().min(1).max(255),
    slug: z.string().min(1).max(255),
    description: z.string().max(255).nullable().optional(),
    image: z.string().max(255).nullable().optional(),
    isActive: z.boolean(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
