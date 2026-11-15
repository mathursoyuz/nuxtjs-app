export type AuthorizeNetEntityType = 'organisation' | 'customer'

export interface AuthorizeNetBillingAddress {
    email: string
    firstName: string
    lastName: string
    company?: string | null
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
    phoneNumber?: string
}

export interface AuthorizeNetPaymentCard {
    cardNumber: string
    expMonth: string
    expYear: string
    cvc: string
}

export interface CreateAuthorizeNetProfileInput {
    id: number
    entityType: AuthorizeNetEntityType
    billing: AuthorizeNetBillingAddress
    card: AuthorizeNetPaymentCard
}

export interface AuthorizeNetCustomerProfileResult {
    customerProfileId: string
    paymentProfileId: string
}

export interface CreateAuthorizeNetProfileResponse {
    success: true
    result: AuthorizeNetCustomerProfileResult
}
