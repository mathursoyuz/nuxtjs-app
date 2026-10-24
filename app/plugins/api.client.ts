export default defineNuxtPlugin(async () => {
    const config = useRuntimeConfig()
    const { ApiClientImpl } = await import('~/services/api/ApiClientImpl')
    const { CachedApiClient } = await import('~/services/api/CachedApiClient')
    const { CacheServiceImpl } = await import('~/services/cache/CacheServiceImpl')
    const { StorageServiceImpl } = await import('~/services/storage/StorageServiceImpl')
    const { AuthServiceImpl } = await import('~/services/auth/AuthServiceImpl')
    const { AuthRepositoryImpl } = await import('~/services/auth/AuthRepositoryImpl')

    // Validate API base URL
    const apiBaseUrl = config.public.apiBaseUrl
    if (!apiBaseUrl) {
        console.error('NUXT_PUBLIC_API_BASE_URL is not set! API calls will fail.')
    }

    // Initialize services
    const apiClient = new ApiClientImpl(apiBaseUrl || '')
    const cacheService = new CacheServiceImpl()
    const cachedApiClient = new CachedApiClient(apiClient, cacheService)
    // Authentication is scoped to this browser tab. It survives refreshes but is
    // not automatically shared with other tabs.
    const storageService = new StorageServiceImpl(sessionStorage)
    // Acting-organisation selection is a browser preference, not authentication state.
    const contextStorageService = new StorageServiceImpl(localStorage)
    const authRepository = new AuthRepositoryImpl(cachedApiClient)
    const authService = new AuthServiceImpl(authRepository, storageService, cachedApiClient)

    // Set bearer token if available
    if (config.public.appBearerToken) {
        apiClient.setBearerToken(config.public.appBearerToken)
        cachedApiClient.setBearerToken(config.public.appBearerToken)
    }

    // Set auth token if available
    const authToken = storageService.get<string>('auth_token')
    if (authToken) {
        apiClient.setAuthToken(authToken)
        cachedApiClient.setAuthToken(authToken)
    }

    // Initialize API wrapper services
    const { ProductApiService } = await import('~/services/api/wrappers/product.api')
    const { AccessApiService } = await import('~/services/api/wrappers/access.api')
    const { CategoryApiService } = await import('~/services/api/wrappers/category.api')
    const { CustomerApiService } = await import('~/services/api/wrappers/customer.api')
    const { OrganisationApiService } = await import('~/services/api/wrappers/organisation.api')
    const { OrganisationProductApiService } =
        await import('~/services/api/wrappers/organisation-product.api')
    const { OrganisationCreditCardApiService } =
        await import('~/services/api/wrappers/organisation-credit-card.api')
    const { CustomerCreditCardApiService } =
        await import('~/services/api/wrappers/customer-credit-card.api')
    const { OrderApiService } = await import('~/services/api/wrappers/order.api')
    const { InventoryApiService } = await import('~/services/api/wrappers/inventory.api')
    const { LocationApiService } = await import('~/services/api/wrappers/location.api')
    const { CountryApiService } = await import('~/services/api/wrappers/country.api')
    const { QuickBooksApiService } = await import('~/services/api/wrappers/quickbooks.api')
    const { SquareApiService } = await import('~/services/api/wrappers/square.api')
    const { SquareImportApiService } = await import('~/services/api/wrappers/square-import.api')
    const { ShipStationApiService } = await import('~/services/api/wrappers/shipstation.api')
    const { CorksyApiService } = await import('~/services/api/wrappers/corksy.api')
    const { AuthorizeNetApiService } = await import('~/services/api/wrappers/authorize-net.api')
    const { MembershipApiService } = await import('~/services/api/wrappers/membership.api')

    const productApi = new ProductApiService(cachedApiClient)
    const accessApi = new AccessApiService(cachedApiClient)
    const categoryApi = new CategoryApiService(cachedApiClient)
    const customerApi = new CustomerApiService(cachedApiClient)
    const organisationApi = new OrganisationApiService(cachedApiClient)
    const organisationProductApi = new OrganisationProductApiService(cachedApiClient)
    const organisationCreditCardApi = new OrganisationCreditCardApiService(cachedApiClient)
    const customerCreditCardApi = new CustomerCreditCardApiService(cachedApiClient)
    const orderApi = new OrderApiService(cachedApiClient)
    const inventoryApi = new InventoryApiService(cachedApiClient)
    const locationApi = new LocationApiService(cachedApiClient)
    const countryApi = new CountryApiService(cachedApiClient)
    const quickbooksApi = new QuickBooksApiService(cachedApiClient)
    const squareApi = new SquareApiService(cachedApiClient)
    const squareImportApi = new SquareImportApiService(cachedApiClient)
    const shipstationApi = new ShipStationApiService(cachedApiClient)
    const corksyApi = new CorksyApiService(cachedApiClient)
    const authorizeNetApi = new AuthorizeNetApiService(cachedApiClient)
    const membershipApi = new MembershipApiService(cachedApiClient)

    return {
        provide: {
            apiClient: cachedApiClient,
            api: apiClient, // Keep for backward compatibility
            storage: storageService,
            contextStorage: contextStorageService,
            authService,
            // API wrapper services
            productApi,
            accessApi,
            categoryApi,
            customerApi,
            organisationApi,
            organisationProductApi,
            organisationCreditCardApi,
            customerCreditCardApi,
            orderApi,
            inventoryApi,
            locationApi,
            countryApi,
            quickbooksApi,
            squareApi,
            squareImportApi,
            shipstationApi,
            corksyApi,
            authorizeNetApi,
            membershipApi,
        },
    }
})
