<template>
    <v-container fluid>
        <PageFilters>
            <v-text-field
                v-model="search"
                label="Search loaded products"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                hide-details
            />
        </PageFilters>
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <div>
                <h1 class="text-h4">Organisation products</h1>
                <div class="text-body-2 text-medium-emphasis">
                    White-label listings and organisation-owned location inventory.
                </div>
                <div class="d-flex flex-wrap align-center ga-2 text-body-2 mt-2">
                    <span>{{ contextName }}</span>
                    <NuxtLink v-if="access.canSwitchOrganisations" to="/switch-organisation">
                        Switch organisation
                    </NuxtLink>
                </div>
            </div>
            <div class="d-flex flex-wrap align-center ga-2">
                <v-btn
                    v-if="organisationId && access.can(PROCUREMENT_ORDER_PERMISSIONS.WRITE)"
                    color="success"
                    prepend-icon="mdi-cart-plus"
                    :disabled="access.busy"
                    @click="showPurchase = true"
                >
                    Procure
                </v-btn>
                <v-btn
                    v-if="organisationId && canCreate"
                    color="primary"
                    prepend-icon="mdi-plus"
                    :disabled="access.busy"
                    @click="showAdd = true"
                >
                    Add product
                </v-btn>
            </div>
        </div>

        <v-alert v-if="isOverview" type="info" variant="tonal" class="mb-4">
            This is a read-only overview. Use the sidebar switcher to manage a organisation’s products.
        </v-alert>

        <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>
        <v-card>
            <v-card-text>
                <DataTable
                    :headers="headers"
                    :items="filteredProducts"
                    :loading="loading || access.busy"
                    :items-per-page="isOverview ? 50 : 10"
                    :hide-default-footer="isOverview"
                    :show-pagination-info="!isOverview"
                    title="Organisation products"
                    :selectable="false"
                    :show-actions="true"
                >
                    <template #item.thumbnail="{ item }">
                        <v-avatar size="40">
                            <v-img
                                :src="getFullImageUrl(item.thumbnail, 'organisation-products')"
                                :alt="item.name"
                            />
                        </v-avatar>
                    </template>
                    <template #item.variants="{ item }">
                        <div class="d-flex flex-column align-start ga-1 py-2">
                            <div
                                v-for="variant in item.variants"
                                :key="variant.id"
                                class="d-flex flex-column align-start ga-1"
                            >
                                <v-chip
                                    :color="variant.isActive ? 'primary' : 'default'"
                                    size="small"
                                    variant="tonal"
                                >
                                    {{ variant.sku }} · {{ money(variant.price) }}
                                </v-chip>
                                <div
                                    v-if="
                                        variant.size ||
                                        variant.color ||
                                        Object.keys(variant.attributes).length
                                    "
                                    class="text-caption text-medium-emphasis"
                                >
                                    {{ formatVariantDetails(variant) }}
                                </div>
                            </div>
                        </div>
                    </template>
                    <template #item.inventory="{ item }">
                        <div v-for="variant in item.variants" :key="variant.id" class="py-2">
                            <div class="font-weight-medium">
                                {{ variant.sku }}: {{ variant.availableQty }} available /
                                {{ variant.qty }} on hand
                            </div>
                            <v-chip
                                v-for="balance in variant.inventory"
                                :key="balance.id"
                                size="x-small"
                                variant="tonal"
                                class="mr-1 mt-1"
                            >
                                {{ locationName(balance.locationId) }}: {{ balance.available }}
                                available
                                <span v-if="balance.reserved">
                                    / {{ balance.reserved }} reserved
                                </span>
                            </v-chip>
                        </div>
                    </template>
                    <template #item.isActive="{ item }">
                        <v-switch
                            :model-value="item.isActive"
                            :disabled="!canUpdate || access.busy"
                            density="compact"
                            hide-details
                            color="primary"
                            @update:model-value="toggle(item, Boolean($event))"
                        />
                    </template>
                    <template #item.actions="{ item }">
                        <div class="d-flex ga-1">
                            <v-menu
                                v-if="canManageProductInventory(item) && hasManagedInventory(item)"
                            >
                                <template #activator="{ props }">
                                    <v-btn
                                        v-bind="props"
                                        icon="mdi-warehouse"
                                        size="small"
                                        variant="text"
                                        color="secondary"
                                        title="Manage inventory"
                                    />
                                </template>
                                <v-list density="compact">
                                    <v-list-subheader>Inventory variant</v-list-subheader>
                                    <v-list-item
                                        v-for="variant in managedVariants(item)"
                                        :key="variant.id"
                                        :title="variant.sku"
                                        :subtitle="
                                            [variant.size, variant.color]
                                                .filter(Boolean)
                                                .join(' · ')
                                        "
                                        prepend-icon="mdi-package-variant"
                                        @click="openInventory(item, variant)"
                                    />
                                </v-list>
                            </v-menu>
                            <v-btn
                                v-if="canUpdate"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                color="primary"
                                @click.stop="openEdit(item)"
                            />
                            <v-btn
                                v-if="canDelete"
                                icon="mdi-delete"
                                size="small"
                                variant="text"
                                color="error"
                                @click.stop="requestDelete(item)"
                            />
                        </div>
                    </template>
                    <template #no-data>
                        <div class="pa-8 text-center text-medium-emphasis">
                            No products to display.
                        </div>
                    </template>
                </DataTable>
            </v-card-text>
        </v-card>
        <v-pagination
            v-if="isOverview && total > 50"
            v-model="page"
            :length="Math.ceil(total / 50)"
            @update:model-value="fetchPage"
        />

        <AddOrganisationProductDialog
            v-if="organisationId"
            :key="organisationId"
            v-model="showAdd"
            :organisation-id="organisationId"
            :organisation-name="targetOrganisationName"
            :available-products="products"
            @submit="loadProducts"
        />
        <EditOrganisationProductDialog
            v-if="organisationId"
            :key="organisationId"
            v-model="showEdit"
            :organisation-id="organisationId"
            :organisation-name="targetOrganisationName"
            :organisation-product="selected"
            :available-products="products"
            @submit="loadProducts"
        />
        <PurchaseWizardDialog
            v-if="organisationId"
            :key="organisationId"
            v-model="showPurchase"
            :organisation-id="organisationId"
            @submit="loadProducts"
        />
        <OrganisationInventoryManagementDialog
            v-if="selectedInventoryProduct && selectedInventoryVariant"
            v-model="showInventory"
            :organisation-id="selectedInventoryProduct.organisationId"
            :entity-id="selectedInventoryVariant.id"
            :title="`${selectedInventoryProduct.name} — ${selectedInventoryVariant.sku}`"
            @saved="handleInventorySaved"
        />
        <ConfirmDialog
            v-model="showDelete"
            title="Delete organisation product"
            :message="`Delete ${selected?.name ?? 'this organisation product'}?`"
            details="A listing with inventory or reservations cannot be deleted."
            confirm-text="Delete"
            confirm-color="error"
            @confirm="remove"
            @cancel="showDelete = false"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import { PROCUREMENT_ORDER_PERMISSIONS } from '~/components/orders/order.permissions'
import { INVENTORY_PERMISSIONS } from '~/components/inventory/inventory.permissions'

import { computed, onBeforeUnmount, ref, watch } from 'vue'
import DataTable from '~/components/data-table/DataTable.vue'
import { getFullImageUrl } from '~/utils/image.util'
import { useAccessStore } from '~/stores/access.store'
import { useFilterStore } from '~/stores/filter.store'
import PageFilters from '~/components/filters/PageFilters.vue'
import AddOrganisationProductDialog from '~/components/organisation-products/AddOrganisationProductDialog.vue'
import EditOrganisationProductDialog from '~/components/organisation-products/EditOrganisationProductDialog.vue'
import PurchaseWizardDialog from '~/components/organisation-products/PurchaseWizardDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import OrganisationInventoryManagementDialog from '~/components/inventory/OrganisationInventoryManagementDialog.vue'
import type { OrganisationProduct } from '~/types/organisation-product.types'
import type { OrganisationProductApiService } from '~/services/api/wrappers/organisation-product.api'
import type { InventoryApiService } from '~/services/api/wrappers/inventory.api'
definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: ORGANISATION_PRODUCT_PERMISSIONS.READ, allowCrossOrganisation: true },
    organisationFilter: { permission: ORGANISATION_PRODUCT_PERMISSIONS.READ },
})
const access = useAccessStore()
const filters = useFilterStore()
const isOverview = computed(
    () => access.isPlatformContext && access.canAcrossOrganisations(ORGANISATION_PRODUCT_PERMISSIONS.READ)
)
const organisationId = computed(() => (access.isPlatformContext ? null : access.actingOrganisationId))
const overviewOrganisationId = computed(() => (isOverview.value ? filters.organisationId : null))
const canCreate = computed(() => !!organisationId.value && access.can(ORGANISATION_PRODUCT_PERMISSIONS.WRITE))
const canUpdate = computed(() => !!organisationId.value && access.can(ORGANISATION_PRODUCT_PERMISSIONS.WRITE))
const canDelete = computed(() => !!organisationId.value && access.can(ORGANISATION_PRODUCT_PERMISSIONS.DELETE))
const contextName = computed(() =>
    isOverview.value
        ? overviewOrganisationId.value
            ? (access.organisations.find((organisation) => organisation.id === overviewOrganisationId.value)?.name ??
              'Selected organisation')
            : 'All accessible organisations'
        : (access.actingContext?.organisationName ?? 'No organisation selected')
)
const targetOrganisationName = computed(() =>
    organisationId.value
        ? (access.organisations.find((organisation) => organisation.id === organisationId.value)?.name ?? '')
        : ''
)
const api = useNuxtApp().$organisationProductApi as OrganisationProductApiService
const inventoryApi = useNuxtApp().$inventoryApi as InventoryApiService
const locations = ref<Array<{ id: number; name: string }>>([])
const products = ref<(OrganisationProduct & { organisationName?: string })[]>([])
const selected = ref<OrganisationProduct | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const search = ref('')
const page = ref(1)
const total = ref(0)
const showAdd = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)
const showPurchase = ref(false)
const showInventory = ref(false)
const selectedInventoryProduct = ref<OrganisationProduct | null>(null)
const selectedInventoryVariant = ref<OrganisationProduct['variants'][number] | null>(null)
let request = 0
const headers = computed(() => [
    ...(isOverview.value ? [{ title: 'Organisation', key: 'organisationName' }] : []),
    { title: 'Thumbnail', key: 'thumbnail', sortable: false },
    { title: 'White-label name', key: 'name' },
    { title: 'Variants', key: 'variants' },
    { title: 'Inventory', key: 'inventory' },
    { title: 'Active', key: 'isActive' },
    { title: 'Actions', key: 'actions', sortable: false },
])
const filteredProducts = computed(() => {
    const query = search.value.trim().toLowerCase()
    return products.value.filter(
        (product) =>
            !query ||
            product.name.toLowerCase().includes(query) ||
            product.organisationName?.toLowerCase().includes(query) ||
            product.variants.some((variant) => variant.sku.toLowerCase().includes(query))
    )
})
function money(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
function locationName(id: number) {
    return locations.value.find((location) => location.id === id)?.name ?? `#${id}`
}
function formatAttributes(attributes: Record<string, string>) {
    return Object.entries(attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' · ')
}
function formatVariantDetails(variant: OrganisationProduct['variants'][number]) {
    return [variant.size, variant.color, formatAttributes(variant.attributes)]
        .filter(Boolean)
        .join(' · ')
}
function managedVariants(product: OrganisationProduct): OrganisationProduct['variants'] {
    return product.variants.filter((variant) => variant.stockManaged && !variant.isDeleted)
}
function hasManagedInventory(product: OrganisationProduct): boolean {
    return managedVariants(product).length > 0
}
function canManageProductInventory(product: OrganisationProduct): boolean {
    return access.can(INVENTORY_PERMISSIONS.WRITE, product.organisationId)
}
function openEdit(product: OrganisationProduct) {
    if (canUpdate.value) {
        selected.value = product
        showEdit.value = true
    }
}
function requestDelete(product: OrganisationProduct) {
    if (canDelete.value) {
        selected.value = product
        showDelete.value = true
    }
}
function openInventory(product: OrganisationProduct, variant: OrganisationProduct['variants'][number]): void {
    selectedInventoryProduct.value = product
    selectedInventoryVariant.value = variant
    showInventory.value = true
}
async function handleInventorySaved(): Promise<void> {
    showInventory.value = false
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
    await loadProducts()
}
function clear() {
    request++
    locations.value = []
    loading.value = false
    products.value = []
    total.value = 0
    errorMessage.value = ''
    selected.value = null
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
    showInventory.value = false
    showAdd.value = showEdit.value = showDelete.value = showPurchase.value = false
}
watch(
    [organisationId, isOverview, overviewOrganisationId],
    () => {
        clear()
        if (access.ready) void loadProducts()
    },
    { flush: 'sync' }
)
async function fetchPage() {
    const current = ++request
    products.value = []
    errorMessage.value = ''
    if (!access.ready) return
    if (!isOverview.value && (!organisationId.value || !access.can(ORGANISATION_PRODUCT_PERMISSIONS.READ))) {
        errorMessage.value = 'You do not have permission to read products in this organisation.'
        return
    }
    loading.value = true
    try {
        if (isOverview.value) {
            const response = await api.getOverview(page.value, overviewOrganisationId.value ?? undefined)
            if (current !== request) return
            products.value = response.data?.items ?? []
            total.value = response.data?.total ?? 0
        } else if (organisationId.value) {
            const response = await api.getAllOrganisationProducts(organisationId.value)
            if (current !== request) return
            products.value = response.data ?? []
            if (access.can(INVENTORY_PERMISSIONS.WRITE, organisationId.value)) {
                const locationResponse = await inventoryApi.getInventoryLocations(organisationId.value)
                if (current !== request) return
                locations.value = locationResponse.data ?? []
            }
        }
    } catch (error) {
        if (current === request)
            errorMessage.value = error instanceof Error ? error.message : 'Unable to load products.'
    } finally {
        if (current === request) loading.value = false
    }
}
async function loadProducts() {
    clear()
    page.value = 1
    await fetchPage()
}
async function toggle(product: OrganisationProduct, isActive: boolean) {
    if (access.busy || !organisationId.value || !canUpdate.value) return
    const current = request
    try {
        await api.updateOrganisationProduct(organisationId.value, product.id, { isActive })
        if (current === request) await loadProducts()
    } catch (error) {
        if (current === request) useToast().errorFromError(error, 'Unable to update product.')
    }
}
async function remove() {
    if (access.busy || !selected.value || !organisationId.value || !canDelete.value) return
    const current = request
    try {
        await api.deleteOrganisationProduct(organisationId.value, selected.value.id)
        if (current === request) await loadProducts()
    } catch (error) {
        if (current === request) useToast().errorFromError(error, 'Unable to delete product.')
    }
}
onBeforeUnmount(() => {
    request++
})
watch(showInventory, (isOpen) => {
    if (isOpen) return
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
})
await loadProducts()
</script>
