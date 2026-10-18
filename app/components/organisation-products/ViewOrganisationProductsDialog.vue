<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="updateDialog"
        max-width="1400"
        scrollable
        persistent
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between bg-primary">
                <span class="text-h5 text-white">Organisation Products - {{ organisationName }}</span>
                <v-btn icon variant="text" @click="closeDialog">
                    <v-icon color="white">mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-sheet class="pa-6">
                    <div class="d-flex align-center justify-space-between mb-4">
                        <div class="text-body-2 text-medium-emphasis">
                            Managing products for {{ organisationName }}
                        </div>
                        <v-btn
                            v-if="canWrite"
                            color="primary"
                            prepend-icon="mdi-plus"
                            @click="showAdd = true"
                        >
                            Add product
                        </v-btn>
                    </div>
                    <DataTable
                        :headers="headers"
                        :items="organisationProducts"
                        :loading="loading"
                        title="Organisation Products"
                        searchable
                        search-label="Search products..."
                        :selectable="false"
                        :show-actions="canWrite || canDelete || canManageInventory"
                    >
                        <template #no-data>
                            <div class="text-center py-8">
                                <v-icon size="64" color="grey-lighten-1">
                                    mdi-package-variant-closed
                                </v-icon>
                                <p class="text-h6 mt-4 text-medium-emphasis">No products found</p>
                                <p class="text-body-2 text-medium-emphasis mt-2">
                                    This organisation doesn't have any products yet.
                                </p>
                            </div>
                        </template>
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
                                        {{ variant.sku }} · ${{ variant.price.toFixed(2) }}
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
                                    {{ locationName(balance.locationId) }}:
                                    {{ balance.available }} available
                                    <span v-if="balance.reserved">
                                        / {{ balance.reserved }} reserved
                                    </span>
                                </v-chip>
                            </div>
                        </template>

                        <template #item.isActive="{ item }">
                            <v-switch
                                :model-value="item.isActive"
                                :disabled="!canWrite || loading"
                                density="compact"
                                hide-details
                                color="primary"
                                @update:model-value="toggle(item, Boolean($event))"
                            />
                        </template>

                        <template #item.actions="{ item }">
                            <div class="d-flex ga-1">
                                <v-menu v-if="canManageInventory && hasManagedInventory(item)">
                                    <template #activator="{ props: menuProps }">
                                        <v-btn
                                            v-bind="menuProps"
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
                                    v-if="canWrite"
                                    icon="mdi-pencil"
                                    size="small"
                                    variant="text"
                                    color="primary"
                                    title="Edit"
                                    @click.stop="edit(item)"
                                />
                                <v-btn
                                    v-if="canDelete"
                                    icon="mdi-delete"
                                    size="small"
                                    variant="text"
                                    color="error"
                                    title="Delete"
                                    @click.stop="requestDelete(item)"
                                />
                            </div>
                        </template>
                    </DataTable>
                </v-sheet>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="primary" @click="closeDialog">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <AddOrganisationProductDialog
        v-if="showAdd"
        v-model="showAdd"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        :available-products="organisationProducts"
        @submit="refreshProducts"
    />
    <EditOrganisationProductDialog
        v-if="showEdit"
        v-model="showEdit"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        :organisation-product="selected"
        :available-products="organisationProducts"
        @submit="refreshProducts"
    />
    <OrganisationInventoryManagementDialog
        v-if="selectedInventoryProduct && selectedInventoryVariant"
        v-model="showInventory"
        :organisation-id="organisationId"
        :entity-id="selectedInventoryVariant.id"
        :title="`${selectedInventoryProduct.name} — ${selectedInventoryVariant.sku}`"
        @saved="handleInventorySaved"
    />
    <ConfirmDialog
        v-model="showDelete"
        title="Delete organisation product"
        :message="`Delete ${selected?.name ?? 'this product'}?`"
        details="Products with inventory or reservations cannot be deleted."
        confirm-text="Delete"
        confirm-color="error"
        @confirm="remove"
        @cancel="showDelete = false"
    />
</template>

<script setup lang="ts">
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import { INVENTORY_PERMISSIONS } from '~/components/inventory/inventory.permissions'

import { computed, ref, watch, onMounted } from 'vue'
import { useAccessStore } from '~/stores/access.store'
const access = useAccessStore()
let productRequest = 0
import { useNuxtApp } from '#app'
import DataTable from '~/components/data-table/DataTable.vue'
import AddOrganisationProductDialog from '~/components/organisation-products/AddOrganisationProductDialog.vue'
import EditOrganisationProductDialog from '~/components/organisation-products/EditOrganisationProductDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import OrganisationInventoryManagementDialog from '~/components/inventory/OrganisationInventoryManagementDialog.vue'
import { useToast } from '~/composables/useToast'
import { getFullImageUrl } from '~/utils/image.util'
import type { OrganisationProduct } from '~/types/organisation-product.types'
import type { InventoryApiService } from '~/services/api/wrappers/inventory.api'
import type { InventoryLocation } from '~/types/inventory.types'

interface Props {
    modelValue: boolean
    organisationId: number
    organisationName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const nuxtApp = useNuxtApp()
const organisationProductApi =
    nuxtApp.$organisationProductApi as import('~/services/api/wrappers/organisation-product.api').OrganisationProductApiService
const inventoryApi = nuxtApp.$inventoryApi as InventoryApiService

const loading = ref(false)
const organisationProducts = ref<OrganisationProduct[]>([])
const locations = ref<InventoryLocation[]>([])
const selected = ref<OrganisationProduct | null>(null)
const showAdd = ref(false)
const showEdit = ref(false)
const showDelete = ref(false)
const showInventory = ref(false)
const selectedInventoryProduct = ref<OrganisationProduct | null>(null)
const selectedInventoryVariant = ref<OrganisationProduct['variants'][number] | null>(null)
const canWrite = computed(() => access.can(ORGANISATION_PRODUCT_PERMISSIONS.WRITE, props.organisationId))
const canDelete = computed(() => access.can(ORGANISATION_PRODUCT_PERMISSIONS.DELETE, props.organisationId))
const canManageInventory = computed(() => access.can(INVENTORY_PERMISSIONS.WRITE, props.organisationId))

const headers = [
    { title: 'Thumbnail', key: 'thumbnail', sortable: false },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Variants', key: 'variants', sortable: false },
    { title: 'Inventory by variant/location', key: 'inventory', sortable: false },
    { title: 'Status', key: 'isActive', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

function locationName(locationId: number): string {
    return locations.value.find((location) => location.id === locationId)?.name ?? `#${locationId}`
}

const formatAttributes = (attributes: Record<string, string>): string =>
    Object.entries(attributes)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' · ')

const formatVariantDetails = (variant: OrganisationProduct['variants'][number]): string =>
    [variant.size, variant.color, formatAttributes(variant.attributes)].filter(Boolean).join(' · ')

const managedVariants = (product: OrganisationProduct): OrganisationProduct['variants'] =>
    product.variants.filter((variant) => variant.stockManaged && !variant.isDeleted)

const hasManagedInventory = (product: OrganisationProduct): boolean => managedVariants(product).length > 0

const openInventory = (
    product: OrganisationProduct,
    variant: OrganisationProduct['variants'][number]
): void => {
    selectedInventoryProduct.value = product
    selectedInventoryVariant.value = variant
    showInventory.value = true
}

const fetchOrganisationProducts = async () => {
    const current = ++productRequest
    organisationProducts.value = []
    locations.value = []
    if (!props.organisationId) return

    loading.value = true
    try {
        await access.ensureReady()
        if (!access.can(ORGANISATION_PRODUCT_PERMISSIONS.READ, props.organisationId)) return
        const [response, locationResponse] = await Promise.all([
            organisationProductApi.getAllOrganisationProducts(props.organisationId),
            canManageInventory.value
                ? inventoryApi.getInventoryLocations(props.organisationId)
                : Promise.resolve({ data: [] as InventoryLocation[] }),
        ])
        if (current !== productRequest) return
        locations.value = locationResponse.data ?? []
        if (response.success && response.data) {
            organisationProducts.value = response.data
        } else {
            organisationProducts.value = []
        }
    } catch (error) {
        console.error('Error fetching organisation products:', error)
        if (current === productRequest) organisationProducts.value = []
    } finally {
        if (current === productRequest) loading.value = false
    }
}

const refreshProducts = async (): Promise<void> => {
    showAdd.value = false
    showEdit.value = false
    selected.value = null
    await fetchOrganisationProducts()
}

const handleInventorySaved = async (): Promise<void> => {
    showInventory.value = false
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
    await fetchOrganisationProducts()
}

const clearInventorySelection = (): void => {
    showInventory.value = false
    selectedInventoryProduct.value = null
    selectedInventoryVariant.value = null
}

const updateDialog = (value: boolean): void => {
    if (!value) clearInventorySelection()
    emit('update:modelValue', value)
}

const closeDialog = (): void => updateDialog(false)

const edit = (product: OrganisationProduct): void => {
    selected.value = product
    showEdit.value = true
}

const requestDelete = (product: OrganisationProduct): void => {
    selected.value = product
    showDelete.value = true
}

const toggle = async (product: OrganisationProduct, isActive: boolean): Promise<void> => {
    if (!canWrite.value) return
    try {
        await organisationProductApi.toggleOrganisationProduct(props.organisationId, product.id, isActive)
        await fetchOrganisationProducts()
    } catch (error) {
        useToast().errorFromError(error, 'Unable to update product status.')
    }
}

const remove = async (): Promise<void> => {
    if (!selected.value || !canDelete.value) return
    try {
        await organisationProductApi.deleteOrganisationProduct(props.organisationId, selected.value.id)
        showDelete.value = false
        selected.value = null
        await fetchOrganisationProducts()
    } catch (error) {
        useToast().errorFromError(error, 'Unable to delete product.')
    }
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen && props.organisationId) {
            fetchOrganisationProducts()
        }
    }
)

watch(
    () => props.organisationId,
    (newId) => {
        clearInventorySelection()
        if (props.modelValue && newId) {
            fetchOrganisationProducts()
        }
    }
)

watch(showInventory, (isOpen) => {
    if (!isOpen) clearInventorySelection()
})

onMounted(() => {
    if (props.modelValue && props.organisationId) {
        fetchOrganisationProducts()
    }
})
</script>
