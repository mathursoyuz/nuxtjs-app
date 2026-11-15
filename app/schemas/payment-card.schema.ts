import { z } from 'zod'
import { SCHEMA_FIELD_LIMITS as LIMIT } from '~/constants/schema-field-limits.constants'

export const optionalCompanySchema = z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().min(1).max(LIMIT.COMPANY).nullable().optional()
)

export const paymentAddressFieldSchemas = {
    firstName: z.string().trim().min(1).max(LIMIT.PERSON_NAME),
    lastName: z.string().trim().min(1).max(LIMIT.PERSON_NAME),
    company: optionalCompanySchema,
    address: z.string().trim().min(5).max(LIMIT.ADDRESS),
    city: z.string().trim().min(2).max(LIMIT.CITY),
    stateCode: z.string().trim().min(1).max(LIMIT.STATE_CODE),
    postalCode: z.string().trim().min(3).max(LIMIT.POSTAL_CODE),
    countryCode: z.string().trim().min(1).max(LIMIT.COUNTRY_CODE),
    phoneNumber: z
        .string()
        .trim()
        .max(LIMIT.PHONE)
        .regex(/^\+?[0-9][0-9 ()-]{6,14}$/)
        .optional(),
}

export const billingDetailsSchema = z.object({
    ...paymentAddressFieldSchemas,
    billingEmail: z.string().email().min(3).max(LIMIT.EMAIL),
})

export const shippingDetailsSchema = z.object(paymentAddressFieldSchemas)

const passesLuhnCheck = (cardNumber: string): boolean => {
    let sum = 0
    let shouldDouble = false
    for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
        const character = cardNumber[index]
        if (character === undefined) return false
        let digit = Number(character)
        if (shouldDouble) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
        shouldDouble = !shouldDouble
    }
    return sum % 10 === 0
}

export const paymentCardFieldSchemas = {
    cardNumber: z
        .string()
        .regex(/^\d{13,19}$/, 'Enter a valid card number')
        .refine(passesLuhnCheck, 'Enter a valid card number'),
    expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'Select a valid expiry month'),
    expYear: z.string().regex(/^\d{4}$/, 'Select a valid expiry year'),
    cvc: z.string().regex(/^\d{3,4}$/, 'Enter a valid CVC'),
}

export const isFuturePaymentCardExpiry = (expMonth: string, expYear: string): boolean => {
    const now = new Date()
    const year = Number(expYear)
    const month = Number(expMonth)
    return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1)
}

export const paymentCardDetailsSchema = z
    .object(paymentCardFieldSchemas)
    .refine((data) => isFuturePaymentCardExpiry(data.expMonth, data.expYear), {
        path: ['expYear'],
        message: 'The card has expired',
    })

export type PaymentCardFormData = z.infer<typeof paymentCardDetailsSchema>
export type BillingDetailsFormData = z.infer<typeof billingDetailsSchema>
export type ShippingDetailsFormData = z.infer<typeof shippingDetailsSchema>
