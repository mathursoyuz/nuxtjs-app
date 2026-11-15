export interface OrganisationCreditCard {
    id: number
    organisationId: number
    lastFour: string
    expMonth: string
    expYear: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateOrganisationCreditCardDTO extends PaymentCardDetails {
    isActive: boolean
    billingFirstName: string
    billingLastName: string
    billingCompany: string
    billingAddress: string
    billingCity: string
    billingStateCode: string
    billingPostalCode: string
    billingCountryCode: string
    billingPhone: string
}

export type UpdateOrganisationCreditCardDTO = Partial<CreateOrganisationCreditCardDTO>
import type { PaymentCardDetails } from './payment-details.types'
