import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'
import {
    isFuturePaymentCardExpiry,
    optionalCompanySchema,
    paymentAddressFieldSchemas,
    paymentCardFieldSchemas,
} from '~/schemas/payment-card.schema'

export const customerShippingAddressSchema = z.object({
    type: z.number().int(),
    firstName: paymentAddressFieldSchemas.firstName,
    lastName: paymentAddressFieldSchemas.lastName,
    company: optionalCompanySchema,
    address: paymentAddressFieldSchemas.address,
    city: paymentAddressFieldSchemas.city,
    stateCode: paymentAddressFieldSchemas.stateCode,
    postalCode: paymentAddressFieldSchemas.postalCode,
    countryCode: paymentAddressFieldSchemas.countryCode,
    isActive: z.boolean(),
})

export const customerCreditCardSchema = z
    .object({
        cardNumber: z.union([paymentCardFieldSchemas.cardNumber, z.literal('')]),
        expMonth: z.union([paymentCardFieldSchemas.expMonth, z.literal('')]),
        expYear: z.union([paymentCardFieldSchemas.expYear, z.literal('')]),
        isActive: z.boolean(),
        cvc: z.union([paymentCardFieldSchemas.cvc, z.literal('')]),
    })
    .refine(
        (data) => {
            // If any field is filled, all must be filled
            const hasAny = !!(
                data.cardNumber?.trim() ||
                data.expMonth?.trim() ||
                data.expYear?.trim() ||
                data.cvc?.trim()
            )
            if (hasAny) {
                return !!(
                    data.cardNumber?.trim() &&
                    data.expMonth?.trim() &&
                    data.expYear?.trim() &&
                    data.cvc?.trim()
                )
            }
            return true // All empty is valid (optional)
        },
        {
            message: 'If any credit card field is entered, all fields are required',
            path: ['cardNumber'], // Show error on cardNumber field
        }
    )
    .refine(
        (data) =>
            !data.cardNumber || isFuturePaymentCardExpiry(data.expMonth ?? '', data.expYear ?? ''),
        { message: 'The card has expired', path: ['expYear'] }
    )

export const createCustomerSchema = z.object({
    organisationId: z.number().int().positive(),
    firstName: z.string().min(3).max(LIMIT.PERSON_NAME),
    lastName: z.string().min(3).max(LIMIT.PERSON_NAME),
    email: z.string().email().min(5).max(LIMIT.EMAIL),
    password: z.string().min(8).max(LIMIT.PASSWORD),
    avatar: z.string().optional().nullable(),
    phoneNumber: z.string().min(10).max(LIMIT.PHONE),
    pickupLocation: z.number().int().positive(),
    signupLocation: z.number().int().positive(),
    deliveryMethod: z.number().int().positive(),
    cpi: z.string().optional(),
    dob: z.string().optional().nullable(),
    isAppUser: z.boolean().optional(),
    isActive: z.boolean(),
    billingCompany: optionalCompanySchema,
    billingAddress: paymentAddressFieldSchemas.address,
    billingCity: paymentAddressFieldSchemas.city,
    billingStateCode: paymentAddressFieldSchemas.stateCode,
    billingPostalCode: paymentAddressFieldSchemas.postalCode,
    billingCountryCode: paymentAddressFieldSchemas.countryCode,
    shippingFirstName: paymentAddressFieldSchemas.firstName,
    shippingLastName: paymentAddressFieldSchemas.lastName,
    shippingCompany: optionalCompanySchema,
    shippingAddress: paymentAddressFieldSchemas.address,
    shippingCity: paymentAddressFieldSchemas.city,
    shippingStateCode: paymentAddressFieldSchemas.stateCode,
    shippingPostalCode: paymentAddressFieldSchemas.postalCode,
    shippingCountryCode: paymentAddressFieldSchemas.countryCode,
    creditCard: customerCreditCardSchema.optional().nullable(),
})

export const updateCustomerSchema = createCustomerSchema.partial().extend({
    organisationId: z.number().int().positive(),
    password: z.string().min(8).max(LIMIT.PASSWORD).optional(),
})

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>
export type CustomerShippingAddressFormData = z.infer<typeof customerShippingAddressSchema>
export type CustomerCreditCardFormData = z.infer<typeof customerCreditCardSchema>
