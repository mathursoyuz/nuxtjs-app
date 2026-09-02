<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Products</h1>
                    <div class="d-flex align-center gap-2">
                        <RoleGuard roles="admin">
                            <v-btn
                                color="primary"
                                prepend-icon="mdi-plus"
                                @click="openAddProductDialog()"
                            >
                                Create Product
                            </v-btn>
                        </RoleGuard>
                    </div>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>Products</span>
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
                        <div v-if="canAccess('admin') && selectedItems.length > 0" class="mb-4">
                            <v-alert type="info" density="compact">
                                {{ selectedItems.length }} item(s) selected
                                <template #append>
                                    <v-btn
                                        color="error"
                                        size="small"
                                        prepend-icon="mdi-delete"
                                        @click="handleBulkDelete(selectedItems)"
                                    >
                                        Delete Selected
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
                            :selectable="canAccess('admin')"
                            :show-select="canAccess('admin')"
                            item-value="id"
                            class="elevation-1"
                        >
                            <template #item.type="{ item }">
                                <v-chip :color="getTypeColor(item.type)" size="small">
                                    {{ item.type }}
                                </v-chip>
                            </template>

                            <template #item.price="{ item }">${{ item.price.toFixed(2) }}</template>

                            <template #item.qbSyncStatus="{ item }">
                                <div class="d-flex align-center gap-2 flex-wrap">
                                    <!-- QB Status -->
                                    <v-tooltip
                                        v-if="item.qbSyncErrorReason"
                                        :text="item.qbSyncErrorReason"
                                        location="top"
                                    >
                                        <template v-slot:activator="{ props }">
                                            <v-chip
                                                v-bind="props"
                                                color="error"
                                                size="small"
                                                variant="flat"
                                            >
                                                <v-icon start size="small">mdi-alert-circle</v-icon>
                                                QB Failed
                                            </v-chip>
                                        </template>
                                    </v-tooltip>
                                    <v-chip
                                        :color="item.isQbSynced ? 'success' : 'warning'"
                                        size="small"
                                        variant="flat"
                                    >
                                        <v-icon start size="small">
                                            {{
                                                item.isQbSynced
                                                    ? 'mdi-check-circle'
                                                    : 'mdi-alert-circle'
                                            }}
                                        </v-icon>
                                        QB {{ item.isQbSynced ? 'Synced' : 'Not Synced' }}
                                    </v-chip>
                                </div>
                            </template>
                            <template #item.squareSyncStatus="{ item }">
                                <div class="d-flex align-center gap-2 flex-wrap">
                                    <!-- Square Status -->
                                    <v-chip
                                        :color="item.isSquareSynced ? 'success' : 'warning'"
                                        size="small"
                                        variant="flat"
                                    >
                                        <v-icon start size="small">
                                            {{
                                                item.isSquareSynced
                                                    ? 'mdi-check-circle'
                                                    : 'mdi-alert-circle'
                                            }}
                                        </v-icon>
                                        Square {{ item.isSquareSynced ? 'Synced' : 'Not Synced' }}
                                    </v-chip>
                                </div>
                            </template>

                            <template #item.isActive="{ item }">
                                <v-switch
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="
                                        handleToggleActive(item.id, Boolean($event))
                                    "
                                />
                            </template>

                            <template #item.syncActions="{ item }">
                                <!-- QB Sync/Resync Button -->
                                <v-btn
                                    :prepend-icon="item.qbProductId ? 'mdi-sync-alert' : 'mdi-sync'"
                                    size="small"
                                    :color="item.qbProductId ? 'error' : 'primary'"
                                    variant="tonal"
                                    :loading="syncingProductId === item.id && syncingTo === 'qb'"
                                    @click="handleSyncToQB(item)"
                                >
                                    {{
                                        item.qbProductId
                                            ? `Re-send to QuickBooks${item.qbSyncErrorReason ? ' - ' + item.qbSyncErrorReason : ''}`
                                            : 'Sync to QuickBooks'
                                    }}
                                </v-btn>
                            </template>

                            <template #item.actions="{ item }">
                                <div class="d-flex align-center gap-2">
                                    <v-btn
                                        icon="mdi-eye"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleView(item)"
                                        title="View Details"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-pencil"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleEdit(item)"
                                        title="Edit"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-delete"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        @click="handleDelete(item)"
                                        title="Delete"
                                    ></v-btn>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Add Product Dialog - Lazy loaded -->
        <AddProductDialog
            v-if="showAddDialog"
            v-model="showAddDialog"
            :categories="categoryOptions"
            :locations="locationOptions"
            :available-products="products"
            @submit="handleProductCreated"
        />

        <!-- Edit Product Dialog - Lazy loaded -->
        <EditProductDialog
            v-if="showEditDialog"
            v-model="showEditDialog"
            :product="selectedProduct"
            :categories="categoryOptions"
            :locations="locationOptions"
            :available-products="products"
            @submit="handleProductUpdated"
        />

        <!-- View Product Dialog - Lazy loaded -->
        <ViewProductDialog
            v-if="showViewDialog"
            v-model="showViewDialog"
            :product-id="selectedProductId"
            @edit="handleEditFromView"
            @deleted="handleProductDeleted"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLoadingStore } from '~/stores/loading.store'
import { useProduct } from '~/composables/useProduct'
import { useCategory } from '~/composables/useCategory'
import { useLocation } from '~/composables/useLocation'
import { useRole } from '~/composables/useRole'
import { useToast } from '~/composables/useToast'
import { PRODUCT_MESSAGES } from '~/constants/messages.constants'
import { defineAsyncComponent } from 'vue'
import RoleGuard from '~/components/guards/RoleGuard.vue'
import type { Product } from '~/types/product.types'

// Lazy load dialog components - only loaded when needed
const AddProductDialog = defineAsyncComponent(
    () => import('~/components/products/AddProductDialog.vue')
)
const EditProductDialog = defineAsyncComponent(
    () => import('~/components/products/EditProductDialog.vue')
)
const ViewProductDialog = defineAsyncComponent(
    () => import('~/components/products/ViewProductDialog.vue')
)

definePageMeta({
    middleware: ['auth'],
})

const {
    products,
    loading,
    fetchProducts,
    deleteProduct,
    toggleActive,
    fetchProductById,
    syncProductToQB,
} = useProduct()
const { categories, fetchCategories } = useCategory()
const { locations, fetchLocations } = useLocation()
const { canAccess } = useRole()
const { successFromResponse, errorFromError } = useToast()

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const selectedProduct = ref<Product | null>(null)
const selectedProductId = ref<number | null>(null)
const syncingProductId = ref<number | null>(null)
const syncingTo = ref<'qb' | 'square' | null>(null)

const handleSyncToQB = async (product: Product) => {
    syncingProductId.value = product.id
    syncingTo.value = 'qb'

    try {
        const loadingStore = useLoadingStore()
        const taskId = `sync-product-qb-${product.id}`
        loadingStore.startTask(
            taskId,
            product.qbSyncErrorReason
                ? 'Resyncing product to QuickBooks...'
                : 'Syncing product to QuickBooks...'
        )

        const response = await syncProductToQB(product.id)
        const fallbackMessage = product.qbSyncErrorReason
            ? PRODUCT_MESSAGES.SYNC_QB_RESYNC_SUCCESS
            : PRODUCT_MESSAGES.SYNC_QB_SUCCESS
        successFromResponse({ success: true, message: '', data: response }, fallbackMessage)
        await fetchProducts()
    } catch (error) {
        errorFromError(error, PRODUCT_MESSAGES.SYNC_QB_ERROR)
    } finally {
        syncingProductId.value = null
        syncingTo.value = null
        const loadingStore = useLoadingStore()
        loadingStore.stopTask(`sync-product-qb-${product.id}`)
    }
}

const headers = [
    { title: 'SKU', key: 'sku', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Type', key: 'type', sortable: true },
    { title: 'Price', key: 'price', sortable: true },
    { title: 'QB Sync Status', key: 'qbSyncStatus', sortable: false },
    { title: 'Square Sync Status', key: 'squareSyncStatus', sortable: false },
    { title: 'Active', key: 'isActive', sortable: true },
    { title: 'Sync Actions', key: 'syncActions', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false },
]

const searchQuery = ref('')
const selectedItems = ref<Product[]>([])

const categoryOptions = computed(() => {
    return categories.value.map((c) => ({
        title: c.name,
        value: c.id,
    }))
})

const locationOptions = computed(() => {
    return locations.value.map((l) => ({
        title: l.name,
        value: l.id,
    }))
})

const filteredProducts = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return products.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return products.value.filter((product) => {
        const nameMatch = product.name?.toLowerCase().includes(query)
        const skuMatch = product.sku?.toLowerCase().includes(query)
        const typeMatch = product.type?.toLowerCase().includes(query)
        const descriptionMatch = product.description?.toLowerCase().includes(query)

        return nameMatch || skuMatch || typeMatch || descriptionMatch
    })
})

const openAddProductDialog = () => {
    showAddDialog.value = true
}

const handleProductCreated = async () => {
    await fetchProducts()
    showAddDialog.value = false
}

const handleEdit = async (item: unknown) => {
    const product = item as Product
    const loadingStore = useLoadingStore()
    const taskId = `edit-product-${product.id}`

    loadingStore.startTask(taskId, 'Loading product data...')
    try {
        // Fetch all required data for edit dialog
        const [fullProduct] = await Promise.all([
            fetchProductById(product.id),
            // Categories and locations are already loaded on page mount
        ])

        selectedProduct.value = fullProduct
        showEditDialog.value = true
    } catch (error) {
        console.error('Failed to fetch product details:', error)
        // Fallback to using the product from list if fetch fails
        selectedProduct.value = product
        showEditDialog.value = true
    } finally {
        loadingStore.stopTask(taskId)
    }
}

const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
        await toggleActive(id, isActive)
        await fetchProducts() // Refresh the list
    } catch (error) {
        console.error('Failed to toggle product status:', error)
    }
}

const handleProductUpdated = async () => {
    await fetchProducts()
    showEditDialog.value = false
    selectedProduct.value = null
}

const handleView = (item: Product) => {
    selectedProductId.value = item.id
    showViewDialog.value = true
}

const handleEditFromView = (productId: number) => {
    showViewDialog.value = false
    handleEdit({ id: productId } as Product)
}

const handleProductDeleted = async () => {
    await fetchProducts()
}

const handleDelete = async (item: unknown) => {
    const product = item as Product
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
        try {
            await deleteProduct(product.id)
        } catch (error) {
            console.error('Failed to delete product:', error)
        }
    }
}

const handleBulkDelete = async (selected: unknown[]) => {
    const products = selected as Product[]
    if (confirm(`Are you sure you want to delete ${products.length} product(s)?`)) {
        try {
            await Promise.all(products.map((item) => deleteProduct(item.id)))
        } catch (error) {
            console.error('Failed to delete products:', error)
        }
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case 'simple':
            return 'primary'
        case 'variable':
            return 'secondary'
        case 'bundle':
            return 'success'
        default:
            return 'grey'
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: productsPending } = await useLazyAsyncData('products-initial', async () => {
    await Promise.all([fetchProducts(), fetchCategories(), fetchLocations()])
    return null
})
</script>
