export interface ShipStationStore {
    [key: string]: unknown;
}

export interface ShipStationOrder {
    [key: string]: unknown;
}

export interface ReceiveShipmentDataDTO {
    resource_type: string;
    resource_url: string;
}

export interface CorksyOrder {
    [key: string]: unknown;
}

export interface CreateCustomerProfileInputDTO {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
}

export interface CustomerProfileResult {
    customerProfileId: string;
    [key: string]: unknown;
}
