<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Locations</h1>
                    <RoleGuard roles="admin">
                        <v-btn color="primary" prepend-icon="mdi-plus" @click="openDialog()">
                            Create Location
                        </v-btn>
                    </RoleGuard>
                </div>

                <v-card>
                    <v-card-text>
                        <v-row class="mb-4">
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="selectedClientId"
                                    label="Filter by Client"
                                    :items="clientOptions"
                                    clearable
                                    @update:model-value="handleClientFilter"
                                />
                            </v-col>
                        </v-row>

                        <DataTable
                            :headers="headers"
                            :items="filteredLocations"
                            :loading="loading"
                            title="Locations"
                            searchable
                            search-label="Search locations..."
                            :selectable="canAccess('admin')"
                            :show-actions="true"
                            @search="handleSearch"
                            @edit="handleEdit"
                            @delete="handleDelete"
                        >
                            <template #item.isActive="{ item }">
                                <v-switch
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="toggleActive(item.id, $event)"
                                />
                            </template>

                            <template #item.squareSynced="{ item }">
                                <v-chip
                                    size="small"
                                    :color="item.isSquareSynced ? 'success' : 'error'"
                                >
                                    {{ item.isSquareSynced ? 'Synced' : 'Not Synced' }}
                                </v-chip>
                            </template>

                            <template #item.qbSynced="{ item }">
                                <div>
                                    <v-chip
                                        size="small"
                                        :color="item.isQbSynced ? 'success' : 'error'"
                                        class="mb-1"
                                    >
                                        QB {{ item.isQbSynced ? 'Synced' : 'Not Synced' }}
                                    </v-chip>
                                    <div
                                        v-if="!item.isQbSynced && item.qbSyncErrorReason"
                                        class="text-caption text-error"
                                    >
                                        {{ item.qbSyncErrorReason }}
                                    </div>
                                </div>
                            </template>
                            <template #item.syncActions="{ item }">
                                <div class="d-flex gap-2 justify-space-between">
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-sync"
                                        :loading="syncingSquare[item.id] || false"
                                        @click="importFromSquare(item)"
                                    >
                                        {{
                                            item.isSquareSynced ? 'Re-Sync Square' : 'Import Square'
                                        }}
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-sync"
                                        :loading="syncingQb[item.id] || false"
                                        @click="importToQB(item)"
                                    >
                                        {{ item.isQbSynced ? 'Re-Sync QB' : 'Import QB' }}
                                    </v-btn>
                                </div>
                            </template>

                            <template #item.actions="{ item }">
                                <div class="d-flex gap-2 flex-wrap">
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        prepend-icon="mdi-pencil"
                                        @click="handleEdit(item)"
                                    >
                                        Edit
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        :color="item.isSquareSynced ? 'warning' : 'primary'"
                                        variant="text"
                                        prepend-icon="mdi-import"
                                        :loading="syncingSquare[item.id] || false"
                                        @click="importFromSquare(item)"
                                    >
                                        {{
                                            item.isSquareSynced ? 'Re-Sync Square' : 'Import Square'
                                        }}
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        :color="item.isQbSynced ? 'warning' : 'primary'"
                                        variant="text"
                                        prepend-icon="mdi-import"
                                        :loading="syncingQb[item.id] || false"
                                        @click="importToQB(item)"
                                    >
                                        {{ item.isQbSynced ? 'Re-Sync QB' : 'Import QB' }}
                                    </v-btn>
                                    <v-btn
                                        v-if="canAccess('admin')"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        prepend-icon="mdi-delete"
                                        @click="handleDelete(item)"
                                    >
                                        Delete
                                    </v-btn>
                                </div>
                            </template>
                        </DataTable>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Location Dialog -->
        <LocationDialog
            v-model="showDialog"
            :location="selectedLocation"
            @submit="handleDialogSubmit"
        />

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog
            v-model="showDeleteDialog"
            title="Delete Location"
            :message="`Are you sure you want to delete ${locationToDelete?.name}?`"
            confirm-text="Delete"
            cancel-text="Cancel"
            confirm-color="error"
            icon="mdi-delete"
            icon-color="error"
            @confirm="confirmDelete"
            @cancel="locationToDelete = null"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNuxtApp } from '#app';
import { useLocation } from '~/composables/useLocation';
import { useClient } from '~/composables/useClient';
import { useRole } from '~/composables/useRole';
import { useQuickbooks } from '~/composables/useQuickbooks';
import { useToast } from '~/composables/useToast';
import { LOCATION_MESSAGES } from '~/constants/messages.constants';
import DataTable from '~/components/data-table/DataTable.vue';
import RoleGuard from '~/components/guards/RoleGuard.vue';
import LocationDialog from '~/components/locations/LocationDialog.vue';
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue';
import type { Location } from '~/types/location.types';

definePageMeta({
    middleware: ['auth'],
});

const nuxtApp = useNuxtApp();
const squareImportApi =
    nuxtApp.$squareImportApi as import('~/services/api/wrappers/square-import.api').SquareImportApiService;
const locationApi =
    nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService;

const { locations, loading, fetchLocations, deleteLocation } = useLocation();
const { clients, fetchClients } = useClient();
const { canAccess } = useRole();
const { successFromResponse, errorFromError, success, error, warning, info } = useToast();
// Track sync state for each location
const syncingSquare = ref<Record<number, boolean>>({});
const syncingQb = ref<Record<number, boolean>>({});

const selectedClientId = ref<number | null>(null);
const searchQuery = ref('');
const showDialog = ref(false);
const selectedLocation = ref<Location | null>(null);
const showDeleteDialog = ref(false);
const locationToDelete = ref<Location | null>(null);

const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Address', key: 'address', sortable: true },
    { title: 'City', key: 'city', sortable: true },
    { title: 'State', key: 'state', sortable: true },
    { title: 'Phone', key: 'phoneNumber', sortable: true },
    { title: 'Active', key: 'isActive', sortable: true },
    { title: 'Square Synced', key: 'squareSynced', sortable: true },
    { title: 'QB Synced', key: 'qbSynced', sortable: true },
    { title: 'SyncActions', key: 'syncActions', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false },
];

const clientOptions = computed(() => {
    return clients.value.map((c) => ({
        title: c.name,
        value: c.id,
    }));
});

const filteredLocations = computed(() => {
    let filtered = locations.value;
    
    if (selectedClientId.value) {
        filtered = filtered.filter((l) => l.clientId === selectedClientId.value);
    }
    
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter((l) =>
            l.name.toLowerCase().includes(query) ||
            l.address?.toLowerCase().includes(query) ||
            l.city?.toLowerCase().includes(query)
        );
    }
    
    return filtered;
});

const handleClientFilter = () => {
    if (selectedClientId.value) {
        fetchLocations(selectedClientId.value);
    } else {
        fetchLocations();
    }
};

const handleSearch = (query: string) => {
    searchQuery.value = query;
};

const openDialog = (location?: Location) => {
    selectedLocation.value = location || null;
    showDialog.value = true;
};

const handleEdit = (item: Location) => {
    openDialog(item);
};

const handleDelete = (item: Location) => {
    locationToDelete.value = item;
    showDeleteDialog.value = true;
};

const confirmDelete = async () => {
    if (!locationToDelete.value) return;
    
    try {
        await deleteLocation(locationToDelete.value.id);
        showDeleteDialog.value = false;
        locationToDelete.value = null;
    } catch (error) {
        console.error('Failed to delete location:', error);
    }
};

const handleDialogSubmit = async () => {
    // Refresh locations after create/update
    await fetchLocations(selectedClientId.value || undefined);
};

const toggleActive = async (id: number, isActive: boolean) => {
    // Implement toggle active if backend supports it
    console.log('Toggle active:', id, isActive);
};

const importFromSquare = async (item: Location) => {
    syncingSquare.value[item.id] = true;

    try {
        // Search all Square locations
        const searchResponse = await squareImportApi.searchLocations();
        if (!searchResponse.success || !searchResponse.data) {
            errorFromError(searchResponse, LOCATION_MESSAGES.IMPORT_SQUARE_FETCH_ERROR);
            return;
        }

        const squareLocations = Array.isArray(searchResponse.data) ? searchResponse.data : [];

        // Try to find matching Square location by squareLocationId first, then by name
        let matchingSquareLocation = item.squareLocationId
            ? squareLocations.find((sl) => sl.id === item.squareLocationId)
            : null;

        // If not found by ID, try to find by name
        if (!matchingSquareLocation) {
            matchingSquareLocation = squareLocations.find(
                (sl) => sl.name?.toLowerCase() === item.name.toLowerCase()
            );
        }

        if (!matchingSquareLocation) {
            const warningMessage = item.squareLocationId
                ? 'Square location not found. It may have been deleted in Square.'
                : LOCATION_MESSAGES.IMPORT_SQUARE_NO_LOCATIONS;
            warning(warningMessage);
            return;
        }

        // Import the matching Square location
        const importResponse = await squareImportApi.importLocations([matchingSquareLocation]);
        if (importResponse.success && importResponse.data) {
            const result = importResponse.data.result;
            const successCount = result.created + result.updated;

            if (successCount > 0) {
                successFromResponse(importResponse, LOCATION_MESSAGES.IMPORT_SQUARE_SUCCESS);
            } else {
                info(LOCATION_MESSAGES.IMPORT_SQUARE_SKIPPED);
            }

            if (result.errors.length > 0) {
                const firstError = result.errors[0];
                if (firstError) {
                    warning(`Import warning: ${firstError.error}`);
                }
            }

            // Refresh locations to show updated sync status (skip cache)
            const refreshResponse = await locationApi.refreshLocations(selectedClientId.value || undefined);
            if (refreshResponse.success && refreshResponse.data) {
                // Update the store with fresh data
                const { useLocationStore } = await import('~/stores/location.store');
                const locationStore = useLocationStore();
                locationStore.setLocations(refreshResponse.data);
            } else {
                // Fallback: invalidate cache and fetch
                const cachedApi = (locationApi as any).cachedApi as import('~/services/api/CachedApiClient').CachedApiClient;
                if (cachedApi) {
                    cachedApi.invalidate('locations:.*');
                }
                await fetchLocations(selectedClientId.value || undefined);
            }
        } else {
            errorFromError(importResponse, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing location from Square:', err);
        errorFromError(err, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        syncingSquare.value[item.id] = false;
    }
};

const importToQB = async (item: Location) => {
    syncingQb.value[item.id] = true;

    try {
        // Location sync to QuickBooks is not yet implemented in the backend
        info(LOCATION_MESSAGES.SYNC_QB_NOT_IMPLEMENTED);

        // Refresh locations to show updated sync status (skip cache)
        const refreshResponse = await locationApi.refreshLocations(selectedClientId.value || undefined);
        if (refreshResponse.success && refreshResponse.data) {
            // Update the store with fresh data
            const { useLocationStore } = await import('~/stores/location.store');
            const locationStore = useLocationStore();
            locationStore.setLocations(refreshResponse.data);
        } else {
            // Fallback: invalidate cache and fetch
            const cachedApi = (locationApi as any).cachedApi as import('~/services/api/CachedApiClient').CachedApiClient;
            if (cachedApi) {
                cachedApi.invalidate('locations:.*');
            }
            await fetchLocations(selectedClientId.value || undefined);
        }
    } catch (err) {
        errorFromError(err, LOCATION_MESSAGES.SYNC_QB_ERROR);
        console.error('Error syncing location to QuickBooks:', err);
    } finally {
        syncingQb.value[item.id] = false;
    }
};

// Use useLazyAsyncData for initial data fetching
const { pending: locationsPending } = await useLazyAsyncData(
    'locations-initial',
    async () => {
        await Promise.all([
            fetchClients(),
            fetchLocations(selectedClientId.value || undefined),
        ]);
    }
);
</script>
