import type { AuthorizeNetApiService } from '~/services/api/wrappers/authorize-net.api'

export const useAuthorizeNet = (): {
    createCustomerProfile: (
        data: import('@/types/authorize-net.types').CreateAuthorizeNetProfileInput
    ) => ReturnType<AuthorizeNetApiService['createCustomerProfile']>
} => {
    const api = useNuxtApp().$authorizeNetApi as AuthorizeNetApiService

    return {
        createCustomerProfile: (
            ...args: Parameters<AuthorizeNetApiService['createCustomerProfile']>
        ): ReturnType<AuthorizeNetApiService['createCustomerProfile']> =>
            api.createCustomerProfile(...args),
    }
}
