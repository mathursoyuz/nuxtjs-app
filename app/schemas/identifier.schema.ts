import { z } from 'zod'

export const MAX_SIGNED_BIGINT_ID = 9_223_372_036_854_775_807n

export const apiIdSchema = z
    .string()
    .regex(/^[1-9][0-9]{0,18}$/, 'ID must be a positive integer')
    .refine((value) => /^[1-9][0-9]{0,18}$/.test(value) && BigInt(value) <= MAX_SIGNED_BIGINT_ID, {
        message: 'ID exceeds the database range',
    })

export type ApiId = z.infer<typeof apiIdSchema>
