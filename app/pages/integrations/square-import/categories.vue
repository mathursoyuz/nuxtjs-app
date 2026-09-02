<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Categories</h1>
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
                                        Fetched: {{ fetchedData.data.length }} category(ies)
                                    </v-chip>
                                    <v-chip
                                        v-if="selectedItems.length > 0"
                                        color="primary"
                                        size="small"
                                    >
                                        Selected: {{ selectedItems.length }} category(ies)
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
                                            {{ selectedItems.length }} category(ies) selected for
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
                            <template #item.category_data.name="{ item }">
                                {{ item.category_data?.name || '-' }}
                            </template>
                            <template #item.category_data.category_type="{ item }">
                                {{ item.category_data?.category_type || '-' }}
                            </template>
                            <template #item.category_data.is_top_level="{ item }">
                                <v-chip
                                    size="small"
                                    :color="
                                        item.category_data?.is_top_level ? 'success' : 'default'
                                    "
                                >
                                    {{ item.category_data?.is_top_level ? 'Yes' : 'No' }}
                                </v-chip>
                            </template>
                            <template #item.squareSynced="{ item }">
                                <v-chip
                                    size="small"
                                    :color="
                                        item.localCategory?.isSquareSynced ? 'success' : 'error'
                                    "
                                >
                                    {{
                                        item.localCategory?.isSquareSynced ? 'Synced' : 'Not Synced'
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
                                            item.localCategory?.isSquareSynced
                                                ? 'warning'
                                                : 'primary'
                                        "
                                        variant="text"
                                        prepend-icon="mdi-import"
                                        :loading="importing"
                                        @click="importSingle(item)"
                                    >
                                        {{
                                            item.localCategory?.isSquareSynced
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
                                No data fetched yet. Click "Fetch from Square" to load categories.
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
                    <span>Raw Catalog Object</span>
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
import { CATEGORY_MESSAGES } from '~/constants/messages.constants'
import { useApiMessage } from '~/composables/useApiMessage'
import type { SquareCategory } from '~/types/square-import.types'

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
} = useSquareImport<SquareCategory>()

const { successFromResponse, errorFromError, success, error, warning, info } = useToast()
const { getImportResultMessage } = useApiMessage()

const rawDataDialog = ref(false)
const selectedRawData = ref<SquareCategory | null>(null)
// Map to store raw categories by ID for import
const rawCategoriesMap = ref<Map<string, SquareCategory>>(new Map())
// Track sync state for each category
const syncingSquare = ref<Record<number, boolean>>({})

const viewRawData = (item: SquareCategory) => {
    selectedRawData.value = item
    rawDataDialog.value = true
}

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'category_data.name', sortable: true },
    { title: 'Type', key: 'category_data.category_type', sortable: true },
    { title: 'Top Level', key: 'category_data.is_top_level', sortable: true },
    { title: 'Square Synced', key: 'squareSynced', sortable: true },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Updated At', key: 'updated_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
    loading.value = true
    clearSelection()
    try {
        const response = await squareImportApi.searchCategories()

        if (response.success && response.data) {
            // Backend now returns: { message, data: [...] }
            // Interceptor returns: { success: true, data: [...] }
            const categories = Array.isArray(response.data) ? response.data : []

            // Create a map of categories by ID for easy lookup during import
            // The enriched categories contain all original Square data, so they're safe to use for import
            rawCategoriesMap.value.clear()
            categories.forEach((category) => {
                if (category?.id && typeof category.id === 'string') {
                    // Ensure ID is a string for consistent Map key matching
                    rawCategoriesMap.value.set(String(category.id), category)
                }
            })

            fetchedData.value = {
                data: categories,
            }

            const count = fetchedData.value.data.length
            if (count > 0) {
                successFromResponse(response, CATEGORY_MESSAGES.IMPORT_SQUARE_FETCH_SUCCESS)
            } else {
                info(CATEGORY_MESSAGES.IMPORT_SQUARE_NO_CATEGORIES)
            }
        } else {
            errorFromError(response, CATEGORY_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
        }
    } catch (err) {
        console.error('Error fetching categories:', err)
        errorFromError(err, CATEGORY_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
    } finally {
        loading.value = false
    }
}

const bulkImport = async () => {
    if (selectedItems.value.length === 0) {
        warning(CATEGORY_MESSAGES.IMPORT_SQUARE_SELECT_REQUIRED)
        return
    }

    const selectedCount = selectedItems.value.length
    importing.value = true
    try {
        const rawCategoriesToImport: SquareCategory[] = []
        for (const selectedItem of selectedItems.value) {
            const rawCategory = rawCategoriesMap.value.get(selectedItem)
            if (rawCategory) {
                rawCategoriesToImport.push(rawCategory)
            }
        }
        const response = await squareImportApi.importCategories(rawCategoriesToImport)

        if (response.success && response.data) {
            const result = response.data.result
            const message = getImportResultMessage(result, CATEGORY_MESSAGES.IMPORT_SQUARE_SUCCESS)
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
            errorFromError(response, CATEGORY_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing categories:', err)
        errorFromError(err, CATEGORY_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        importing.value = false
    }
}

const importSingle = async (item: SquareCategory) => {
    importing.value = true
    try {
        // Extract raw category for the selected item
        // Ensure ID is a string for Map lookup
        const itemId = String(item.id)
        const rawCategory = rawCategoriesMap.value.get(itemId)
        const categoryToImport = rawCategory || item

        if (!rawCategory) {
            console.warn(`Raw category not found for ID: ${itemId}, using enriched category`)
        }

        const response = await squareImportApi.importCategories([categoryToImport])
        if (response.success && response.data) {
            const result = response.data.result
            const successCount = result.created + result.updated

            if (successCount > 0) {
                successFromResponse(response, CATEGORY_MESSAGES.IMPORT_SQUARE_SUCCESS)
            } else {
                info(CATEGORY_MESSAGES.IMPORT_SQUARE_SKIPPED)
            }

            if (result.errors.length > 0) {
                const firstError = result.errors[0]
                if (firstError) {
                    error(`Import failed: ${firstError.error}`)
                }
            }

            await fetchData()
        } else {
            errorFromError(response, CATEGORY_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing category:', err)
        errorFromError(err, CATEGORY_MESSAGES.IMPORT_SQUARE_ERROR)
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
