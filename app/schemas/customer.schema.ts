import { z } from 'zod'

const optionalCompanySchema = z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().min(2).max(100).nullable().optional()
)

export const customerShippingAddressSchema = z.object({
    type: z.number().int(),
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    company: optionalCompanySchema,
    address: z.string().min(10).max(100),
    city: z.string().min(3).max(50),
    stateCode: z.string().min(2).max(10),
    postalCode: z.string().min(5).max(10),
    countryCode: z.string().min(2).max(5),
    isActive: z.boolean(),
})

export const customerCreditCardSchema = z
    .object({
        cardNumber: z.string().max(18),
        expMonth: z.string().max(2),
        expYear: z.string().max(4),
        isActive: z.boolean(),
        cvc: z.string().max(4),
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

export const createCustomerSchema = z.object({
    organisationId: z.number().int().positive(),
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    email: z.string().email().min(5).max(100),
    password: z.string().min(8).max(255),
    avatar: z.string().optional().nullable(),
    phoneNumber: z.string().min(10).max(15),
    pickupLocation: z.number().int().positive(),
    signupLocation: z.number().int().positive(),
    deliveryMethod: z.number().int().positive(),
    cpi: z.string().optional(),
    dob: z.string().optional().nullable(),
    isAppUser: z.boolean().optional(),
    isActive: z.boolean(),
    billingCompany: optionalCompanySchema,
    billingAddress: z.string().min(10).max(100),
    billingCity: z.string().min(3).max(50),
    billingStateCode: z.string().min(2).max(10),
    billingPostalCode: z.string().min(5).max(10),
    billingCountryCode: z.string().min(2).max(5),
    shippingFirstName: z.string().min(3).max(50),
    shippingLastName: z.string().min(3).max(50),
    shippingCompany: optionalCompanySchema,
    shippingAddress: z.string().min(10).max(100),
    shippingCity: z.string().min(3).max(50),
    shippingStateCode: z.string().min(2).max(10),
    shippingPostalCode: z.string().min(5).max(10),
    shippingCountryCode: z.string().min(2).max(5),
    creditCard: customerCreditCardSchema.optional().nullable(),
})

export const updateCustomerSchema = createCustomerSchema.partial().extend({
    organisationId: z.number().int().positive(),
    password: z.string().min(8).max(255).optional(),
})

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>
export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>
export type CustomerShippingAddressFormData = z.infer<typeof customerShippingAddressSchema>
export type CustomerCreditCardFormData = z.infer<typeof customerCreditCardSchema>
