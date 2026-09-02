<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="1400"
        scrollable
        persistent
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between bg-primary">
                <span class="text-h5 text-white">Client Products - {{ clientName }}</span>
                <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
                    <v-icon color="white">mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-sheet class="pa-6">
                    <DataTable
                        :headers="headers"
                        :items="clientProducts"
                        :loading="loading"
                        title="Client Products"
                        searchable
                        search-label="Search products..."
                        :selectable="false"
                        :show-actions="true"
                        @edit="(item) => handleEdit(item as ClientProduct)"
                        @delete="(item) => handleDeleteClick(item as ClientProduct)"
                    >
                        <template #no-data>
                            <div class="text-center py-8">
                                <v-icon size="64" color="grey-lighten-1">
                                    mdi-package-variant-closed
                                </v-icon>
                                <p class="text-h6 mt-4 text-medium-emphasis">No products found</p>
                                <p class="text-body-2 text-medium-emphasis mt-2">
                                    This client doesn't have any products yet.
                                </p>
                            </div>
                        </template>
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
                                    {{ variant.sku }} · ${{ variant.price.toFixed(2) }}
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
                                    {{ locationName(balance.locationId) }}:
                                    {{ balance.available }} available
                                    <span v-if="balance.reserved">
                                        / {{ balance.reserved }} reserved
                                    </span>
                                </v-chip>
                            </div>
                        </template>

                        <template #item.isActive="{ item }">
                            <v-chip
                                :color="item.isActive ? 'success' : 'error'"
                                size="small"
                                variant="flat"
                            >
                                {{ item.isActive ? 'Active' : 'Inactive' }}
                            </v-chip>
                        </template>

                        <template #item.actions="{ item }">
                            <div class="d-flex align-center gap-2">
                                <v-btn
                                    icon="mdi-pencil"
                                    size="small"
                                    color="primary"
                                    variant="text"
                                    @click.stop="handleEdit(item)"
                                    title="Edit"
                                />
                                <v-btn
                                    icon="mdi-delete"
                                    size="small"
                                    color="error"
                                    variant="text"
                                    @click.stop="handleDeleteClick(item)"
                                    title="Delete"
                                />
                            </div>
                        </template>
                    </DataTable>
                </v-sheet>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn color="primary" @click="$emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>

            <!-- Edit Client Product Dialog -->
            <EditClientProductDialog
                v-model="showEditDialog"
                :client-id="clientId"
                :client-product="selectedClientProduct"
                @submit="handleDialogSubmit"
            />

            <!-- Delete Confirmation Dialog -->
            <ConfirmDialog
                v-model="showDeleteDialog"
                title="Delete Client Product"
                :message="`Are you sure you want to delete ${productToDelete?.name}?`"
                details="This action will soft delete the product. This action cannot be undone."
                confirm-text="Delete"
                cancel-text="Cancel"
                confirm-color="error"
                icon="mdi-delete-alert"
                icon-color="error"
                @confirm="handleDeleteConfirm"
                @cancel="showDeleteDialog = false"
            />
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import DataTable from '~/components/data-table/DataTable.vue'
import EditClientProductDialog from '~/components/client-products/EditClientProductDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import { useToast } from '~/composables/useToast'
import { CLIENT_PRODUCT_MESSAGES } from '~/constants/messages.constants'
import { getFullImageUrl } from '~/utils/image.util'
import type { ClientProduct } from '~/types/client-product.types'
import type { Location } from '~/types/location.types'

interface Props {
    modelValue: boolean
    clientId: number
    clientName: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const nuxtApp = useNuxtApp()
const clientProductApi =
    nuxtApp.$clientProductApi as import('~/services/api/wrappers/client-product.api').ClientProductApiService
const { successFromResponse, errorFromError } = useToast()

const loading = ref(false)
const clientProducts = ref<ClientProduct[]>([])
const locations = ref<Location[]>([])
const showEditDialog = ref(false)
const selectedClientProduct = ref<ClientProduct | null>(null)
const showDeleteDialog = ref(false)
const productToDelete = ref<ClientProduct | null>(null)

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

const fetchClientProducts = async () => {
    if (!props.clientId) return

    loading.value = true
    try {
        const locationApi =
            nuxtApp.$locationApi as import('~/services/api/wrappers/location.api').LocationApiService
        const [response, locationResponse] = await Promise.all([
            clientProductApi.getAllClientProducts(props.clientId),
            locationApi.getAllLocations(props.clientId),
        ])
        locations.value = locationResponse.data ?? []
        if (response.success && response.data) {
            clientProducts.value = response.data
        } else {
            clientProducts.value = []
        }
    } catch (error) {
        console.error('Error fetching client products:', error)
        clientProducts.value = []
    } finally {
        loading.value = false
    }
}

const handleEdit = (item: ClientProduct) => {
    selectedClientProduct.value = item
    showEditDialog.value = true
}

const handleDeleteClick = (item: ClientProduct) => {
    productToDelete.value = item
    showDeleteDialog.value = true
}

const handleDeleteConfirm = async () => {
    if (!props.clientId || !productToDelete.value) return

    try {
        const response = await clientProductApi.deleteClientProduct(
            props.clientId,
            productToDelete.value.id
        )
        if (response.success) {
            successFromResponse(response, CLIENT_PRODUCT_MESSAGES.DELETE_SUCCESS)
            showDeleteDialog.value = false
            productToDelete.value = null
            await fetchClientProducts()
        } else {
            errorFromError(response, CLIENT_PRODUCT_MESSAGES.DELETE_ERROR)
        }
    } catch (err) {
        console.error('Error deleting product:', err)
        errorFromError(err, CLIENT_PRODUCT_MESSAGES.DELETE_ERROR)
    }
}

const handleDialogSubmit = async () => {
    await fetchClientProducts()
    showEditDialog.value = false
    selectedClientProduct.value = null
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen && props.clientId) {
            fetchClientProducts()
        }
    }
)

watch(
    () => props.clientId,
    (newId) => {
        if (props.modelValue && newId) {
            fetchClientProducts()
        }
    }
)

onMounted(() => {
    if (props.modelValue && props.clientId) {
        fetchClientProducts()
    }
})
</script>
