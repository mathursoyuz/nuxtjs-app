export interface PaymentCardDetails {
    cardNumber: string
    expMonth: string
    expYear: string
    cvc: string
}

export interface AddressDetails {
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

export interface BillingDetails extends AddressDetails {
    billingEmail: string
}

export type ShippingDetails = AddressDetails
