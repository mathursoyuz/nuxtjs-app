import type { OrganisationCreditCardApiService } from '~/services/api/wrappers/organisation-credit-card.api'

export const useOrganisationCreditCards = (): {
    getAllOrganisationCreditCards: (
        organisationId: number
    ) => ReturnType<OrganisationCreditCardApiService['getAllOrganisationCreditCards']>
    createOrganisationCreditCard: (
        organisationId: number,
        data: import('~/types/organisation-credit-card.types').CreateOrganisationCreditCardDTO
    ) => ReturnType<OrganisationCreditCardApiService['createOrganisationCreditCard']>
    toggleActive: (
        organisationId: number,
        id: number,
        isActive: boolean
    ) => ReturnType<OrganisationCreditCardApiService['toggleActive']>
    refreshOrganisationCreditCards: (
        organisationId: number
    ) => ReturnType<OrganisationCreditCardApiService['refreshOrganisationCreditCards']>
} => {
    const api = useNuxtApp().$organisationCreditCardApi as OrganisationCreditCardApiService

    return {
        getAllOrganisationCreditCards: (
            ...args: Parameters<OrganisationCreditCardApiService['getAllOrganisationCreditCards']>
        ): ReturnType<OrganisationCreditCardApiService['getAllOrganisationCreditCards']> =>
            api.getAllOrganisationCreditCards(...args),
        createOrganisationCreditCard: (
            ...args: Parameters<OrganisationCreditCardApiService['createOrganisationCreditCard']>
        ): ReturnType<OrganisationCreditCardApiService['createOrganisationCreditCard']> =>
            api.createOrganisationCreditCard(...args),
        toggleActive: (
            ...args: Parameters<OrganisationCreditCardApiService['toggleActive']>
        ): ReturnType<OrganisationCreditCardApiService['toggleActive']> =>
            api.toggleActive(...args),
        refreshOrganisationCreditCards: (
            ...args: Parameters<OrganisationCreditCardApiService['refreshOrganisationCreditCards']>
        ): ReturnType<OrganisationCreditCardApiService['refreshOrganisationCreditCards']> =>
            api.refreshOrganisationCreditCards(...args),
    }
}
