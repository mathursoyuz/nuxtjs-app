import HttpFactory from '@/repository/factory';
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
export class CountryApiService extends HttpFactory {
    async getCountries(): Promise<ApiResponse<Country[]>> {
        return await this.call<Country[]>('GET', '/countries', undefined, {
            cacheKey: 'countries:all',
            ttl: 60 * 60 * 1000,
        });
    }

    async getStatesByCountry(countryId: string): Promise<ApiResponse<State[]>> {
        return await this.call<State[]>('GET', `/countries/${countryId}/states`, undefined, {
            cacheKey: `countries:${countryId}:states`,
            ttl: 60 * 60 * 1000,
        });
    }

    async getPhoneCountryCodes(): Promise<ApiResponse<PhoneCountryCode[]>> {
        return await this.call<PhoneCountryCode[]>('GET', '/countries/phone-codes', undefined, {
            cacheKey: 'countries:phone-codes',
            ttl: 60 * 60 * 1000,
        });
    }

    async refreshCountries(): Promise<ApiResponse<Country[]>> {
        return await this.call<Country[]>('GET', '/countries', undefined, {
            cacheKey: 'countries:all',
            skipCache: true,
        });
    }
}

export default CountryApiService;
