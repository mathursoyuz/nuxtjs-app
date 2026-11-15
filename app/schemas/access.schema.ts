import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'

const passwordSchema = z
    .string()
    .min(8, 'Use at least 8 characters.')
    .refine((value) => new TextEncoder().encode(value).length <= 72, {
        message: 'Use a password of at most 72 bytes.',
    })

const managedUserProfileSchema = z.object({
    firstName: z.string().trim().min(1).max(LIMIT.PERSON_NAME),
    lastName: z.string().trim().min(1).max(LIMIT.PERSON_NAME),
    email: z.string().trim().email().max(LIMIT.EMAIL),
    phoneNumber: z.string().trim().min(1).max(LIMIT.PHONE),
    systemRole: z.string().min(1),
    assignmentActive: z.boolean(),
    roleIds: z.array(z.number().int().positive()),
})

export const createManagedUserSchema = managedUserProfileSchema
    .extend({
        password: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((value) => value.password === value.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
    })

export const updateManagedUserSchema = managedUserProfileSchema
    .extend({
        password: z.union([z.literal(''), passwordSchema]),
        confirmPassword: z.string(),
    })
    .refine((value) => value.password === value.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match.',
    })
