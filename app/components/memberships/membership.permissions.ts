export const PLATFORM_MEMBERSHIP_PERMISSIONS = {
    READ: 'platform-memberships.read',
    CREATE: 'platform-memberships.create',
    UPDATE: 'platform-memberships.update',
    DELETE: 'platform-memberships.delete',
} as const

export const ORGANISATION_MEMBERSHIP_PERMISSIONS = {
    READ: 'organisation-memberships.read',
    CREATE: 'organisation-memberships.create',
    UPDATE: 'organisation-memberships.update',
    DELETE: 'organisation-memberships.delete',
} as const

export const CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS = {
    READ: 'customer-membership-subscriptions.read',
    CREATE: 'customer-membership-subscriptions.create',
    UPDATE: 'customer-membership-subscriptions.update',
} as const

export const ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS = {
    READ: 'organisation-membership-subscriptions.read',
    CREATE: 'organisation-membership-subscriptions.create',
    UPDATE: 'organisation-membership-subscriptions.update',
} as const
