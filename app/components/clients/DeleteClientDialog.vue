<template>
    <v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="500" persistent>
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-h5">Delete Client</span>
                <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-4">
                <div v-if="client" class="text-body-1">
                    <p class="mb-4">
                        Are you sure you want to delete <strong>{{ client.name }}</strong>?
                    </p>
                    <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
                        This action will soft delete the client. This action cannot be undone.
                    </v-alert>
                    <div class="text-caption text-medium-emphasis">
                        <div><strong>Email:</strong> {{ client.email }}</div>
                        <div><strong>Website:</strong> {{ client.websiteUrl }}</div>
                    </div>
                </div>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" :disabled="loading" @click="$emit('update:modelValue', false)">
                    Cancel
                </v-btn>
                <v-btn color="error" :loading="loading" @click="handleDelete">
                    Delete
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useNuxtApp } from '#app';
import { useToast } from '~/composables/useToast';
import { CLIENT_MESSAGES } from '~/constants/messages.constants';
import type { Client } from '~/types/client.types';

interface Props {
    modelValue: boolean;
    client: Client | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'submit': [];
}>();

const nuxtApp = useNuxtApp();
const clientApi = nuxtApp.$clientApi as import('~/services/api/wrappers/client.api').ClientApiService;
const { successFromResponse, errorFromError, show: showToast } = useToast();

const loading = ref(false);

const handleDelete = async () => {
    if (!props.client) return;

    loading.value = true;
    try {
        const response = await clientApi.deleteClient(props.client.id);
        if (response.success) {
            successFromResponse(response, CLIENT_MESSAGES.DELETE_SUCCESS || 'Client deleted successfully');
            emit('submit');
            emit('update:modelValue', false);
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        errorFromError(error, CLIENT_MESSAGES.DELETE_ERROR);
    } finally {
        loading.value = false;
    }
};
</script>
