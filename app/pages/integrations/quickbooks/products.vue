<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">QuickBooks Products</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        @click="refreshData"
                        :loading="loading"
                    >
                        Refresh
                    </v-btn>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>QuickBooks Products</span>
                    </v-card-title>
                    <v-card-text>
                        <!-- Search -->
                        <div class="mb-4">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search products..."
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="compact"
                                clearable
                            />
                        </div>

                        <!-- Bulk Actions -->
                        <div v-if="selectedProducts.length > 0" class="mb-4">
                            <v-alert type="info" density="compact">
                                {{ selectedProducts.length }} item(s) selected
                                <template #append>
                                    <v-btn
                                        color="primary"
                                        size="small"
                                        prepend-icon="mdi-download"
                                        :loading="importing"
                                        :disabled="selectedProducts.length === 0"
                                        @click="importSelectedProducts"
                                    >
                                        Import Selected ({{ selectedProducts.length }})
                                    </v-btn>
                                </template>
                            </v-alert>
                        </div>

                        <!-- Data Table -->
                        <v-data-table
                            v-model="selectedItems"
                            :headers="headers"
                            :items="filteredProducts"
                            :loading="loading"
                            :selectable="true"
                            :show-select="true"
                            item-value="Id"
                            class="elevation-1"
                            @update:model-value="handleSelectionChange"
                        >
                    <template #item.Active="{ item }">
                        <v-chip :color="item.Active ? 'green' : 'red'" size="small">
                            {{ item.Active ? 'Active' : 'Inactive' }}
                        </v-chip>
                    </template>
                    <template #item.localProductId="{ item }">
                        <span v-if="item.localProduct?.id" class="text-body-2">
                            {{ item.localProduct.id }}
                        </span>
                        <span v-else class="text-grey text-body-2">—</span>
                    </template>
                    <template #item.syncStatus="{ item }">
                        <v-chip
                            v-if="item.localProduct"
                            :color="item.localProduct.isQbSynced ? 'success' : 'warning'"
                            size="small"
                        >
                            {{ item.localProduct.isQbSynced ? 'Synced' : 'Not Synced' }}
                        </v-chip>
                        <v-chip v-else color="grey" size="small">Not Mapped</v-chip>
                    </template>
                    <template #item.importActions="{ item }">
                        <v-btn
                            color="primary"
                            size="small"
                            variant="text"
                            prepend-icon="mdi-download"
                            :loading="importingProductId === item.Id"
                            :disabled="importing && importingProductId !== item.Id"
                            @click="importSingleProduct(item)"
                        >
                            Import
                        </v-btn>
                    </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { useToast } from '~/composables/useToast'
import { INTEGRATION_MESSAGES } from '~/constants/messages.constants'
import type { QuickBooksProduct } from '~/services/api/wrappers/quickbooks.api'

definePageMeta({
    middleware: ['auth'],
})

const nuxtApp = useNuxtApp()
const { successFromResponse, errorFromError, error } = useToast()
const quickbooksApi =
    nuxtApp.$quickbooksApi as import('~/services/api/wrappers/quickbooks.api').QuickBooksApiService

const products = ref<QuickBooksProduct[]>([])
const loading = ref(false)
const importing = ref(false)
const importingProductId = ref<string | null>(null)
const selectedProducts = ref<QuickBooksProduct[]>([])
const selectedItems = ref<QuickBooksProduct[]>([])
const searchQuery = ref('')

const headers = [
    { title: 'ID', key: 'Id', sortable: true },
    { title: 'Name', key: 'Name', sortable: true },
    { title: 'SKU', key: 'SKU', sortable: true },
    { title: 'Qty On Hand', key: 'QtyOnHand', sortable: true },
    { title: 'Type', key: 'Type', sortable: true },
    { title: 'Active', key: 'Active', sortable: true },
    { title: 'Mapped Local Product ID', key: 'localProductId', sortable: true },
    { title: 'Sync Status', key: 'syncStatus', sortable: true },
    { title: 'Import', key: 'importActions', sortable: false },
]

const filteredProducts = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return products.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return products.value.filter((product) => {
        const nameMatch = product.Name?.toLowerCase().includes(query)
        const skuMatch = product.SKU?.toLowerCase().includes(query)
        const idMatch = product.Id?.toLowerCase().includes(query)
        return nameMatch || skuMatch || idMatch
    })
})

const handleSelectionChange = (selected: unknown[]) => {
    // Ensure we have full product objects, not just IDs
    const selectedIds = selected as (string | QuickBooksProduct)[]
    selectedProducts.value = selectedIds.map((item) => {
        // If item is already a full object, return it
        if (typeof item === 'object' && item !== null && 'Id' in item) {
            return item as QuickBooksProduct
        }
        // Otherwise, find the full product object by ID
        return products.value.find((p) => p.Id === item) as QuickBooksProduct
    }).filter((p): p is QuickBooksProduct => p !== undefined)
}

const importSelectedProducts = async () => {
    if (selectedProducts.value.length === 0) {
        error('Please select at least one product to import')
        return
    }

    importing.value = true
    try {
        const task = useLoadingTask('import-qb-products')
        await task.execute(async () => {
            const response = await quickbooksApi.storeSelectedProductsToLocal(selectedProducts.value)
            successFromResponse(
                response,
                `Successfully imported ${selectedProducts.value.length} product(s) from QuickBooks`
            )
            // Clear selection after successful import
            selectedProducts.value = []
        })
    } catch (err) {
        console.error('Error importing QuickBooks products:', err)
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
    } finally {
        importing.value = false
    }
}

const importSingleProduct = async (product: QuickBooksProduct) => {
    importingProductId.value = product.Id || null
    try {
        const task = useLoadingTask(`import-qb-product-${product.Id}`)
        await task.execute(async () => {
            const response = await quickbooksApi.storeSelectedProductsToLocal([product])
            successFromResponse(
                response,
                `Product "${product.Name}" imported from QuickBooks successfully`
            )
        })
    } catch (err) {
        console.error('Error importing QuickBooks product:', err)
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
    } finally {
        importingProductId.value = null
    }
}

const fetchProducts = async () => {
    loading.value = true
    try {
        const task = useLoadingTask('load-qb-products')
        await task.execute(async () => {
            const response = await quickbooksApi.fetchProductsFromQB()
            if (response.success && response.data) {
                products.value = response.data
            } else {
                errorFromError(response, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
            }
        })
    } catch (err) {
        console.error('Error fetching QuickBooks products:', err)
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
    } finally {
        loading.value = false
    }
}

const refreshData = async () => {
    await fetchProducts()
}

onMounted(() => {
    fetchProducts()
})
</script>
