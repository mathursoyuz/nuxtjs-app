<template>
    <v-container fluid>
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <div>
                <h1 class="text-h4">Client products</h1>
                <div class="text-body-2 text-medium-emphasis">
                    White-label listings and client-owned location inventory.
                </div>
            </div>
            <div class="d-flex flex-wrap align-center ga-2">
                <v-autocomplete
                    v-model="selectedClientId"
                    v-model:search="clientSearch"
                    :items="clientOptions"
                    :loading="clientsLoading"
                    label="Client"
                    variant="outlined"
                    density="compact"
                    hide-details
                    clearable
                    no-filter
                    style="min-width: 260px"
                    @update:model-value="loadClientProducts"
                />
                <RoleGuard roles="admin">
                    <v-btn
                        color="success"
                        prepend-icon="mdi-cart-plus"
                        :disabled="!selectedClientId"
                        @click="showPurchaseDialog = true"
                    >
                        Procure
                    </v-btn>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-plus"
                        :disabled="!selectedClientId"
                        @click="showAddDialog = true"
                    >
                        Add label
                    </v-btn>
                </RoleGuard>
            </div>
        </div>

        <v-alert v-if="!selectedClientId" type="info" variant="tonal" class="mb-4">
            Select a client to load only that client’s catalogue and inventory.
        </v-alert>

        <v-card>
            <v-card-text>
                <DataTable
                    :headers="headers"
                    :items="filteredProducts"
                    :loading="loading"
                    title="Client products"
                    searchable
                    search-label="Search client products"
                    :selectable="false"
                    :show-actions="true"
                    @search="searchQuery = $event"
                    @edit="(item) => openEdit(item as ClientProduct)"
                    @delete="(item) => requestDelete(item as ClientProduct)"
                >
                    <template #item.thumbnail="{ item }">
                        <v-avatar size="40">
                            <v-img
                                :src="getFullImageUrl(item.thumbnail, 'client-products')"
                                :alt="item.name"
                            />
                        </v-avatar>
                    </template>
                    <template #item.variants="{ item }">
                        <div class="d-flex flex-column align-start ga-1 py-2">
                            <v-chip
                                v-for="variant in item.variants"
                                :key="variant.id"
                                :color="variant.isActive ? 'primary' : 'default'"
                                size="small"
                                variant="tonal"
                            >
                                {{ variant.sku }} · {{ money(variant.price) }}
                            </v-chip>
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
                            density="compact"
                            hide-details
                            color="primary"
                            @update:model-value="toggleActive(item, Boolean($event))"
                        />
                    </template>
                    <template #item.actions="{ item }">
                        <div class="d-flex ga-1">
                            <RoleGuard roles="admin">
                                <v-btn
                                    icon="mdi-pencil"
                                    size="small"
                                    variant="text"
                                    color="primary"
                                    @click.stop="openEdit(item)"
                                />
                                <v-btn
                                    icon="mdi-delete"
                                    size="small"
                                    variant="text"
                                    color="error"
                                    @click.stop="requestDelete(item)"
                                />
                            </RoleGuard>
                        </div>
                    </template>
                    <template #no-data>
                        <div class="pa-8 text-center text-medium-emphasis">
                            {{
                                selectedClientId
                                    ? 'This client has no white-label products.'
                                    : 'Select a client.'
                            }}
                        </div>
                    </template>
                </DataTable>
            </v-card-text>
        </v-card>

        <AddClientProductDialog
            v-if="selectedClientId"
            v-model="showAddDialog"
            :client-id="selectedClientId"
            @submit="handleDialogSubmit"
        />
        <EditClientProductDialog
            v-if="selectedClientId"
            v-model="showEditDialog"
            :client-id="selectedClientId"
            :client-product="selectedProduct"
            @submit="handleDialogSubmit"
        />
        <PurchaseWizardDialog
            v-if="selectedClientId"
            v-model="showPurchaseDialog"
            :client-id="selectedClientId"
            @submit="handleDialogSubmit"
        />
        <ConfirmDialog
            v-model="showDeleteDialog"
            title="Delete client product"
            :message="`Delete ${productToDelete?.name ?? 'this client product'}?`"
            details="A listing with inventory or reservations cannot be deleted."
            confirm-text="Delete"
            confirm-color="error"
            @confirm="confirmDelete"
            @cancel="showDeleteDialog = false"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import AddClientProductDialog from '~/components/client-products/AddClientProductDialog.vue'
import EditClientProductDialog from '~/components/client-products/EditClientProductDialog.vue'
import PurchaseWizardDialog from '~/components/client-products/PurchaseWizardDialog.vue'
import DataTable from '~/components/data-table/DataTable.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import RoleGuard from '~/components/guards/RoleGuard.vue'
import { useToast } from '~/composables/useToast'
import { CLIENT_PRODUCT_MESSAGES } from '~/constants/messages.constants'
import { getFullImageUrl } from '~/utils/image.util'
import type { ClientProduct } from '~/types/client-product.types'
import type { ClientLookupOption } from '~/services/api/wrappers/client.api'
import type { Location } from '~/types/location.types'

definePageMeta({ middleware: ['auth'] })

const nuxtApp = useNuxtApp()
const clientApi =
    nuxtApp.$clientApi as import('~/services/api/wrappers/client.api').ClientApiService
const clientProductApi =
    nuxtApp.$clientProductApi as import('~/services/api/wrappers/client-product.api').ClientProductApiService
const locationApi =
    nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
const { successFromResponse, errorFromError } = useToast()

const clients = ref<ClientLookupOption[]>([])
const products = ref<ClientProduct[]>([])
const locations = ref<Location[]>([])
const selectedClientId = ref<number | null>(null)
const clientSearch = ref('')
const selectedProduct = ref<ClientProduct | null>(null)
const productToDelete = ref<ClientProduct | null>(null)
const searchQuery = ref('')
const loading = ref(false)
const clientsLoading = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showPurchaseDialog = ref(false)
const showDeleteDialog = ref(false)
let clientLookupTimer: ReturnType<typeof setTimeout> | undefined
let clientLookupSequence = 0

const headers = [
    { title: 'Thumbnail', key: 'thumbnail', sortable: false },
    { title: 'White-label name', key: 'name' },
    { title: 'Variants', key: 'variants', sortable: false },
    { title: 'Inventory by variant/location', key: 'inventory', sortable: false },
    { title: 'Active', key: 'isActive' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const clientOptions = computed(() =>
    clients.value.map((client) => ({ title: client.name, value: client.id }))
)
const filteredProducts = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return products.value
    return products.value.filter(
        (product) =>
            product.name.toLowerCase().includes(query) ||
            product.variants.some((variant) => variant.sku.toLowerCase().includes(query))
    )
})

function money(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function locationName(locationId: number): string {
    return locations.value.find((location) => location.id === locationId)?.name ?? `#${locationId}`
}

async function loadClientProducts(): Promise<void> {
    products.value = []
    locations.value = []
    selectedProduct.value = null
    searchQuery.value = ''
    if (!selectedClientId.value) return
    loading.value = true
    try {
        const [productResponse, locationResponse] = await Promise.all([
            clientProductApi.getAllClientProducts(selectedClientId.value),
            locationApi.getAllLocations(selectedClientId.value),
        ])
        products.value = productResponse.data ?? []
        locations.value = locationResponse.data ?? []
    } catch (error) {
        errorFromError(error, CLIENT_PRODUCT_MESSAGES.FETCH_ERROR)
    } finally {
        loading.value = false
    }
}

function openEdit(product: ClientProduct): void {
    selectedProduct.value = product
    showEditDialog.value = true
}

function requestDelete(product: ClientProduct): void {
    productToDelete.value = product
    showDeleteDialog.value = true
}

async function confirmDelete(): Promise<void> {
    if (!selectedClientId.value || !productToDelete.value) return
    try {
        const response = await clientProductApi.deleteClientProduct(
            selectedClientId.value,
            productToDelete.value.id
        )
        successFromResponse(response, CLIENT_PRODUCT_MESSAGES.DELETE_SUCCESS)
        showDeleteDialog.value = false
        productToDelete.value = null
        await loadClientProducts()
    } catch (error) {
        errorFromError(error, CLIENT_PRODUCT_MESSAGES.DELETE_ERROR)
    }
}

async function toggleActive(product: ClientProduct, isActive: boolean): Promise<void> {
    if (!selectedClientId.value) return
    try {
        const response = await clientProductApi.updateClientProduct(
            selectedClientId.value,
            product.id,
            { isActive }
        )
        const updatedProduct = response.data
        if (updatedProduct) {
            products.value = products.value.map((current) =>
                current.id === updatedProduct.id ? updatedProduct : current
            )
        }
        successFromResponse(response, isActive ? 'Product activated' : 'Product deactivated')
    } catch (error) {
        product.isActive = !isActive
        errorFromError(error, CLIENT_PRODUCT_MESSAGES.TOGGLE_ERROR)
    }
}

async function handleDialogSubmit(): Promise<void> {
    showAddDialog.value = false
    showEditDialog.value = false
    showPurchaseDialog.value = false
    selectedProduct.value = null
    await loadClientProducts()
}

async function lookupClients(search = ''): Promise<void> {
    const sequence = ++clientLookupSequence
    clientsLoading.value = true
    try {
        const selectedClient = clients.value.find((client) => client.id === selectedClientId.value)
        const response = await clientApi.lookupClients(search)
        if (sequence !== clientLookupSequence) return

        const matches = response.data ?? []
        clients.value =
            selectedClient && !matches.some((client) => client.id === selectedClient.id)
                ? [selectedClient, ...matches]
                : matches
    } catch (error) {
        if (sequence === clientLookupSequence) {
            errorFromError(error, 'Failed to search clients')
        }
    } finally {
        if (sequence === clientLookupSequence) {
            clientsLoading.value = false
        }
    }
}

watch(clientSearch, (search) => {
    if (clientLookupTimer) clearTimeout(clientLookupTimer)
    clientLookupTimer = setTimeout(() => void lookupClients(search ?? ''), 300)
})

onBeforeUnmount(() => {
    if (clientLookupTimer) clearTimeout(clientLookupTimer)
})

void lookupClients()
</script>
