export type MembershipBillingInterval =
    | 'ONE_TIME'
    | 'DAILY'
    | 'WEEKLY'
    | 'MONTHLY'
    | 'SEMI_ANNUAL'
    | 'YEARLY'

export type MembershipDiscountType = 'NONE' | 'FIXED' | 'PERCENTAGE'
export type MembershipProductRuleType = 'INCLUDE' | 'EXCLUDE'
export type MembershipActionDecision = 'ACCEPT' | 'DECLINE'

export interface MembershipType {
    id: number
    organisationId?: number
    name: string
    slug: string
    description: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface MembershipCategoryRule {
    categoryId: number
    discountType: MembershipDiscountType
    discountValue: number
}

export interface MembershipProductRule {
    organisationProductId: number
    ruleType: MembershipProductRuleType
    discountType: MembershipDiscountType
    discountValue: number
}

export interface Membership {
    id: number
    organisationId?: number
    membershipTypeId: number
    membershipGroupName: string
    name: string
    slug: string
    description: string | null
    tooltip: string | null
    bannerImage: string | null
    thumbnailImage: string | null
    tierRank: number
    isChargeable: boolean
    chargeabilityLabel: 'Free' | 'Chargeable'
    priceAmount: number
    billingInterval: MembershipBillingInterval
    pricingRevision: number
    isActive: boolean
    createdAt: string
    updatedAt: string
    defaultDiscountType?: MembershipDiscountType
    defaultDiscountValue?: number
    categoryRules?: MembershipCategoryRule[]
    productRules?: MembershipProductRule[]
}

export interface MembershipTypeInput {
    name: string
    slug: string
    description: string | null
    isActive: boolean
}

export interface MembershipInput {
    membershipTypeId: number
    name: string
    slug: string
    description: string | null
    tooltip: string | null
    bannerImage: string | null
    thumbnailImage: string | null
    tierRank: number
    isChargeable: boolean
    priceAmount: number
    billingInterval: MembershipBillingInterval
    isActive: boolean
}

export interface OrganisationMembershipInput extends MembershipInput {
    defaultDiscountType: MembershipDiscountType
    defaultDiscountValue: number
    categoryRules: MembershipCategoryRule[]
    productRules: MembershipProductRule[]
}

export interface MembershipAction {
    id: number
    actionType: string
    pricingRevision: number
    status: string
    requestedAt: string
    resolvedAt: string | null
}

export interface MembershipBillingCycle {
    id: number
    membershipId: number
    membershipName: string | null
    membershipGroupName: string | null
    cycleType: string
    status: string
    pricingRevision: number
    periodStart: string
    periodStartDisplay: string | null
    periodEnd: string | null
    periodEndDisplay: string | null
    existingMembershipPriceAmount: number
    unusedCreditAmount: number
    creditDiscountApplied: number
    remainingCreditAmount: number
    membershipPriceAmount: number
    finalAmountCharged: number
    dueAt: string
    paidAt: string | null
    createdAt: string
    createdAtDisplay: string | null
}

export interface MembershipPaymentAttempt {
    id: number
    billingCycleId: number
    operation?: string
    status: string
    amount: number
    provider: string
    providerTransactionId: string | null
    lastFour: string | null
    responseCode: string | null
    errorCode: string | null
    errorMessage: string | null
    processedAt: string | null
    processedAtDisplay: string | null
    createdAt: string
    createdAtDisplay: string | null
}

export interface MembershipSubscriber {
    subscriptionId: number
    subscriberId: number
    subscriberName: string
    subscriberEmail: string
    membershipId: number
    membershipName: string
    membershipGroupName?: string
    status: string
    joinedAt: string
    changedFrom: string | null
    changedTo: string | null
}

export interface MembershipSubscriptionRefund {
    id: number
    billingCycleId: number
    refundType: 'FULL' | 'PARTIAL'
    operation: 'VOID' | 'REFUND'
    status: string
    amount: number
    unusedCreditAmount: number
    consumedAmount: number
    providerTransactionId: string | null
    reason: string | null
    processedAt: string | null
    createdAt: string
}

export interface MembershipSubscriptionOrder {
    audience: 'CUSTOMER' | 'ORGANISATION'
    orderId: string
    billingCycleId: number
    subscriptionId: number
    organisationId: number
    subscriberId: number
    subscriberName: string
    subscriberEmail: string
    membershipId: number
    membershipName: string
    membershipGroupName: string
    cycleType: string
    status: string
    periodStart: string
    periodEnd: string | null
    membershipPriceAmount: number
    unusedCreditAmount: number
    creditDiscountApplied: number
    finalAmountCharged: number
    refundedAmount: number
    paidAt: string | null
    createdAt: string
    paymentAttempts: MembershipPaymentAttempt[]
    refunds: MembershipSubscriptionRefund[]
}

export interface MembershipRefundPreview {
    billingCycleId: number
    paidAmount: number
    alreadyRefundedAmount: number
    refundableAmount: number
    unusedCreditAmount: number
    consumedAmount: number
    recommendedRefundAmount: number
    sameDay: boolean
    fullRefundOperation: 'VOID' | 'REFUND'
}

export interface MembershipEvent {
    id: number
    eventType: string
    actorType: string
    actorId: string
    reason: string | null
    snapshot: Record<string, unknown>
    createdAt: string
    createdAtDisplay: string | null
    membershipId: number | null
    membershipName: string | null
    membershipGroupName: string | null
    fromMembershipId: number | null
    fromMembershipName: string | null
    fromMembershipGroupName: string | null
    toMembershipId: number | null
    toMembershipName: string | null
    toMembershipGroupName: string | null
    isCurrentMembership: boolean
}

export interface MembershipSubscription {
    id: number
    organisationId: number
    customerId?: number
    membershipTypeId: number
    membershipId: number
    membershipName: string
    membershipGroupName?: string
    tierRank: number
    isChargeable: boolean
    priceAmount: number
    billingInterval: MembershipBillingInterval
    pricingRevision: number
    acceptedPricingRevision: number
    status: string
    currentPeriodStart: string
    currentPeriodStartDisplay?: string | null
    currentPeriodEnd: string | null
    currentPeriodEndDisplay?: string | null
    nextChargeAt: string | null
    nextChargeAtDisplay?: string | null
    cancelAtPeriodEnd: boolean
    cancelledAt: string | null
    joinedAt: string
    joinedAtDisplay?: string | null
    pendingActions: MembershipAction[]
    events?: MembershipEvent[]
    billingCycles?: MembershipBillingCycle[]
    paymentAttempts?: MembershipPaymentAttempt[]
}

export interface MembershipProductBenefit {
    organisationProductId: number
    name: string
    slug: string
    thumbnail: string | null
    categoryIds: number[]
    discountType: MembershipDiscountType
    discountValue: number
    discountSource: 'PRODUCT' | 'CATEGORY' | 'DEFAULT'
    variants: Array<{
        variantId: number
        sku: string
        priceAmount: number
        discountAmount: number
        finalPriceAmount: number
    }>
}

export interface MembershipActionLink {
    token: string
    relativeUrl: string
    expiresAt: string
}

export interface PublicMembershipAction {
    audience: 'CUSTOMER' | 'ORGANISATION'
    actionId: number
    membershipName: string
    priceAmount: number
    pricingRevision: number
    status: string
    expiresAt: string
}
