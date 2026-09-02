import { computed, ref } from 'vue';
import { useNuxtApp } from '#app';
import type { Country, State, PhoneCountryCode } from '~/services/api/wrappers/country.api';

export function useCountry() {
    const nuxtApp = useNuxtApp();
    const countryApi = nuxtApp.$countryApi as import('~/services/api/wrappers/country.api').CountryApiService;

    if (!countryApi) {
        throw new Error('CountryApiService not available');
    }

    const countries = ref<Country[]>([]);
    const states = ref<Record<string, State[]>>({});
    const phoneCountryCodes = ref<PhoneCountryCode[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const fetchCountries = async (): Promise<Country[]> => {
        loading.value = true;
        error.value = null;

        try {
            const response = await countryApi.getCountries();
            if (response.success && response.data) {
                countries.value = response.data;
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch countries');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch countries';
            error.value = errorMessage;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchStates = async (countryId: string): Promise<State[]> => {
        // Check cache first
        if (states.value[countryId]) {
            return states.value[countryId];
        }

        loading.value = true;
        error.value = null;

        try {
            const response = await countryApi.getStatesByCountry(countryId);
            if (response.success && response.data) {
                states.value[countryId] = response.data;
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch states');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch states';
            error.value = errorMessage;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const fetchPhoneCountryCodes = async (): Promise<PhoneCountryCode[]> => {
        if (phoneCountryCodes.value.length > 0) {
            return phoneCountryCodes.value;
        }

        loading.value = true;
        error.value = null;

        try {
            const response = await countryApi.getPhoneCountryCodes();
            if (response.success && response.data) {
                phoneCountryCodes.value = response.data;
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch phone country codes');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch phone country codes';
            error.value = errorMessage;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const getCountryOptions = computed(() => {
        return countries.value.map((c) => ({
            title: c.name,
            value: c.id,
        }));
    });

    const getStateOptions = (countryId: string) => {
        return computed(() => {
            const countryStates = states.value[countryId] || [];
            return countryStates.map((s) => ({
                title: s.name,
                value: s.id,
            }));
        });
    };

    const getPhoneCountryCodeOptions = computed(() => {
        return phoneCountryCodes.value.map((c) => ({
            ...c,
            label: `${c.flag} ${c.name} (${c.dialCode})`,
        }));
    });

    return {
        countries: computed(() => countries.value),
        states: computed(() => states.value),
        phoneCountryCodes: computed(() => phoneCountryCodes.value),
        loading: computed(() => loading.value),
        error: computed(() => error.value),
        countryOptions: getCountryOptions,
        phoneCountryCodeOptions: getPhoneCountryCodeOptions,
        fetchCountries,
        fetchStates,
        fetchPhoneCountryCodes,
        getStateOptions,
    };
}
