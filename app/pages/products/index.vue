<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Products</h1>
                    <div class="d-flex align-center gap-2">
                        <template v-if="access.can(PRODUCT_PERMISSIONS.WRITE)">
                            <v-btn
                                color="primary"
                                prepend-icon="mdi-plus"
                                @click="openAddProductDialog()"
                            >
                                Create Product
                            </v-btn>
                        </template>
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
                        <div
                            v-if="
                                access.can(PRODUCT_PERMISSIONS.DELETE) && selectedItems.length > 0
                            "
                            class="mb-4"
                        >
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
                            :selectable="access.can(PRODUCT_PERMISSIONS.DELETE)"
                            :show-select="access.can(PRODUCT_PERMISSIONS.DELETE)"
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
                                    :disabled="!access.can(PRODUCT_PERMISSIONS.WRITE)"
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
                                    v-if="access.can(PRODUCT_PERMISSIONS.WRITE)"
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
                                    <v-menu
                                        v-if="
                                            canManagePlatformInventory &&
                                            item.variants.some(
                                                (variant) =>
                                                    variant.stockManaged && !variant.isDeleted
                                            )
                                        "
                                    >
                                        <template #activator="{ props }">
                                            <v-btn
                                                v-bind="props"
                                                icon="mdi-warehouse"
                                                size="small"
                                                color="secondary"
                                                variant="text"
                                                title="Manage Platform Organisation inventory"
                                            />
                                        </template>
                                        <v-list density="compact">
                                            <v-list-subheader>
                                                Supply inventory variant
                                            </v-list-subheader>
                                            <v-list-item
                                                v-for="variant in item.variants.filter(
                                                    (candidate) =>
                                                        candidate.stockManaged &&
                                                        !candidate.isDeleted
                                                )"
                                                :key="variant.id"
                                                :title="variant.sku"
                                                :subtitle="
                                                    [variant.size, variant.color]
                                                        .filter(Boolean)
                                                        .join(' · ')
                                                "
                                                prepend-icon="mdi-package-variant"
                                                @click="openSupplyInventory(item, variant)"
                                            />
                                        </v-list>
                                    </v-menu>
                                    <v-btn
                                        icon="mdi-eye"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleView(item)"
                                        title="View Details"
                                    ></v-btn>
                                    <v-btn
                                        v-if="access.can(PRODUCT_PERMISSIONS.WRITE)"
                                        icon="mdi-pencil"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleEdit(item)"
                                        title="Edit"
                                    ></v-btn>
                                    <v-btn
                                        v-if="access.can(PRODUCT_PERMISSIONS.DELETE)"
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
            v-if="showAddDialog && access.can(PRODUCT_PERMISSIONS.WRITE)"
            v-model="showAddDialog"
            :categories="categoryOptions"
            :locations="locationOptions"
            :available-products="products"
            @submit="handleProductCreated"
        />

        <!-- Edit Product Dialog - Lazy loaded -->
        <EditProductDialog
            v-if="showEditDialog && access.can(PRODUCT_PERMISSIONS.WRITE)"
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

        <PlatformSupplyInventoryManagementDialog
            v-if="
                showSupplyInventory &&
                selectedInventoryProduct &&
                selectedInventoryVariant &&
                access.platformOrganisationId
            "
            v-model="showSupplyInventory"
            :product-id="selectedInventoryProduct.id"
            :product-variant-id="selectedInventoryVariant.id"
            :platform-organisation-id="access.platformOrganisationId"
            :title="`${selectedInventoryProduct.name} — ${selectedInventoryVariant.sku}`"
            @saved="handleSupplyInventorySaved"
        />
    </v-container>
</template>

<script setup lang="ts">
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions'
import { INVENTORY_PERMISSIONS } from '~/components/inventory/inventory.permissions'

import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { useLoadingStore } from '~/stores/loading.store'
import { useProduct } from '~/composables/useProduct'
import { useCategory } from '~/composables/useCategory'
import { useAccessStore } from '~/stores/access.store'
import { useToast } from '~/composables/useToast'
import { PRODUCT_MESSAGES } from '~/constants/messages.constants'
import { defineAsyncComponent } from 'vue'
import type { Product, ProductVariant } from '~/types/product.types'
import type { InventoryLocation } from '~/types/inventory.types'
import type { InventoryApiService } from '~/services/api/wrappers/inventory.api'

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
const PlatformSupplyInventoryManagementDialog = defineAsyncComponent(
    () => import('~/components/inventory/PlatformSupplyInventoryManagementDialog.vue')
)

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: PRODUCT_PERMISSIONS.READ },
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
const access = useAccessStore()
const canManagePlatformInventory = computed(
    () =>
        access.platformOrganisationId !== null &&
        access.can(INVENTORY_PERMISSIONS.WRITE, access.platformOrganisationId)
)
const { successFromResponse, errorFromError } = useToast()
const inventoryApi = useNuxtApp().$inventoryApi as InventoryApiService
const inventoryLocations = ref<InventoryLocation[]>([])

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showSupplyInventory = ref(false)
const selectedProduct = ref<Product | null>(null)
const selectedInventoryProduct = ref<Product | null>(null)
const selectedInventoryVariant = ref<ProductVariant | null>(null)
const selectedProductId = ref<number | null>(null)
const syncingProductId = ref<number | null>(null)
const syncingTo = ref<'qb' | 'square' | null>(null)
let contextRevision = 0

function clearContextDialogs() {
    contextRevision++
    showAddDialog.value = showEditDialog.value = showViewDialog.value = false
    showSupplyInventory.value = false
    selectedProduct.value = null
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
    selectedProductId.value = null
    selectedItems.value = []
    inventoryLocations.value = []
}

async function loadCatalogue() {
    if (access.loading || !access.can(PRODUCT_PERMISSIONS.READ)) return
    const current = contextRevision
    try {
        await fetchProducts()
        if (current !== contextRevision || access.loading) return
        const formDataRequests: Promise<unknown>[] = []
        if (access.can(PRODUCT_PERMISSIONS.WRITE)) formDataRequests.push(fetchCategories())
        if (canManagePlatformInventory.value && access.platformOrganisationId) {
            formDataRequests.push(
                inventoryApi.getInventoryLocations(access.platformOrganisationId).then((response) => {
                    inventoryLocations.value = response.data ?? []
                })
            )
        }
        await Promise.all(formDataRequests)
    } catch (error) {
        if (current === contextRevision) errorFromError(error, 'Unable to load products.')
    }
}

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
    return inventoryLocations.value.map((l) => ({
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
    if (access.loading || !access.can(PRODUCT_PERMISSIONS.WRITE)) return
    const current = contextRevision
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

        if (current !== contextRevision) return
        selectedProduct.value = fullProduct
        showEditDialog.value = true
    } catch (error) {
        if (current !== contextRevision) return
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

const openSupplyInventory = (product: Product, variant: ProductVariant) => {
    selectedInventoryProduct.value = product
    selectedInventoryVariant.value = variant
    showSupplyInventory.value = true
}

const handleSupplyInventorySaved = () => {
    showSupplyInventory.value = false
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
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
    await loadCatalogue()
    return null
})

watch(
    () => access.loading,
    (loadingContext) => {
        clearContextDialogs()
        if (!loadingContext) void loadCatalogue()
    },
    { flush: 'sync' }
)
watch(showSupplyInventory, (isOpen) => {
    if (isOpen) return
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
})
onBeforeUnmount(clearContextDialogs)
</script>
