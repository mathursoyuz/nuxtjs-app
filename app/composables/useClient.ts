import { computed } from 'vue';
import { useNuxtApp } from '#app';
import { useClientStore } from '~/stores/client.store';
import { useToast } from '~/composables/useToast';
import { CLIENT_MESSAGES } from '~/constants/messages.constants';
import type { Client, CreateClientDTO, UpdateClientDTO } from '~/types/client.types';

export function useClient() {
    const nuxtApp = useNuxtApp();
    const clientStore = useClientStore();
    const clientApi = nuxtApp.$clientApi as import('~/services/api/wrappers/client.api').ClientApiService;
    const { successFromResponse, errorFromError } = useToast();

    if (!clientApi) {
        throw new Error('ClientApiService not available');
    }

    const fetchClients = async (): Promise<Client[]> => {
        clientStore.setLoading(true);
        clientStore.clearError();

        try {
            const response = await clientApi.getAllClients();
            if (response.success && response.data) {
                clientStore.setClients(response.data);
                successFromResponse(response, CLIENT_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch clients');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch clients';
            clientStore.setError(errorMessage);
            errorFromError(error, CLIENT_MESSAGES.FETCH_ERROR);
            throw error;
        } finally {
            clientStore.setLoading(false);
        }
    };

    const fetchClientById = async (id: number): Promise<Client> => {
        clientStore.setLoading(true);
        clientStore.clearError();

        try {
            const response = await clientApi.getClientById(id);
            if (response.success && response.data) {
                clientStore.setCurrentClient(response.data);
                successFromResponse(response, CLIENT_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch client');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch client';
            clientStore.setError(errorMessage);
            errorFromError(error, CLIENT_MESSAGES.FETCH_ERROR);
            throw error;
        } finally {
            clientStore.setLoading(false);
        }
    };

    const createClient = async (data: CreateClientDTO): Promise<Client> => {
        clientStore.setLoading(true);
        clientStore.clearError();

        try {
            const response = await clientApi.createClient(data);
            if (response.success && response.data) {
                clientStore.addClient(response.data);
                successFromResponse(response, CLIENT_MESSAGES.CREATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create client');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create client';
            clientStore.setError(errorMessage);
            errorFromError(error, CLIENT_MESSAGES.CREATE_ERROR);
            throw error;
        } finally {
            clientStore.setLoading(false);
        }
    };

    const updateClient = async (id: number, data: UpdateClientDTO): Promise<Client> => {
        clientStore.setLoading(true);
        clientStore.clearError();

        try {
            const response = await clientApi.updateClient(id, data);
            if (response.success && response.data) {
                clientStore.updateClient(response.data);
                successFromResponse(response, CLIENT_MESSAGES.UPDATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to update client');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update client';
            clientStore.setError(errorMessage);
            errorFromError(error, CLIENT_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            clientStore.setLoading(false);
        }
    };

    const uploadLogo = async (id: number, file: File): Promise<void> => {
        clientStore.setLoading(true);
        clientStore.clearError();

        try {
            const response = await clientApi.uploadClientLogo(id, file);
            if (!response.success) {
                throw new Error(response.message || 'Failed to upload logo');
            }
            successFromResponse(response, 'Logo uploaded successfully');
            // Refresh client data after logo upload
            await fetchClientById(id);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload logo';
            clientStore.setError(errorMessage);
            errorFromError(error, CLIENT_MESSAGES.LOGO_UPDATE_FAILED);
            throw error;
        } finally {
            clientStore.setLoading(false);
        }
    };

    const toggleActive = async (id: number, isActive: boolean): Promise<Client> => {
        try {
            const response = await clientApi.toggleActive(id, isActive);
            if (response.success && response.data) {
                clientStore.updateClient(response.data);
                const fallbackMessage = isActive ? CLIENT_MESSAGES.ACTIVATE_SUCCESS : CLIENT_MESSAGES.DEACTIVATE_SUCCESS;
                successFromResponse(response, fallbackMessage);
                return response.data;
            }
            throw new Error(response.message || 'Failed to toggle client status');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to toggle client status';
            clientStore.setError(errorMessage);
            errorFromError(error, CLIENT_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            clientStore.setLoading(false);
        }
    };

    return {
        clients: computed(() => clientStore.clients),
        currentClient: computed(() => clientStore.currentClient),
        loading: computed(() => clientStore.loading),
        error: computed(() => clientStore.error),
        activeClients: computed(() => clientStore.activeClients),
        fetchClients,
        fetchClientById,
        createClient,
        updateClient,
        uploadLogo,
        toggleActive,
    };
}
