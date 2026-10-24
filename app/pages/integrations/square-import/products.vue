<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Products</h1>
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
                        <v-row class="mb-4">
                            <v-col cols="12" md="3">
                                <v-select
                                    v-model="filters.categoryIds"
                                    :items="filteredCategories"
                                    item-title="name"
                                    item-value="squareCategoryId"
                                    label="Categories"
                                    variant="outlined"
                                    density="compact"
                                    multiple
                                    chips
                                    closable-chips
                                    hint="Select categories to filter"
                                    :loading="loadingLocalData"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-select
                                    v-model="filters.locationIds"
                                    :items="filteredLocations"
                                    item-title="name"
                                    item-value="squareLocationId"
                                    label="Locations"
                                    variant="outlined"
                                    density="compact"
                                    multiple
                                    chips
                                    closable-chips
                                    hint="Select locations to filter"
                                    :loading="loadingLocalData"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field
                                    v-model="filters.squareVariationIds"
                                    label="Variation IDs (comma-separated)"
                                    variant="outlined"
                                    density="compact"
                                    hint="Optional"
                                />
                            </v-col>
                            <v-col cols="12" md="3">
                                <v-text-field
                                    v-model="filters.skus"
                                    label="SKUs (comma-separated)"
                                    variant="outlined"
                                    density="compact"
                                    hint="Optional"
                                />
                            </v-col>
                        </v-row>

                        <div v-if="fetchedData.data.length > 0" class="mb-4">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <div class="d-flex align-center gap-2">
                                    <v-chip color="info" size="small">
                                        Fetched: {{ fetchedData.data.length }} product(s)
                                    </v-chip>
                                    <v-chip
                                        v-if="selectedItems.length > 0"
                                        color="primary"
                                        size="small"
                                    >
                                        Selected: {{ selectedItems.length }} product(s)
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
                                            {{ selectedItems.length }} product(s) selected for
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

                        {{ selectedItems }}
                        <v-data-table
                            v-model="selectedItems"
                            :headers="headers"
                            :items="fetchedData.data"
                            :loading="loading"
                            item-value="id"
                            show-select
                            class="elevation-1"
                        >
                            <template #item.item_data.name="{ item }">
                                {{ item.item_data?.name || '-' }}
                            </template>
                            <template #item.item_data.category_id="{ item }">
                                {{
                                    item.localCategoryName ||
                                    (item.item_data as any)?.reporting_category?.id ||
                                    '-'
                                }}
                            </template>
                            <template #item.variation_ids="{ item }">
                                <div class="d-flex flex-column gap-1">
                                    <div
                                        v-for="variation in item.item_data?.variations"
                                        :key="variation.id"
                                        class="d-flex align-center gap-1"
                                    >
                                        <v-chip size="x-small" variant="outlined">
                                            {{ variation.id }}
                                        </v-chip>
                                        <v-chip
                                            v-if="variation.item_variation_data?.sku"
                                            size="x-small"
                                            color="info"
                                            variant="text"
                                        >
                                            SKU: {{ variation.item_variation_data.sku }}
                                        </v-chip>
                                    </div>
                                    <span
                                        v-if="
                                            !item.item_data?.variations ||
                                            item.item_data.variations.length === 0
                                        "
                                        class="text-caption text-grey"
                                    >
                                        No variations
                                    </span>
                                </div>
                            </template>
                            <template #item.synced="{ item }">
                                <v-chip
                                    size="small"
                                    :color="
                                        item.localProduct?.isSquareSynced ? 'success' : 'default'
                                    "
                                >
                                    {{
                                        item.localProduct?.isSquareSynced ? 'Synced' : 'Not Synced'
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
                                        color="primary"
                                        variant="text"
                                        prepend-icon="mdi-import"
                                        :loading="importing"
                                        @click="importSingle(item)"
                                    >
                                        {{
                                            item.localProduct?.isSquareSynced ? 'Re-Sync' : 'Import'
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
                                No data fetched yet. Click "Fetch from Square" to load products.
                            </p>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Raw Data Dialog -->
        <v-dialog v-model="rawDataDialog" max-width="900px" scrollable>
            <v-card>
                <DialogsDialogHeader
                    title="Raw Square product data"
                    entity-label="Product"
                    :entity-name="selectedRawData?.item_data?.name"
                    @close="rawDataDialog = false"
                />
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
import { ref, onMounted, computed } from 'vue'
import { useNuxtApp } from '#app'
import { useSquareImport } from '~/composables/useSquareImport'
import { useToast } from '~/composables/useToast'
import { PRODUCT_MESSAGES, GENERAL_MESSAGES } from '~/constants/messages.constants'
import { useApiMessage } from '~/composables/useApiMessage'
import type { SquareProduct } from '~/types/square-import.types'
import type { Category } from '~/types/category.types'
import type { Location } from '~/types/location.types'
import type { Product } from '~/types/product.types'

definePageMeta({
    middleware: ['auth'],
})

const nuxtApp = useNuxtApp()
const categoryApi =
    nuxtApp.$categoryApi as import('~/services/api/wrappers/category.api').CategoryApiService
const locationApi =
    nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
const productApi =
    nuxtApp.$productApi as import('~/services/api/wrappers/product.api').ProductApiService

const {
    loading,
    importing,
    fetchedData,
    selectedItems,
    hasSelectedItems,
    clearSelection,
    squareImportApi,
} = useSquareImport<SquareProduct>()

const { successFromResponse, errorFromError, success, error, warning, info } = useToast()
const { getImportResultMessage } = useApiMessage()

const localCategories = ref<Category[]>([])
const localLocations = ref<Location[]>([])
const loadingLocalData = ref(false)
const rawDataDialog = ref(false)
const selectedRawData = ref<SquareProduct | null>(null)
// Map to store raw products by ID for import
const rawProductsMap = ref<Map<string, SquareProduct>>(new Map())

const filters = ref({
    categoryIds: [] as string[],
    locationIds: [] as string[],
    squareVariationIds: '',
    skus: '',
})

const filteredCategories = computed(() => {
    return localCategories.value.filter(
        (cat) => cat.squareCategoryId !== null && cat.squareCategoryId !== ''
    )
})

const filteredLocations = computed(() => {
    return localLocations.value.filter(
        (loc) => loc.squareLocationId !== null && loc.squareLocationId !== ''
    )
})

const loadLocalData = async () => {
    loadingLocalData.value = true
    try {
        const [categoriesResponse, locationsResponse] = await Promise.all([
            categoryApi.getAllCategories(),
            locationApi.getAllLocations(),
        ])

        if (categoriesResponse.success && categoriesResponse.data) {
            localCategories.value = categoriesResponse.data
        }
        if (locationsResponse.success && locationsResponse.data) {
            localLocations.value = locationsResponse.data
        }
    } catch (error) {
        console.error('Error loading local data:', error)
    } finally {
        loadingLocalData.value = false
    }
}

const viewRawData = (item: SquareProduct) => {
    selectedRawData.value = item
    rawDataDialog.value = true
}

onMounted(() => {
    loadLocalData()
})

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'item_data.name', sortable: true },
    { title: 'Category', key: 'item_data.category_id', sortable: true },
    { title: 'Variation IDs', key: 'variation_ids', sortable: false },
    { title: 'Synced', key: 'synced', sortable: true },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Updated At', key: 'updated_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const fetchData = async () => {
    loading.value = true
    clearSelection()
    try {
        const params: any = {}
        if (filters.value.categoryIds && filters.value.categoryIds.length > 0) {
            params.categoryIds = filters.value.categoryIds
        }
        if (filters.value.locationIds && filters.value.locationIds.length > 0) {
            params.locationIds = filters.value.locationIds
        }
        if (filters.value.squareVariationIds) {
            params.squareVariationIds = filters.value.squareVariationIds
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
        }
        if (filters.value.skus) {
            params.skus = filters.value.skus
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
        }

        const response = await squareImportApi.searchProducts(params)

        if (response.success && response.data) {
            // Backend now returns: { message, data: [...] }
            // Interceptor returns: { success: true, data: [...] }
            const products = Array.isArray(response.data) ? response.data : []

            // Create a map of products by ID for easy lookup during import
            // The enriched products contain all original Square data, so they're safe to use for import
            rawProductsMap.value.clear()
            products.forEach((product) => {
                if (product?.id && typeof product.id === 'string') {
                    // Ensure ID is a string for consistent Map key matching
                    rawProductsMap.value.set(String(product.id), product)
                }
            })

            fetchedData.value = {
                data: products,
            }

            const count = fetchedData.value.data.length
            if (count > 0) {
                successFromResponse(response, PRODUCT_MESSAGES.IMPORT_SQUARE_FETCH_SUCCESS)
            } else {
                info(PRODUCT_MESSAGES.IMPORT_SQUARE_NO_PRODUCTS)
            }
        } else {
            errorFromError(response, PRODUCT_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
        }
    } catch (err) {
        console.error('Error fetching products:', err)
        errorFromError(err, PRODUCT_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
    } finally {
        loading.value = false
    }
}

const bulkImport = async () => {
    if (selectedItems.value.length === 0) {
        warning(PRODUCT_MESSAGES.IMPORT_SQUARE_SELECT_REQUIRED)
        return
    }

    const selectedCount = selectedItems.value.length
    importing.value = true
    try {
        const rawProductsToImport: SquareProduct[] = []
        for (const selectedItem of selectedItems.value) {
            const rawProduct = rawProductsMap.value.get(selectedItem)
            if (rawProduct) {
                rawProductsToImport.push(rawProduct)
            }
        }
        const response = await squareImportApi.importProducts(rawProductsToImport)

        if (response.success && response.data) {
            const result = response.data.result
            const message = getImportResultMessage(result, PRODUCT_MESSAGES.IMPORT_SQUARE_SUCCESS)
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
            errorFromError(response, PRODUCT_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing products:', err)
        errorFromError(err, PRODUCT_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        importing.value = false
    }
}

const importSingle = async (item: SquareProduct) => {
    importing.value = true
    try {
        // Extract raw product for the selected item
        // Ensure ID is a string for Map lookup
        const itemId = String(item.id)
        const rawProduct = rawProductsMap.value.get(itemId)
        const productToImport = rawProduct || item

        if (!rawProduct) {
            console.warn(`Raw product not found for ID: ${itemId}, using enriched product`)
            console.warn('Available map keys:', Array.from(rawProductsMap.value.keys()).slice(0, 5))
        }

        const response = await squareImportApi.importProducts([productToImport])
        if (response.success && response.data) {
            const result = response.data.result
            const successCount = result.created + result.updated

            if (successCount > 0) {
                successFromResponse(response, PRODUCT_MESSAGES.IMPORT_SQUARE_SUCCESS)
            } else {
                info(PRODUCT_MESSAGES.IMPORT_SQUARE_SKIPPED)
            }

            if (result.errors.length > 0) {
                console.error('Import errors:', result.errors)
                const firstError = result.errors[0]
                if (firstError) {
                    error(`Import failed: ${firstError.error}`)
                }
            }

            await fetchData()
        } else {
            errorFromError(response, PRODUCT_MESSAGES.IMPORT_SQUARE_SINGLE_ERROR)
        }
    } catch (err) {
        console.error('Error importing product:', err)
        errorFromError(err, PRODUCT_MESSAGES.IMPORT_SQUARE_SINGLE_ERROR)
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
