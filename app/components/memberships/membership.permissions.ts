export const PLATFORM_MEMBERSHIP_PERMISSIONS = {
    READ: 'platform-memberships.read',
    WRITE: 'platform-memberships.write',
    DELETE: 'platform-memberships.delete',
} as const

export const ORGANISATION_MEMBERSHIP_PERMISSIONS = {
    READ: 'organisation-memberships.read',
    WRITE: 'organisation-memberships.write',
    DELETE: 'organisation-memberships.delete',
} as const

export const CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS = {
    READ: 'customer-membership-subscriptions.read',
    WRITE: 'customer-membership-subscriptions.write',
} as const

export const ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS = {
    READ: 'organisation-membership-subscriptions.read',
    WRITE: 'organisation-membership-subscriptions.write',
} as const
