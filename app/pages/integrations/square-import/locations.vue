<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Locations</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-download"
                        :loading="loading"
                        @click="fetchData"
                    >
                        Fetch from Square
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <div v-if="fetchedData.data.length > 0" class="mb-4">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <div class="d-flex align-center gap-2">
                                    <v-chip color="info" size="small">
                                        Fetched: {{ fetchedData.data.length }} location(s)
                                    </v-chip>
                                    <v-chip
                                        v-if="selectedItems.length > 0"
                                        color="primary"
                                        size="small"
                                    >
                                        Selected: {{ selectedItems.length }} location(s)
                                    </v-chip>
                                </div>
                                <div>
                                    <v-btn
                                        size="small"
                                        variant="text"
                                        :disabled="!hasSelectedItems"
                                        @click="clearSelection"
                                    >
                                        Clear Selection
                                    </v-btn>
                                </div>
                            </div>

                            <div v-if="hasSelectedItems" class="mb-4">
                                <v-alert type="info" density="compact" class="mb-2">
                                    <div class="d-flex align-center justify-space-between">
                                        <span>
                                            {{ selectedItems.length }} location(s) selected for
                                            import
                                        </span>
                                        <v-btn
                                            color="success"
                                            prepend-icon="mdi-import"
                                            :loading="importing"
                                            size="small"
                                            @click="bulkImport"
                                        >
                                            Import Selected
                                        </v-btn>
                                    </div>
                                </v-alert>
                            </div>
                        </div>

                        <v-data-table
                            v-model="selectedItems"
                            :headers="headers"
                            :items="fetchedData.data"
                            :loading="loading"
                            item-value="id"
                            show-select
                            class="elevation-1"
                        >
                            <template #item.address="{ item }">
                                <div v-if="item.address">
                                    {{ item.address.address_line_1 || '' }}
                                    {{ item.address.locality ? `, ${item.address.locality}` : '' }}
                                    {{ item.address.postal_code ? ` ${item.address.postal_code}` : '' }}
                                </div>
                                <span v-else>-</span>
                            </template>
                            <template #item.status="{ item }">
                                <v-chip size="small" :color="item.status === 'ACTIVE' ? 'success' : 'default'">
                                    {{ item.status || '-' }}
                                </v-chip>
                            </template>
                            <template #item.squareSynced="{ item }">
                                <v-chip
                                    size="small"
                                    :color="
                                        item.localLocation?.isSquareSynced ? 'success' : 'error'
                                    "
                                >
                                    {{
                                        item.localLocation?.isSquareSynced ? 'Synced' : 'Not Synced'
                                    }}
                                </v-chip>
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex gap-2">
                                    <v-btn
                                        size="small"
                                        color="info"
                                        variant="text"
                                        prepend-icon="mdi-eye"
                                        @click="viewRawData(item)"
                                    >
                                        View Raw
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        :color="
                                            item.localLocation?.isSquareSynced
                                                ? 'warning'
                                                : 'primary'
                                        "
                                        variant="text"
                                        prepend-icon="mdi-import"
                                        :loading="importing"
                                        @click="importSingle(item)"
                                    >
                                        {{
                                            item.localLocation?.isSquareSynced
                                                ? 'Re-Import'
                                                : 'Import'
                                        }}
                                    </v-btn>
                                </div>
                            </template>
                        </v-data-table>

                        <div
                            v-if="fetchedData.data.length === 0 && !loading"
                            class="text-center py-8"
                        >
                            <v-icon size="64" color="grey">mdi-database-off</v-icon>
                            <p class="text-grey mt-4">
                                No data fetched yet. Click "Fetch from Square" to load locations.
                            </p>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Raw Data Dialog -->
        <v-dialog v-model="rawDataDialog" max-width="900px" scrollable>
            <v-card>
                <v-card-title class="d-flex align-center justify-space-between">
                    <span>Raw Location Object</span>
                    <v-btn icon variant="text" @click="rawDataDialog = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-divider />
                <v-card-text class="pa-4">
                    <pre class="raw-json">{{ JSON.stringify(selectedRawData, null, 2) }}</pre>
                </v-card-text>
                <v-divider />
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" @click="rawDataDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSquareImport } from '~/composables/useSquareImport'
import { useToast } from '~/composables/useToast'
import { LOCATION_MESSAGES } from '~/constants/messages.constants'
import { useApiMessage } from '~/composables/useApiMessage'
import type { SquareLocation } from '~/types/square-import.types'

definePageMeta({
    middleware: ['auth'],
})

const {
    loading,
    importing,
    fetchedData,
    selectedItems,
    hasSelectedItems,
    clearSelection,
    squareImportApi,
} = useSquareImport<SquareLocation>()

const { successFromResponse, errorFromError, success, error, warning, info } = useToast()
const { getImportResultMessage } = useApiMessage()

const rawDataDialog = ref(false)
const selectedRawData = ref<SquareLocation | null>(null)
// Map to store raw locations by ID for import
const rawLocationsMap = ref<Map<string, SquareLocation>>(new Map())
// Track sync state for each location
const syncingSquare = ref<Record<number, boolean>>({})

const viewRawData = (item: SquareLocation) => {
    selectedRawData.value = item
    rawDataDialog.value = true
}

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Address', key: 'address', sortable: false },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Timezone', key: 'timezone', sortable: true },
    { title: 'Square Synced', key: 'squareSynced', sortable: true },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
    loading.value = true
    clearSelection()
    try {
        const response = await squareImportApi.searchLocations()

        if (response.success && response.data) {
            // Backend now returns: { message, data: [...] }
            // Interceptor returns: { success: true, data: [...] }
            const locations = Array.isArray(response.data) ? response.data : []

            // Create a map of locations by ID for easy lookup during import
            // The enriched locations contain all original Square data, so they're safe to use for import
            rawLocationsMap.value.clear()
            locations.forEach((location) => {
                if (location?.id && typeof location.id === 'string') {
                    // Ensure ID is a string for consistent Map key matching
                    rawLocationsMap.value.set(String(location.id), location)
                }
            })

            fetchedData.value = {
                data: locations,
            }

            const count = fetchedData.value.data.length
            if (count > 0) {
                successFromResponse(response, LOCATION_MESSAGES.IMPORT_SQUARE_FETCH_SUCCESS)
            } else {
                info(LOCATION_MESSAGES.IMPORT_SQUARE_NO_LOCATIONS)
            }
        } else {
            errorFromError(response, LOCATION_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
        }
    } catch (err) {
        console.error('Error fetching locations:', err)
        errorFromError(err, LOCATION_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
    } finally {
        loading.value = false
    }
}

const bulkImport = async () => {
    if (selectedItems.value.length === 0) {
        warning(LOCATION_MESSAGES.IMPORT_SQUARE_SELECT_REQUIRED)
        return
    }

    const selectedCount = selectedItems.value.length
    importing.value = true
    try {
        const rawLocationsToImport: SquareLocation[] = []
        for (const selectedItem of selectedItems.value) {
            const rawLocation = rawLocationsMap.value.get(selectedItem)
            if (rawLocation) {
                rawLocationsToImport.push(rawLocation)
            }
        }
        const response = await squareImportApi.importLocations(rawLocationsToImport)

        if (response.success && response.data) {
            const result = response.data.result
            const message = getImportResultMessage(result, LOCATION_MESSAGES.IMPORT_SQUARE_SUCCESS)
            if (result.errors.length > 0) {
                warning(message)
            } else {
                success(message)
            }

            if (result.errors.length > 0) {
                console.error('Import errors:', result.errors)
            }

            clearSelection()
            await fetchData()
        } else {
            errorFromError(response, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing locations:', err)
        errorFromError(err, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        importing.value = false
    }
}

const importSingle = async (item: SquareLocation) => {
    importing.value = true
    try {
        // Extract raw location for the selected item
        // Ensure ID is a string for Map lookup
        const itemId = String(item.id)
        const rawLocation = rawLocationsMap.value.get(itemId)
        const locationToImport = rawLocation || item

        if (!rawLocation) {
            console.warn(`Raw location not found for ID: ${itemId}, using enriched location`)
        }

        const response = await squareImportApi.importLocations([locationToImport])
        if (response.success && response.data) {
            const result = response.data.result
            const successCount = result.created + result.updated

            if (successCount > 0) {
                successFromResponse(response, LOCATION_MESSAGES.IMPORT_SQUARE_SUCCESS)
            } else {
                info(LOCATION_MESSAGES.IMPORT_SQUARE_SKIPPED)
            }

            if (result.errors.length > 0) {
                const firstError = result.errors[0]
                if (firstError) {
                    error(`Import failed: ${firstError.error}`)
                }
            }

            await fetchData()
        } else {
            errorFromError(response, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing location:', err)
        errorFromError(err, LOCATION_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        importing.value = false
    }
}
</script>

<style scoped>
.raw-json {
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    overflow-x: auto;
    max-height: 600px;
    overflow-y: auto;
}
</style>
