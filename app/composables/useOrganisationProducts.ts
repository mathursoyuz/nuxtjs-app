import type { OrganisationProductApiService } from '~/services/api/wrappers/organisation-product.api'

export const useOrganisationProducts = (): {
    getOverview: (
        page?: number | undefined,
        organisationId?: number | undefined
    ) => ReturnType<OrganisationProductApiService['getOverview']>
    getAllOrganisationProducts: (
        organisationId: number,
        forceRefresh?: boolean | undefined
    ) => ReturnType<OrganisationProductApiService['getAllOrganisationProducts']>
    createOrganisationProduct: (
        organisationId: number,
        data: import('~/types/organisation-product.types').CreateOrganisationProductDTO
    ) => ReturnType<OrganisationProductApiService['createOrganisationProduct']>
    updateOrganisationProduct: (
        organisationId: number,
        id: number,
        data: import('~/types/organisation-product.types').UpdateOrganisationProductDTO
    ) => ReturnType<OrganisationProductApiService['updateOrganisationProduct']>
    deleteOrganisationProduct: (
        organisationId: number,
        id: number
    ) => ReturnType<OrganisationProductApiService['deleteOrganisationProduct']>
    toggleOrganisationProduct: (
        organisationId: number,
        id: number,
        isActive: boolean
    ) => ReturnType<OrganisationProductApiService['toggleOrganisationProduct']>
    createProcurementOrder: (
        organisationId: number,
        data: import('~/types/order.types').CreateProcurementOrderDTO
    ) => ReturnType<OrganisationProductApiService['createProcurementOrder']>
    getProcurementCatalog: (
        organisationId: number
    ) => ReturnType<OrganisationProductApiService['getProcurementCatalog']>
    getProcurementOrders: (
        organisationId: number,
        status?: string | undefined,
        forceRefresh?: boolean | undefined
    ) => ReturnType<OrganisationProductApiService['getProcurementOrders']>
    chargeProcurementOrder: (
        organisationId: number,
        orderId: number,
        data: import('~/types/order.types').ChargeOrderDTO
    ) => ReturnType<OrganisationProductApiService['chargeProcurementOrder']>
    uploadOrganisationProductImages: (
        organisationId: number,
        id: number,
        formData: FormData
    ) => ReturnType<OrganisationProductApiService['uploadOrganisationProductImages']>
    deleteOrganisationProductGalleryImage: (
        organisationId: number,
        id: number,
        filename: string
    ) => ReturnType<OrganisationProductApiService['deleteOrganisationProductGalleryImage']>
} => {
    const api = useNuxtApp().$organisationProductApi as OrganisationProductApiService

    return {
        getOverview: (
            ...args: Parameters<OrganisationProductApiService['getOverview']>
        ): ReturnType<OrganisationProductApiService['getOverview']> => api.getOverview(...args),
        getAllOrganisationProducts: (
            ...args: Parameters<OrganisationProductApiService['getAllOrganisationProducts']>
        ): ReturnType<OrganisationProductApiService['getAllOrganisationProducts']> =>
            api.getAllOrganisationProducts(...args),
        createOrganisationProduct: (
            ...args: Parameters<OrganisationProductApiService['createOrganisationProduct']>
        ): ReturnType<OrganisationProductApiService['createOrganisationProduct']> =>
            api.createOrganisationProduct(...args),
        updateOrganisationProduct: (
            ...args: Parameters<OrganisationProductApiService['updateOrganisationProduct']>
        ): ReturnType<OrganisationProductApiService['updateOrganisationProduct']> =>
            api.updateOrganisationProduct(...args),
        deleteOrganisationProduct: (
            ...args: Parameters<OrganisationProductApiService['deleteOrganisationProduct']>
        ): ReturnType<OrganisationProductApiService['deleteOrganisationProduct']> =>
            api.deleteOrganisationProduct(...args),
        toggleOrganisationProduct: (
            ...args: Parameters<OrganisationProductApiService['toggleOrganisationProduct']>
        ): ReturnType<OrganisationProductApiService['toggleOrganisationProduct']> =>
            api.toggleOrganisationProduct(...args),
        createProcurementOrder: (
            ...args: Parameters<OrganisationProductApiService['createProcurementOrder']>
        ): ReturnType<OrganisationProductApiService['createProcurementOrder']> =>
            api.createProcurementOrder(...args),
        getProcurementCatalog: (
            ...args: Parameters<OrganisationProductApiService['getProcurementCatalog']>
        ): ReturnType<OrganisationProductApiService['getProcurementCatalog']> =>
            api.getProcurementCatalog(...args),
        getProcurementOrders: (
            ...args: Parameters<OrganisationProductApiService['getProcurementOrders']>
        ): ReturnType<OrganisationProductApiService['getProcurementOrders']> =>
            api.getProcurementOrders(...args),
        chargeProcurementOrder: (
            ...args: Parameters<OrganisationProductApiService['chargeProcurementOrder']>
        ): ReturnType<OrganisationProductApiService['chargeProcurementOrder']> =>
            api.chargeProcurementOrder(...args),
        uploadOrganisationProductImages: (
            ...args: Parameters<OrganisationProductApiService['uploadOrganisationProductImages']>
        ): ReturnType<OrganisationProductApiService['uploadOrganisationProductImages']> =>
            api.uploadOrganisationProductImages(...args),
        deleteOrganisationProductGalleryImage: (
            ...args: Parameters<
                OrganisationProductApiService['deleteOrganisationProductGalleryImage']
            >
        ): ReturnType<OrganisationProductApiService['deleteOrganisationProductGalleryImage']> =>
            api.deleteOrganisationProductGalleryImage(...args),
    }
}
