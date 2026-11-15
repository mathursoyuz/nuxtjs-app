<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Locations</h1>
                    <v-btn
                        v-if="access.can(LOCATION_PERMISSIONS.CREATE)"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="openDialog()"
                    >
                        Create Location
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <v-row class="mb-4">
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="selectedOrganisationId"
                                    label="Filter by Organisation"
                                    :items="organisationOptions"
                                    clearable
                                    @update:model-value="handleOrganisationFilter"
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
                            :selectable="access.can(LOCATION_PERMISSIONS.UPDATE)"
                            :show-actions="true"
                            :can-edit="access.can(LOCATION_PERMISSIONS.UPDATE)"
                            :can-delete="access.can(LOCATION_PERMISSIONS.DELETE)"
                            @search="handleSearch"
                            @edit="handleEdit"
                            @delete="handleDelete"
                        >
                            <template #item.isActive="{ item }">
                                <v-switch
                                    :disabled="!access.can(LOCATION_PERMISSIONS.UPDATE)"
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="toggleActive(item.id, !!$event)"
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
                                        v-if="access.can(LOCATION_PERMISSIONS.UPDATE)"
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
                                        v-if="access.can(LOCATION_PERMISSIONS.DELETE)"
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
        <CreateLocationDialog
            v-if="selectedLocation === null"
            v-model="showDialog"
            @submit="handleDialogSubmit"
        />
        <EditLocationDialog
            v-else
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
import { ref, computed } from 'vue'
import { useLocation } from '~/composables/useLocation'
import { useSquareImport } from '~/composables/useSquareImport'
import { useOrganisation } from '~/composables/useOrganisation'
import { useAccessStore } from '~/stores/access.store'
import { LOCATION_PERMISSIONS } from '~/components/locations/location.permissions'
import { useQuickbooks } from '~/composables/useQuickbooks'
import { useToast } from '~/composables/useToast'
import { LOCATION_MESSAGES } from '~/constants/messages.constants'
import DataTable from '~/components/data-table/DataTable.vue'
import CreateLocationDialog from '~/components/locations/CreateLocationDialog.vue'
import EditLocationDialog from '~/components/locations/EditLocationDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import type { Location } from '~/types/location.types'
import type { SquareLocation } from '~/types/square-import.types'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: {
        permission: LOCATION_PERMISSIONS.READ,
        allowCrossOrganisation: true,
        allowCurrentContext: true,
    },
})

const { operations: squareImport } = useSquareImport<SquareLocation>()
const {
    locations,
    loading,
    fetchLocations,
    refreshLocations,
    deleteLocation,
    updateLocationStatus,
} = useLocation()
const { organisations, fetchOrganisations } = useOrganisation()
const access = useAccessStore()
const { successFromResponse, errorFromError, success, error, warning, info } = useToast()
// Track sync state for each location
const syncingSquare = ref<Record<number, boolean>>({})
const syncingQb = ref<Record<number, boolean>>({})

const selectedOrganisationId = ref<number | null>(null)
const searchQuery = ref('')
const showDialog = ref(false)
const selectedLocation = ref<Location | null>(null)
const showDeleteDialog = ref(false)
const locationToDelete = ref<Location | null>(null)

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
]

const organisationOptions = computed(() => {
    return organisations.value.map((c) => ({
        title: c.name,
        value: c.id,
    }))
})

const filteredLocations = computed(() => {
    let filtered = locations.value

    if (selectedOrganisationId.value) {
        filtered = filtered.filter((l) => l.organisationId === selectedOrganisationId.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(
            (l) =>
                l.name.toLowerCase().includes(query) ||
                l.address?.toLowerCase().includes(query) ||
                l.city?.toLowerCase().includes(query)
        )
    }

    return filtered
})

const handleOrganisationFilter = (): void => {
    if (selectedOrganisationId.value) {
        fetchLocations(selectedOrganisationId.value)
    } else {
        fetchLocations()
    }
}

const handleSearch = (query: string): void => {
    searchQuery.value = query
}

const openDialog = (location?: Location): void => {
    selectedLocation.value = location || null
    showDialog.value = true
}

const isLocation = (item: unknown): item is Location =>
    typeof item === 'object' && item !== null && 'id' in item && 'name' in item

const handleEdit = (item: unknown): void => {
    if (isLocation(item)) openDialog(item)
}

const handleDelete = (item: unknown): void => {
    if (!isLocation(item)) return
    locationToDelete.value = item
    showDeleteDialog.value = true
}

const confirmDelete = async (): Promise<void> => {
    if (!locationToDelete.value) return

    try {
        await deleteLocation(locationToDelete.value.id)
        showDeleteDialog.value = false
        locationToDelete.value = null
    } catch (error) {
        console.error('Failed to delete location:', error)
    }
}

const handleDialogSubmit = async (): Promise<void> => {
    // Refresh locations after create/update
    await fetchLocations(selectedOrganisationId.value || undefined)
}

const toggleActive = async (id: number, isActive: boolean): Promise<void> => {
    try {
        await updateLocationStatus(id, isActive)
        success(`Location ${isActive ? 'activated' : 'deactivated'}.`)
        await fetchLocations(selectedOrganisationId.value || undefined)
    } catch (error) {
        errorFromError(error, 'Unable to update location status.')
        await fetchLocations(selectedOrganisationId.value || undefined)
    }
}

const importFromSquare = async (item: Location): Promise<void> => {
    syncingSquare.value[item.id] = true

    try {
        // Search all Square locations
        const searchResponse = await squareImport.searchLocations()
        if (!searchResponse.success || !searchResponse.data) {
            errorFromError(searchResponse, LOCATION_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
            return
        }

        const squareLocations = Array.isArray(searchResponse.data) ? searchResponse.data : []

        // Try to find matching Square location by squareLocationId first, then by name
        let matchingSquareLocation = item.squareLocationId
            ? squareLocations.find((sl) => sl.id === item.squareLocationId)
            : null

        // If not found by ID, try to find by name
        if (!matchingSquareLocation) {
            matchingSquareLocation = squareLocations.find(
                (sl) => sl.name?.toLowerCase() === item.name.toLowerCase()
            )
        }

        if (!matchingSquareLocation) {
            const warningMessage = item.squareLocationId
                ? 'Square location not found. It may have been deleted in Square.'
                : LOCATION_MESSAGES.IMPORT_SQUARE_NO_LOCATIONS
            warning(warningMessage)
            return
        }

        // Import the matching Square location
        const importResponse = await squareImport.importLocations([matchingSquareLocation])
        if (importResponse.success && importResponse.data) {
            const result = importResponse.data.result
            const successCount = result.created + result.updated

            if (successCount > 0) {
                successFromResponse(importResponse, LOCATION_MESSAGES.IMPORT_SQUARE_SUCCESS)
            } else {
                info(LOCATION_MESSAGES.IMPORT_SQUARE_SKIPPED)
            }

            if (result.errors.length > 0) {
                const firstError = result.errors[0]
                if (firstError) {
                    warning(`Import warning: ${firstError.error}`)
                }
            }

            await refreshLocations(selectedOrganisationId.value || undefined)
        } else {
            errorFromError(importResponse, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing location from Square:', err)
        errorFromError(err, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        syncingSquare.value[item.id] = false
    }
}

const importToQB = async (item: Location): Promise<void> => {
    syncingQb.value[item.id] = true

    try {
        // Location sync to QuickBooks is not yet implemented in the backend
        info(LOCATION_MESSAGES.SYNC_QB_NOT_IMPLEMENTED)

        await refreshLocations(selectedOrganisationId.value || undefined)
    } catch (err) {
        errorFromError(err, LOCATION_MESSAGES.SYNC_QB_ERROR)
        console.error('Error syncing location to QuickBooks:', err)
    } finally {
        syncingQb.value[item.id] = false
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: locationsPending } = await useLazyAsyncData('locations-initial', async () => {
    await Promise.all([
        fetchOrganisations(),
        fetchLocations(selectedOrganisationId.value || undefined),
    ])
})
</script>
