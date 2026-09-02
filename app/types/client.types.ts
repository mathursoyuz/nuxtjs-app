export interface Client {
    id: number;
    name: string;
    email: string;
    password: string;
    websiteUrl: string;
    shippingCost: number;
    referralCode: string | null;
    description: string | null;
    logo: string | null;
    billingFirstName: string;
    billingLastName: string;
    billingCompany: string;
    billingAddress: string;
    billingCity: string;
    billingStateCode: string;
    billingPostalCode: string;
    billingCountryCode: string;
    billingPhone: string;
    isActive: boolean;
    squareAccessToken: string | null;
    qbRealmId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateClientDTO {
    name: string;
    email: string;
    password: string;
    websiteUrl: string;
    shippingCost: number;
    referralCode?: string | null;
    description?: string | null;
    logo?: string | null;
    billingFirstName: string;
    billingLastName: string;
    billingCompany: string;
    billingAddress: string;
    billingCity: string;
    billingStateCode: string;
    billingPostalCode: string;
    billingCountryCode: string;
    billingPhone: string;
    isActive: boolean;
    squareAccessToken?: string | null;
    qbRealmId?: string | null;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {}
