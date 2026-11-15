import type { CorksyApiService } from '~/services/api/wrappers/corksy.api'

export const useCorksy = () => {
    const api = useNuxtApp().$corksyApi as CorksyApiService

    return {
        getAccessToken: (
            ...args: Parameters<CorksyApiService['getAccessToken']>
        ): ReturnType<CorksyApiService['getAccessToken']> => api.getAccessToken(...args),
        listStoredOrders: (
            ...args: Parameters<CorksyApiService['listStoredOrders']>
        ): ReturnType<CorksyApiService['listStoredOrders']> => api.listStoredOrders(...args),
        syncOrdersFromCorksy: (
            ...args: Parameters<CorksyApiService['syncOrdersFromCorksy']>
        ): ReturnType<CorksyApiService['syncOrdersFromCorksy']> =>
            api.syncOrdersFromCorksy(...args),
        listConfigs: (
            ...args: Parameters<CorksyApiService['listConfigs']>
        ): ReturnType<CorksyApiService['listConfigs']> => api.listConfigs(...args),
    }
}
