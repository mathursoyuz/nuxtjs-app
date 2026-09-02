export interface ClientCreditCard {
    id: number
    clientId: number
    ppi: string
    lastFour: string
    expMonth: string
    expYear: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateClientCreditCardDTO {
    cardNumber: string
    expMonth: string
    expYear: string
    cvc: string
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

export type UpdateClientCreditCardDTO = Partial<CreateClientCreditCardDTO>
