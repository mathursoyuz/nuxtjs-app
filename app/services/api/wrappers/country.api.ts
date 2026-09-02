import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface Country {
    id: string;
    name: string;
}

export interface State {
    id: string;
    name: string;
}

export interface PhoneCountryCode {
    code: string;
    dialCode: string;
    name: string;
    flag: string;
}

/**
 * Country API wrapper service
 */
export class CountryApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getCountries(): Promise<ApiResponse<Country[]>> {
        return this.cachedApi.get<Country[]>('/countries', undefined, 'countries:all', 60 * 60 * 1000); // 1 hour cache (rarely changes)
    }

    async getStatesByCountry(countryId: string): Promise<ApiResponse<State[]>> {
        return this.cachedApi.get<State[]>(`/countries/${countryId}/states`, undefined, `countries:${countryId}:states`, 60 * 60 * 1000);
    }

    async getPhoneCountryCodes(): Promise<ApiResponse<PhoneCountryCode[]>> {
        return this.cachedApi.get<PhoneCountryCode[]>('/countries/phone-codes', undefined, 'countries:phone-codes', 60 * 60 * 1000);
    }

    async refreshCountries(): Promise<ApiResponse<Country[]>> {
        return this.cachedApi.get<Country[]>('/countries', undefined, 'countries:all', undefined, true);
    }
}
