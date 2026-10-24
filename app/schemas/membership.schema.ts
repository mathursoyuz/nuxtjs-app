import { z } from 'zod'

export const membershipTypeFormSchema = z.object({
    name: z.string().trim().min(2).max(150),
    slug: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
    description: z.string().max(2000).nullable(),
    isActive: z.boolean(),
})

const membershipBaseSchema = z
    .object({
        membershipTypeId: z.coerce.number().int().positive('Select a membership group'),
        name: z.string().trim().min(2).max(150),
        slug: z
            .string()
            .trim()
            .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes'),
        description: z.string().max(5000).nullable(),
        tooltip: z.string().max(300).nullable(),
        bannerImage: z.string().max(500).nullable(),
        thumbnailImage: z.string().max(500).nullable(),
        tierRank: z.coerce.number().int().positive(),
        isChargeable: z.boolean(),
        priceAmount: z.coerce.number().min(0),
        billingInterval: z.enum([
            'ONE_TIME',
            'DAILY',
            'WEEKLY',
            'MONTHLY',
            'SEMI_ANNUAL',
            'YEARLY',
        ]),
        isActive: z.boolean(),
    })
    .superRefine((data, context) => {
        if (data.isChargeable && data.priceAmount <= 0) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['priceAmount'],
                message: 'Enter a price for a chargeable membership',
            })
        }
        if (!data.isChargeable && data.priceAmount !== 0) {
            context.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['priceAmount'],
                message: 'A free membership must have a zero price',
            })
        }
    })

export const platformMembershipFormSchema = membershipBaseSchema

const discountFields = {
    discountType: z.enum(['NONE', 'FIXED', 'PERCENTAGE']),
    discountValue: z.coerce.number().min(0),
}

export const organisationMembershipFormSchema = z.intersection(
    membershipBaseSchema,
    z.object({
        defaultDiscountType: discountFields.discountType,
        defaultDiscountValue: discountFields.discountValue,
        categoryRules: z.array(
            z.object({ categoryId: z.coerce.number().int().positive(), ...discountFields })
        ),
        productRules: z.array(
            z.object({
                organisationProductId: z.coerce.number().int().positive(),
                ruleType: z.enum(['INCLUDE', 'EXCLUDE']),
                ...discountFields,
            })
        ),
    })
)

export const membershipSelectionSchema = z.object({
    membershipId: z.coerce.number().int().positive('Select a membership'),
    creditCardId: z.coerce.number().int().positive('Select a payment card'),
    reason: z.string().max(1000).optional(),
})

export const membershipReasonSchema = z.object({
    reason: z.string().max(1000).optional(),
})

export const membershipCardSelectionSchema = z.object({
    creditCardId: z.coerce.number().int().positive('Select a payment card'),
})

export const membershipPricingDecisionSchema = z.object({
    decision: z.enum(['ACCEPT', 'DECLINE']),
    reason: z.string().max(1000).optional(),
})

export type MembershipTypeFormData = z.infer<typeof membershipTypeFormSchema>
export type PlatformMembershipFormData = z.infer<typeof platformMembershipFormSchema>
export type OrganisationMembershipFormData = z.infer<typeof organisationMembershipFormSchema>
export type MembershipSelectionFormData = z.infer<typeof membershipSelectionSchema>
export type MembershipReasonFormData = z.infer<typeof membershipReasonSchema>
export type MembershipCardSelectionFormData = z.infer<typeof membershipCardSelectionSchema>
export type MembershipPricingDecisionFormData = z.infer<typeof membershipPricingDecisionSchema>
