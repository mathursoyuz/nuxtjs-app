import { z } from 'zod'
import {
    isFuturePaymentCardExpiry,
    paymentAddressFieldSchemas,
    paymentCardFieldSchemas,
} from '~/schemas/payment-card.schema'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'

export const authorizeNetProfileFormSchema = z
    .object({
        id: z.coerce.number().int().positive(),
        entityType: z.enum(['organisation', 'customer']),
        billing: z.object({
            ...paymentAddressFieldSchemas,
            email: z.string().trim().email().max(LIMIT.EMAIL),
            phoneNumber: z.union([paymentAddressFieldSchemas.phoneNumber.unwrap(), z.literal('')]).optional(),
        }),
        card: z.object(paymentCardFieldSchemas),
    })
    .refine(
        (data) => isFuturePaymentCardExpiry(data.card.expMonth, data.card.expYear),
        {
            path: ['card', 'expYear'],
            message: 'The card has expired',
        }
    )

export type AuthorizeNetProfileForm = z.infer<typeof authorizeNetProfileFormSchema>
