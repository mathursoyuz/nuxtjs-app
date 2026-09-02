export interface Location {
    id: number;
    clientId: number;
    name: string;
    address: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    phoneNumber: string | null;
    lat: string | null;
    long: string | null;
    squareLocationId: string | null;
    isSquareSynced: boolean;
    qbLocationId: string | null;
    isQbSynced: boolean;
    qbSyncErrorReason: string | null;
    qbLastSyncedAt: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLocationDTO {
    clientId: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    phoneNumber?: string;
    lat?: string;
    long?: string;
    squareLocationId?: string;
    isActive?: boolean;
}

export interface UpdateLocationDTO extends Partial<CreateLocationDTO> {}
