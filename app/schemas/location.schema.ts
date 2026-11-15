import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'

const latitudePattern = /^(?:-?(?:[0-8]?\d)(?:\.\d{1,8})?|-?90(?:\.0{1,8})?)$/
const longitudePattern = /^(?:-?(?:\d{1,2}|1[0-7]\d)(?:\.\d{1,8})?|-?180(?:\.0{1,8})?)$/

export const createLocationSchema = z.object({
    organisationId: z.number().int().positive(),
    name: z.string().min(1).max(LIMIT.LOCATION_NAME),
    address: z.string().max(LIMIT.LOCATION_ADDRESS).optional(),
    city: z.string().max(LIMIT.LOCATION_REGION).optional(),
    state: z.string().max(LIMIT.LOCATION_REGION).optional(),
    country: z.string().max(LIMIT.LOCATION_REGION).optional(),
    phoneNumber: z.string().max(LIMIT.LOCATION_PHONE).optional(),
    lat: z.string().regex(latitudePattern, 'Latitude must be between -90 and 90').optional(),
    long: z.string().regex(longitudePattern, 'Longitude must be between -180 and 180').optional(),
    squareLocationId: z.string().optional(),
    isActive: z.boolean().optional().default(true),
})

export const updateLocationSchema = createLocationSchema.partial()

export type CreateLocationFormData = z.infer<typeof createLocationSchema>
export type UpdateLocationFormData = z.infer<typeof updateLocationSchema>
