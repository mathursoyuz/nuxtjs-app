import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

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

/**
 * ShipStation API wrapper service
 */
export class ShipStationApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getStores(): Promise<ApiResponse<ShipStationStore[]>> {
        return this.cachedApi.get<ShipStationStore[]>('/shipstation/get-stores', undefined, 'shipstation:stores', 5 * 60 * 1000);
    }

    async getOrders(): Promise<ApiResponse<ShipStationOrder[]>> {
        return this.cachedApi.get<ShipStationOrder[]>('/shipstation/get-orders', undefined, 'shipstation:orders', 5 * 60 * 1000);
    }

    async sendAllCorksyToShipstation(): Promise<ApiResponse<unknown>> {
        return this.cachedApi.get<unknown>('/shipstation/send-all-corksy-to-shipstation', undefined, 'shipstation:sync', undefined, true);
    }

    async receiveShipmentData(data: ReceiveShipmentDataDTO): Promise<ApiResponse<void>> {
        return this.cachedApi.post<void>('/shipstation/receive-shipment-data-url', data, undefined, 'shipstation:shipments.*');
    }

    async getShipmentDetails(orderId: string): Promise<ApiResponse<void>> {
        return this.cachedApi.get<void>(`/shipstation/get-shipment-details/${orderId}`, undefined, `shipstation:shipments:${orderId}`, 5 * 60 * 1000);
    }
}
