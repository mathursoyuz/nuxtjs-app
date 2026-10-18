import { computed } from 'vue';
import { useNuxtApp } from '#app';
import { useLocationStore } from '~/stores/location.store';
import { useToast } from '~/composables/useToast';
import { LOCATION_MESSAGES } from '~/constants/messages.constants';
import type { Location, CreateLocationDTO, UpdateLocationDTO } from '~/types/location.types';
import { organisationContextRevision, isOrganisationContextCurrent } from '~/services/context/organisation-context-reset.registry';

export function useLocation() {
    const nuxtApp = useNuxtApp();
    const locationStore = useLocationStore();
    const locationApi = nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService;
    const { successFromResponse, errorFromError } = useToast();

    if (!locationApi) {
        throw new Error('LocationApiService not available');
    }

    const fetchLocations = async (organisationId?: number): Promise<Location[]> => {
        const contextRevision = organisationContextRevision();
        locationStore.setLoading(true);
        locationStore.clearError();

        try {
            const response = await locationApi.getAllLocations(organisationId);
            if (response.success && response.data) {
                if (isOrganisationContextCurrent(contextRevision)) locationStore.setLocations(response.data);
                successFromResponse(response, LOCATION_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch locations');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch locations';
            if (isOrganisationContextCurrent(contextRevision)) {
                locationStore.setError(errorMessage);
                errorFromError(error, LOCATION_MESSAGES.FETCH_ERROR);
            }
            throw error;
        } finally {
            if (isOrganisationContextCurrent(contextRevision)) locationStore.setLoading(false);
        }
    };

    const fetchLocationById = async (id: number): Promise<Location> => {
        const contextRevision = organisationContextRevision();
        locationStore.setLoading(true);
        locationStore.clearError();

        try {
            const response = await locationApi.getLocationById(id);
            if (response.success && response.data) {
                if (isOrganisationContextCurrent(contextRevision)) locationStore.setCurrentLocation(response.data);
                successFromResponse(response, LOCATION_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch location');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch location';
            if (isOrganisationContextCurrent(contextRevision)) {
                locationStore.setError(errorMessage);
                errorFromError(error, LOCATION_MESSAGES.FETCH_ERROR);
            }
            throw error;
        } finally {
            if (isOrganisationContextCurrent(contextRevision)) locationStore.setLoading(false);
        }
    };

    const createLocation = async (data: CreateLocationDTO): Promise<Location> => {
        locationStore.setLoading(true);
        locationStore.clearError();

        try {
            const response = await locationApi.createLocation(data);
            if (response.success && response.data) {
                locationStore.addLocation(response.data);
                successFromResponse(response, LOCATION_MESSAGES.CREATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create location');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create location';
            locationStore.setError(errorMessage);
            errorFromError(error, LOCATION_MESSAGES.CREATE_ERROR);
            throw error;
        } finally {
            locationStore.setLoading(false);
        }
    };

    const updateLocation = async (id: number, data: UpdateLocationDTO): Promise<Location> => {
        locationStore.setLoading(true);
        locationStore.clearError();

        try {
            const response = await locationApi.updateLocation(id, data);
            if (response.success && response.data) {
                locationStore.updateLocation(response.data);
                successFromResponse(response, LOCATION_MESSAGES.UPDATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to update location');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update location';
            locationStore.setError(errorMessage);
            errorFromError(error, LOCATION_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            locationStore.setLoading(false);
        }
    };

    const deleteLocation = async (id: number): Promise<void> => {
        locationStore.setLoading(true);
        locationStore.clearError();

        try {
            const response = await locationApi.deleteLocation(id);
            if (response.success) {
                locationStore.removeLocation(id);
                successFromResponse(response, LOCATION_MESSAGES.DELETE_SUCCESS);
            } else {
                throw new Error(response.message || 'Failed to delete location');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete location';
            locationStore.setError(errorMessage);
            errorFromError(error, LOCATION_MESSAGES.DELETE_ERROR);
            throw error;
        } finally {
            locationStore.setLoading(false);
        }
    };

    return {
        locations: computed(() => locationStore.locations),
        currentLocation: computed(() => locationStore.currentLocation),
        loading: computed(() => locationStore.loading),
        error: computed(() => locationStore.error),
        activeLocations: computed(() => locationStore.activeLocations),
        locationsByOrganisation: (organisationId: number) => computed(() => locationStore.locationsByOrganisation(organisationId)),
        fetchLocations,
        fetchLocationById,
        createLocation,
        updateLocation,
        deleteLocation,
    };
}
