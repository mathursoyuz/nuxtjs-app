import type { ShipStationApiService } from '~/services/api/wrappers/shipstation.api'

export const useShipStation = () => {
    const api = useNuxtApp().$shipstationApi as ShipStationApiService

    return {
        getStores: (
            ...args: Parameters<ShipStationApiService['getStores']>
        ): ReturnType<ShipStationApiService['getStores']> => api.getStores(...args),
        getOrders: (
            ...args: Parameters<ShipStationApiService['getOrders']>
        ): ReturnType<ShipStationApiService['getOrders']> => api.getOrders(...args),
    }
}
