import { computed } from 'vue';
import { useNuxtApp } from '#app';
import { useOrganisationStore } from '~/stores/organisation.store';
import { useToast } from '~/composables/useToast';
import { ORGANISATION_MESSAGES } from '~/constants/messages.constants';
import type { Organisation, CreateOrganisationDTO, UpdateOrganisationDTO } from '~/types/organisation.types';

export function useOrganisation() {
    const nuxtApp = useNuxtApp();
    const organisationStore = useOrganisationStore();
    const organisationApi = nuxtApp.$organisationApi as import('~/services/api/wrappers/organisation.api').OrganisationApiService;
    const { successFromResponse, errorFromError } = useToast();

    if (!organisationApi) {
        throw new Error('OrganisationApiService not available');
    }

    const fetchOrganisations = async (): Promise<Organisation[]> => {
        organisationStore.setLoading(true);
        organisationStore.clearError();

        try {
            const response = await organisationApi.getAllOrganisations();
            if (response.success && response.data) {
                organisationStore.setOrganisations(response.data);
                successFromResponse(response, ORGANISATION_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch organisations');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organisations';
            organisationStore.setError(errorMessage);
            errorFromError(error, ORGANISATION_MESSAGES.FETCH_ERROR);
            throw error;
        } finally {
            organisationStore.setLoading(false);
        }
    };

    const fetchOrganisationById = async (id: number): Promise<Organisation> => {
        organisationStore.setLoading(true);
        organisationStore.clearError();

        try {
            const response = await organisationApi.getOrganisationById(id);
            if (response.success && response.data) {
                organisationStore.setCurrentOrganisation(response.data);
                successFromResponse(response, ORGANISATION_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch organisation');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch organisation';
            organisationStore.setError(errorMessage);
            errorFromError(error, ORGANISATION_MESSAGES.FETCH_ERROR);
            throw error;
        } finally {
            organisationStore.setLoading(false);
        }
    };

    const createOrganisation = async (data: CreateOrganisationDTO): Promise<Organisation> => {
        organisationStore.setLoading(true);
        organisationStore.clearError();

        try {
            const response = await organisationApi.createOrganisation(data);
            if (response.success && response.data) {
                organisationStore.addOrganisation(response.data);
                successFromResponse(response, ORGANISATION_MESSAGES.CREATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create organisation');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create organisation';
            organisationStore.setError(errorMessage);
            errorFromError(error, ORGANISATION_MESSAGES.CREATE_ERROR);
            throw error;
        } finally {
            organisationStore.setLoading(false);
        }
    };

    const updateOrganisation = async (id: number, data: UpdateOrganisationDTO): Promise<Organisation> => {
        organisationStore.setLoading(true);
        organisationStore.clearError();

        try {
            const response = await organisationApi.updateOrganisation(id, data);
            if (response.success && response.data) {
                organisationStore.updateOrganisation(response.data);
                successFromResponse(response, ORGANISATION_MESSAGES.UPDATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to update organisation');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update organisation';
            organisationStore.setError(errorMessage);
            errorFromError(error, ORGANISATION_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            organisationStore.setLoading(false);
        }
    };

    const uploadLogo = async (id: number, file: File): Promise<void> => {
        organisationStore.setLoading(true);
        organisationStore.clearError();

        try {
            const response = await organisationApi.uploadOrganisationLogo(id, file);
            if (!response.success) {
                throw new Error(response.message || 'Failed to upload logo');
            }
            successFromResponse(response, 'Logo uploaded successfully');
            // Refresh organisation data after logo upload
            await fetchOrganisationById(id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
            organisationStore.setError(errorMessage);
            errorFromError(error, ORGANISATION_MESSAGES.LOGO_UPDATE_FAILED);
            throw error;
        } finally {
            organisationStore.setLoading(false);
        }
    };

    const toggleActive = async (id: number, isActive: boolean): Promise<Organisation> => {
        try {
            const response = await organisationApi.toggleActive(id, isActive);
            if (response.success && response.data) {
                organisationStore.updateOrganisation(response.data);
                const fallbackMessage = isActive ? ORGANISATION_MESSAGES.ACTIVATE_SUCCESS : ORGANISATION_MESSAGES.DEACTIVATE_SUCCESS;
                successFromResponse(response, fallbackMessage);
                return response.data;
            }
            throw new Error(response.message || 'Failed to toggle organisation status');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to toggle organisation status';
            organisationStore.setError(errorMessage);
            errorFromError(error, ORGANISATION_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            organisationStore.setLoading(false);
        }
    };

    return {
        organisations: computed(() => organisationStore.organisations),
        currentOrganisation: computed(() => organisationStore.currentOrganisation),
        loading: computed(() => organisationStore.loading),
        error: computed(() => organisationStore.error),
        activeOrganisations: computed(() => organisationStore.activeOrganisations),
        fetchOrganisations,
        fetchOrganisationById,
        createOrganisation,
        updateOrganisation,
        uploadLogo,
        toggleActive,
    };
}
