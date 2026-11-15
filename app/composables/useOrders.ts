import type { OrderApiService } from '~/services/api/wrappers/order.api'

export const useOrders = (): {
    searchCustomerOrderCustomers: (params: {
        organisationId?: number
        page?: number
        limit?: number
        search?: string
    }) => ReturnType<OrderApiService['searchCustomerOrderCustomers']>
    getCustomerOrderCustomer: (
        customerId: number
    ) => ReturnType<OrderApiService['getCustomerOrderCustomer']>
    getCustomerOrderCards: (
        customerId: number
    ) => ReturnType<OrderApiService['getCustomerOrderCards']>
    createCustomerOrderCard: (
        customerId: number,
        data: import('~/services/api/wrappers/customer-credit-card.api').CreateCustomerCreditCardDTO
    ) => ReturnType<OrderApiService['createCustomerOrderCard']>
    addCustomerOrderShippingAddress: (
        customerId: number,
        data: import('~/services/api/wrappers/customer.api').CustomerShippingAddressDTO
    ) => ReturnType<OrderApiService['addCustomerOrderShippingAddress']>
    updateCustomerOrderShippingAddress: (
        customerId: number,
        shippingId: number,
        data: import('~/services/api/wrappers/customer.api').CustomerShippingAddressDTO
    ) => ReturnType<OrderApiService['updateCustomerOrderShippingAddress']>
    deleteCustomerOrderShippingAddress: (
        customerId: number,
        shippingId: number
    ) => ReturnType<OrderApiService['deleteCustomerOrderShippingAddress']>
    getCustomerOrderCatalog: (
        organisationId: number
    ) => ReturnType<OrderApiService['getCustomerOrderCatalog']>
    getPendingCustomerOrderCustomer: (
        orderId: number
    ) => ReturnType<OrderApiService['getPendingCustomerOrderCustomer']>
    getPendingCustomerOrderCards: (
        orderId: number
    ) => ReturnType<OrderApiService['getPendingCustomerOrderCards']>
    createPendingCustomerOrderCard: (
        orderId: number,
        data: import('~/services/api/wrappers/customer-credit-card.api').CreateCustomerCreditCardDTO
    ) => ReturnType<OrderApiService['createPendingCustomerOrderCard']>
    addPendingCustomerOrderShippingAddress: (
        orderId: number,
        data: import('~/services/api/wrappers/customer.api').CustomerShippingAddressDTO
    ) => ReturnType<OrderApiService['addPendingCustomerOrderShippingAddress']>
    updatePendingCustomerOrderShippingAddress: (
        orderId: number,
        shippingId: number,
        data: import('~/services/api/wrappers/customer.api').CustomerShippingAddressDTO
    ) => ReturnType<OrderApiService['updatePendingCustomerOrderShippingAddress']>
    deletePendingCustomerOrderShippingAddress: (
        orderId: number,
        shippingId: number
    ) => ReturnType<OrderApiService['deletePendingCustomerOrderShippingAddress']>
    getPendingCustomerOrderCatalog: (
        orderId: number
    ) => ReturnType<OrderApiService['getPendingCustomerOrderCatalog']>
    getProcurementOrders: (
        params?:
            | { organisationId?: number; status?: string; cursor?: number; limit?: number }
            | undefined
    ) => ReturnType<OrderApiService['getProcurementOrders']>
    getProcurementOrder: (orderId: number) => ReturnType<OrderApiService['getProcurementOrder']>
    chargeProcurementOrder: (
        orderId: number,
        data: import('~/types/order.types').ChargeOrderDTO
    ) => ReturnType<OrderApiService['chargeProcurementOrder']>
    getCustomerOrders: (
        params?:
            | {
                  organisationId?: number
                  customerId?: number
                  status?: string
                  cursor?: number
                  limit?: number
              }
            | undefined
    ) => ReturnType<OrderApiService['getCustomerOrders']>
    createCustomerOrder: (
        organisationId: number,
        data: import('~/types/order.types').CreateCustomerOrderDTO
    ) => ReturnType<OrderApiService['createCustomerOrder']>
    getCustomerOrder: (orderId: number) => ReturnType<OrderApiService['getCustomerOrder']>
    updatePendingCustomerOrder: (
        orderId: number,
        data: import('~/types/order.types').UpdatePendingCustomerOrderDTO
    ) => ReturnType<OrderApiService['updatePendingCustomerOrder']>
    chargeCustomerOrder: (
        orderId: number,
        data: import('~/types/order.types').ChargeOrderDTO
    ) => ReturnType<OrderApiService['chargeCustomerOrder']>
    cancelCustomerOrder: (orderId: number) => ReturnType<OrderApiService['cancelCustomerOrder']>
    completeCustomerOrder: (orderId: number) => ReturnType<OrderApiService['completeCustomerOrder']>
    refundCustomerOrder: (
        orderId: number,
        data: import('~/types/order.types').RefundCustomerOrderDTO
    ) => ReturnType<OrderApiService['refundCustomerOrder']>
} => {
    const api = useNuxtApp().$orderApi as OrderApiService

    return {
        searchCustomerOrderCustomers: (
            ...args: Parameters<OrderApiService['searchCustomerOrderCustomers']>
        ): ReturnType<OrderApiService['searchCustomerOrderCustomers']> =>
            api.searchCustomerOrderCustomers(...args),
        getCustomerOrderCustomer: (
            ...args: Parameters<OrderApiService['getCustomerOrderCustomer']>
        ): ReturnType<OrderApiService['getCustomerOrderCustomer']> =>
            api.getCustomerOrderCustomer(...args),
        getCustomerOrderCards: (
            ...args: Parameters<OrderApiService['getCustomerOrderCards']>
        ): ReturnType<OrderApiService['getCustomerOrderCards']> =>
            api.getCustomerOrderCards(...args),
        createCustomerOrderCard: (
            ...args: Parameters<OrderApiService['createCustomerOrderCard']>
        ): ReturnType<OrderApiService['createCustomerOrderCard']> =>
            api.createCustomerOrderCard(...args),
        addCustomerOrderShippingAddress: (
            ...args: Parameters<OrderApiService['addCustomerOrderShippingAddress']>
        ): ReturnType<OrderApiService['addCustomerOrderShippingAddress']> =>
            api.addCustomerOrderShippingAddress(...args),
        updateCustomerOrderShippingAddress: (
            ...args: Parameters<OrderApiService['updateCustomerOrderShippingAddress']>
        ): ReturnType<OrderApiService['updateCustomerOrderShippingAddress']> =>
            api.updateCustomerOrderShippingAddress(...args),
        deleteCustomerOrderShippingAddress: (
            ...args: Parameters<OrderApiService['deleteCustomerOrderShippingAddress']>
        ): ReturnType<OrderApiService['deleteCustomerOrderShippingAddress']> =>
            api.deleteCustomerOrderShippingAddress(...args),
        getCustomerOrderCatalog: (
            ...args: Parameters<OrderApiService['getCustomerOrderCatalog']>
        ): ReturnType<OrderApiService['getCustomerOrderCatalog']> =>
            api.getCustomerOrderCatalog(...args),
        getPendingCustomerOrderCustomer: (
            ...args: Parameters<OrderApiService['getPendingCustomerOrderCustomer']>
        ): ReturnType<OrderApiService['getPendingCustomerOrderCustomer']> =>
            api.getPendingCustomerOrderCustomer(...args),
        getPendingCustomerOrderCards: (
            ...args: Parameters<OrderApiService['getPendingCustomerOrderCards']>
        ): ReturnType<OrderApiService['getPendingCustomerOrderCards']> =>
            api.getPendingCustomerOrderCards(...args),
        createPendingCustomerOrderCard: (
            ...args: Parameters<OrderApiService['createPendingCustomerOrderCard']>
        ): ReturnType<OrderApiService['createPendingCustomerOrderCard']> =>
            api.createPendingCustomerOrderCard(...args),
        addPendingCustomerOrderShippingAddress: (
            ...args: Parameters<OrderApiService['addPendingCustomerOrderShippingAddress']>
        ): ReturnType<OrderApiService['addPendingCustomerOrderShippingAddress']> =>
            api.addPendingCustomerOrderShippingAddress(...args),
        updatePendingCustomerOrderShippingAddress: (
            ...args: Parameters<OrderApiService['updatePendingCustomerOrderShippingAddress']>
        ): ReturnType<OrderApiService['updatePendingCustomerOrderShippingAddress']> =>
            api.updatePendingCustomerOrderShippingAddress(...args),
        deletePendingCustomerOrderShippingAddress: (
            ...args: Parameters<OrderApiService['deletePendingCustomerOrderShippingAddress']>
        ): ReturnType<OrderApiService['deletePendingCustomerOrderShippingAddress']> =>
            api.deletePendingCustomerOrderShippingAddress(...args),
        getPendingCustomerOrderCatalog: (
            ...args: Parameters<OrderApiService['getPendingCustomerOrderCatalog']>
        ): ReturnType<OrderApiService['getPendingCustomerOrderCatalog']> =>
            api.getPendingCustomerOrderCatalog(...args),
        getProcurementOrders: (
            ...args: Parameters<OrderApiService['getProcurementOrders']>
        ): ReturnType<OrderApiService['getProcurementOrders']> => api.getProcurementOrders(...args),
        getProcurementOrder: (
            ...args: Parameters<OrderApiService['getProcurementOrder']>
        ): ReturnType<OrderApiService['getProcurementOrder']> => api.getProcurementOrder(...args),
        chargeProcurementOrder: (
            ...args: Parameters<OrderApiService['chargeProcurementOrder']>
        ): ReturnType<OrderApiService['chargeProcurementOrder']> =>
            api.chargeProcurementOrder(...args),
        getCustomerOrders: (
            ...args: Parameters<OrderApiService['getCustomerOrders']>
        ): ReturnType<OrderApiService['getCustomerOrders']> => api.getCustomerOrders(...args),
        createCustomerOrder: (
            ...args: Parameters<OrderApiService['createCustomerOrder']>
        ): ReturnType<OrderApiService['createCustomerOrder']> => api.createCustomerOrder(...args),
        getCustomerOrder: (
            ...args: Parameters<OrderApiService['getCustomerOrder']>
        ): ReturnType<OrderApiService['getCustomerOrder']> => api.getCustomerOrder(...args),
        updatePendingCustomerOrder: (
            ...args: Parameters<OrderApiService['updatePendingCustomerOrder']>
        ): ReturnType<OrderApiService['updatePendingCustomerOrder']> =>
            api.updatePendingCustomerOrder(...args),
        chargeCustomerOrder: (
            ...args: Parameters<OrderApiService['chargeCustomerOrder']>
        ): ReturnType<OrderApiService['chargeCustomerOrder']> => api.chargeCustomerOrder(...args),
        cancelCustomerOrder: (
            ...args: Parameters<OrderApiService['cancelCustomerOrder']>
        ): ReturnType<OrderApiService['cancelCustomerOrder']> => api.cancelCustomerOrder(...args),
        completeCustomerOrder: (
            ...args: Parameters<OrderApiService['completeCustomerOrder']>
        ): ReturnType<OrderApiService['completeCustomerOrder']> =>
            api.completeCustomerOrder(...args),
        refundCustomerOrder: (
            ...args: Parameters<OrderApiService['refundCustomerOrder']>
        ): ReturnType<OrderApiService['refundCustomerOrder']> => api.refundCustomerOrder(...args),
    }
}
