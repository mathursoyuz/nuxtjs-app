import type {
    MembershipBillingInterval,
    MembershipDiscountType,
    MembershipProductRuleType,
} from '~/types/membership.types'

export const MEMBERSHIP_BILLING_INTERVALS: Array<{
    title: string
    value: MembershipBillingInterval
}> = [
    { title: 'One time', value: 'ONE_TIME' },
    { title: 'Daily', value: 'DAILY' },
    { title: 'Weekly', value: 'WEEKLY' },
    { title: 'Monthly', value: 'MONTHLY' },
    { title: 'Half-yearly', value: 'SEMI_ANNUAL' },
    { title: 'Yearly', value: 'YEARLY' },
]

export const MEMBERSHIP_DISCOUNT_TYPES: Array<{
    title: string
    value: MembershipDiscountType
}> = [
    { title: 'No discount', value: 'NONE' },
    { title: 'Fixed amount', value: 'FIXED' },
    { title: 'Percentage', value: 'PERCENTAGE' },
]

export const MEMBERSHIP_PRODUCT_RULE_TYPES: Array<{
    title: string
    value: MembershipProductRuleType
}> = [
    { title: 'Include', value: 'INCLUDE' },
    { title: 'Exclude', value: 'EXCLUDE' },
]

export const MEMBERSHIP_STATUS = {
    ACTIVE: 'ACTIVE',
    CANCELLED: 'CANCELLED',
    PENDING_PAYMENT: 'PENDING_PAYMENT',
    PAST_DUE: 'PAST_DUE',
    CHANGE_CONFIRMATION_PENDING: 'CHANGE_CONFIRMATION_PENDING',
} as const

export const MEMBERSHIP_ACTION_STATUS = {
    PENDING: 'PENDING',
} as const
