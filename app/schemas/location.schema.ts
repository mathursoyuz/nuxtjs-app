import { z } from 'zod';

export const createLocationSchema = z.object({
    clientId: z.number().int().positive(),
    name: z.string().min(1).max(255),
    address: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    phoneNumber: z.string().max(20).optional(),
    lat: z.string().optional(),
    long: z.string().optional(),
    isActive: z.boolean().optional().default(true),
});

export const updateLocationSchema = createLocationSchema.partial();

export type CreateLocationFormData = z.infer<typeof createLocationSchema>;
export type UpdateLocationFormData = z.infer<typeof updateLocationSchema>;
