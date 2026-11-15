import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'
import {
    isFuturePaymentCardExpiry,
    paymentAddressFieldSchemas,
    paymentCardFieldSchemas,
} from '~/schemas/payment-card.schema'

export const createOrganisationSchema = z.object({
    name: z.string().min(1).max(LIMIT.ORGANISATION_NAME),
    email: z.string().email().min(3).max(LIMIT.EMAIL),
    websiteUrl: z.string().min(1).max(LIMIT.WEBSITE_URL),
    shippingCost: z.number().min(1),
    referralCode: z.string().min(1).max(LIMIT.REFERRAL_CODE).nullable().optional(),
    description: z.string().max(LIMIT.SHORT_DESCRIPTION).nullable().optional(),
    logo: z.string().max(LIMIT.IMAGE_FILENAME).nullable().optional(),
    billingFirstName: paymentAddressFieldSchemas.firstName,
    billingLastName: paymentAddressFieldSchemas.lastName,
    billingCompany: z.string().trim().min(1).max(LIMIT.ORGANISATION_COMPANY),
    billingAddress: paymentAddressFieldSchemas.address,
    billingCity: paymentAddressFieldSchemas.city,
    billingStateCode: paymentAddressFieldSchemas.stateCode,
    billingPostalCode: paymentAddressFieldSchemas.postalCode,
    billingCountryCode: paymentAddressFieldSchemas.countryCode,
    billingPhone: paymentAddressFieldSchemas.phoneNumber.unwrap(),
    isActive: z.boolean(),
    squareAccessToken: z.string().max(LIMIT.EXTERNAL_TOKEN).nullable().optional(),
    qbRealmId: z.string().max(LIMIT.REALM_ID).nullable().optional(),
})

export const updateOrganisationSchema = createOrganisationSchema.partial()

export const organisationBasicSchema = createOrganisationSchema.pick({
    name: true,
    email: true,
    websiteUrl: true,
    shippingCost: true,
    referralCode: true,
    description: true,
    logo: true,
    isActive: true,
    squareAccessToken: true,
    qbRealmId: true,
})

export const organisationEditBasicSchema = organisationBasicSchema

export const organisationBillingSchema = z.object({
    billingFirstName: paymentAddressFieldSchemas.firstName,
    billingLastName: paymentAddressFieldSchemas.lastName,
    billingCompany: z
        .string()
        .trim()
        .max(LIMIT.ORGANISATION_COMPANY)
        .refine((value) => !value || value.length >= 5, {
            message: 'Company name must be at least 5 characters if provided',
        }),
    billingAddress: paymentAddressFieldSchemas.address,
    billingCity: paymentAddressFieldSchemas.city,
    billingStateCode: paymentAddressFieldSchemas.stateCode,
    billingPostalCode: paymentAddressFieldSchemas.postalCode,
    billingCountryCode: paymentAddressFieldSchemas.countryCode,
    billingPhone: paymentAddressFieldSchemas.phoneNumber.unwrap(),
})

export const organisationPaymentCardSchema = organisationBillingSchema
    .extend({
        ...paymentCardFieldSchemas,
        isActive: z.literal(true),
    })
    .refine((data) => isFuturePaymentCardExpiry(data.expMonth, data.expYear), {
        path: ['expYear'],
        message: 'The card has expired',
    })

export type CreateOrganisationFormData = z.infer<typeof createOrganisationSchema>
export type UpdateOrganisationFormData = z.infer<typeof updateOrganisationSchema>
