import type { OrganisationApiService } from '~/services/api/wrappers/organisation.api'

export const useOrganisationManagement = (): {
    createOrganisation: (
        data: import('~/services/api/wrappers/organisation.api').CreateOrganisationDTO
    ) => ReturnType<OrganisationApiService['createOrganisation']>
    updateOrganisation: (
        id: number,
        data: import('~/services/api/wrappers/organisation.api').UpdateOrganisationDTO
    ) => ReturnType<OrganisationApiService['updateOrganisation']>
    updateOrganisationBilling: (
        id: number,
        data: import('~/services/api/wrappers/organisation.api').UpdateOrganisationBillingDTO
    ) => ReturnType<OrganisationApiService['updateOrganisationBilling']>
    checkEmailExists: (
        email: string,
        organisationId?: number | undefined
    ) => ReturnType<OrganisationApiService['checkEmailExists']>
    deleteOrganisation: (id: number) => ReturnType<OrganisationApiService['deleteOrganisation']>
} => {
    const api = useNuxtApp().$organisationApi as OrganisationApiService

    return {
        createOrganisation: (
            ...args: Parameters<OrganisationApiService['createOrganisation']>
        ): ReturnType<OrganisationApiService['createOrganisation']> =>
            api.createOrganisation(...args),
        updateOrganisation: (
            ...args: Parameters<OrganisationApiService['updateOrganisation']>
        ): ReturnType<OrganisationApiService['updateOrganisation']> =>
            api.updateOrganisation(...args),
        updateOrganisationBilling: (
            ...args: Parameters<OrganisationApiService['updateOrganisationBilling']>
        ): ReturnType<OrganisationApiService['updateOrganisationBilling']> =>
            api.updateOrganisationBilling(...args),
        checkEmailExists: (
            ...args: Parameters<OrganisationApiService['checkEmailExists']>
        ): ReturnType<OrganisationApiService['checkEmailExists']> => api.checkEmailExists(...args),
        deleteOrganisation: (
            ...args: Parameters<OrganisationApiService['deleteOrganisation']>
        ): ReturnType<OrganisationApiService['deleteOrganisation']> =>
            api.deleteOrganisation(...args),
    }
}
