import HttpFactory from '@/repository/factory';
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
export class ShipStationApiService extends HttpFactory {
    async getStores(): Promise<ApiResponse<ShipStationStore[]>> {
        return await this.call<ShipStationStore[]>('GET', '/shipstation/get-stores', undefined, {
            cacheKey: 'shipstation:stores',
            ttl: 5 * 60 * 1000,
        });
    }

    async getOrders(): Promise<ApiResponse<ShipStationOrder[]>> {
        return await this.call<ShipStationOrder[]>('GET', '/shipstation/get-orders', undefined, {
            cacheKey: 'shipstation:orders',
            ttl: 5 * 60 * 1000,
        });
    }

    async sendAllCorksyToShipstation(): Promise<ApiResponse<unknown>> {
        return await this.call<unknown>(
            'GET',
            '/shipstation/send-all-corksy-to-shipstation',
            undefined,
            { cacheKey: 'shipstation:sync', skipCache: true }
        );
    }

    async receiveShipmentData(data: ReceiveShipmentDataDTO): Promise<ApiResponse<void>> {
        return await this.call<void, ReceiveShipmentDataDTO>(
            'POST',
            '/shipstation/receive-shipment-data-url',
            data,
            { invalidatePattern: 'shipstation:shipments.*' }
        );
    }

    async getShipmentDetails(orderId: string): Promise<ApiResponse<void>> {
        return await this.call<void>(
            'GET',
            `/shipstation/get-shipment-details/${orderId}`,
            undefined,
            {
                cacheKey: `shipstation:shipments:${orderId}`,
                ttl: 5 * 60 * 1000,
            }
        );
    }
}

export default ShipStationApiService;
