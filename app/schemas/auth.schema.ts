import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'

export const loginSchema = z.object({
    email: z
        .string()
        .email('Invalid email address')
        .min(5, 'Email must be at least 5 characters')
        .max(LIMIT.EMAIL, 'Email must be at most 100 characters'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(LIMIT.PASSWORD, 'Password must be at most 255 characters'),
})

export const registerSchema = z
    .object({
        email: z
            .string()
            .email('Invalid email address')
            .min(5, 'Email must be at least 5 characters')
            .max(LIMIT.EMAIL, 'Email must be at most 100 characters'),
        firstName: z
            .string()
            .min(3, 'First name must be at least 3 characters')
            .max(LIMIT.PERSON_NAME, 'First name must be at most 50 characters'),
        lastName: z
            .string()
            .min(3, 'Last name must be at least 3 characters')
            .max(LIMIT.PERSON_NAME, 'Last name must be at most 50 characters'),
        phoneNumber: z
            .string()
            .min(10, 'Phone number must be at least 10 characters')
            .max(LIMIT.PHONE, 'Phone number must be at most 15 characters'),
        password: z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .max(LIMIT.PASSWORD, 'Password must be at most 255 characters'),
        confirmPassword: z
            .string()
            .min(8, 'Confirm password must be at least 8 characters')
            .max(LIMIT.PASSWORD, 'Confirm password must be at most 255 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
