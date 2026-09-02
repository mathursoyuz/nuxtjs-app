import { ApiClientImpl } from '~/services/api/ApiClientImpl';
import type { ApiClient } from '~/services/api/ApiClient';

let apiClientInstance: ApiClient | null = null;

export function useApiClient(): ApiClient {
    if (!apiClientInstance) {
        const config = useRuntimeConfig();
        apiClientInstance = new ApiClientImpl(config.public.apiBaseUrl);
    }
    return apiClientInstance;
}
