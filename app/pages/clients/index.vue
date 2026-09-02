<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Clients</h1>
                    <RoleGuard roles="admin">
                        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">
                            Create Client
                        </v-btn>
                    </RoleGuard>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>Clients</span>
                    </v-card-title>
                    <v-card-text>
                        <!-- Search -->
                        <div class="mb-4">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search clients..."
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="compact"
                                clearable
                                @update:model-value="handleSearch"
                            />
                        </div>

                        <!-- Data Table -->
                        <v-data-table
                            :headers="headers"
                            :items="filteredClients"
                            :loading="loading"
                            :selectable="canAccess('admin')"
                            :show-select="canAccess('admin')"
                            item-value="id"
                            class="elevation-1"
                        >
                            <template #item.actions="{ item }">
                                <div class="d-flex align-center gap-2" style="min-width: 320px">
                                    <v-btn
                                        icon="mdi-package-variant"
                                        size="small"
                                        color="info"
                                        variant="text"
                                        @click="handleViewProducts(item as Client)"
                                        title="View Products"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-receipt-text"
                                        size="small"
                                        color="info"
                                        variant="text"
                                        @click="handleViewTransactions(item as Client)"
                                        title="View Transactions"
                                    ></v-btn>
                                    <RoleGuard roles="admin">
                                        <v-btn
                                            icon="mdi-cart-plus"
                                            size="small"
                                            color="success"
                                            variant="text"
                                            @click="handlePurchaseProducts(item as Client)"
                                            title="Purchase Products"
                                        ></v-btn>
                                        <v-btn
                                            icon="mdi-plus-circle"
                                            size="small"
                                            color="info"
                                            variant="text"
                                            @click="handleAddProduct(item as Client)"
                                            title="Add Product"
                                        ></v-btn>
                                        <v-btn
                                            icon="mdi-credit-card-plus"
                                            size="small"
                                            color="primary"
                                            variant="text"
                                            @click="handleAddCreditCard(item as Client)"
                                            title="Add Credit Card"
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
                                    </RoleGuard>
                                </div>
                            </template>
                            <template #item.logo="{ item }">
                                <v-avatar size="40">
                                    <v-img
                                        :src="getFullImageUrl(item.logo, 'clients')"
                                        :alt="item.name"
                                    />
                                </v-avatar>
                            </template>

                            <template #item.isActive="{ item }">
                                <v-switch
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="toggleActive(item.id, $event)"
                                />
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Add Client Dialog - Lazy loaded -->
        <AddClientDialog
            v-if="addDialogOpen"
            v-model="addDialogOpen"
            @submit="handleDialogSubmit"
        />

        <!-- Edit Client Dialog - Lazy loaded -->
        <EditClientDialog
            v-if="editDialogOpen"
            v-model="editDialogOpen"
            :client="selectedClient"
            @submit="handleDialogSubmit"
        />

        <!-- Delete Client Dialog - Lazy loaded -->
        <DeleteClientDialog
            v-if="deleteDialogOpen"
            v-model="deleteDialogOpen"
            :client="selectedClient"
            @submit="handleDialogSubmit"
        />

        <!-- Add Credit Card Dialog - Lazy loaded -->
        <AddClientCreditCardDialog
            v-if="addCreditCardDialogOpen"
            v-model="addCreditCardDialogOpen"
            :client-id="selectedClientForCreditCard?.id || 0"
            @submit="handleDialogSubmit"
        />

        <!-- Add Client Product Dialog - Lazy loaded -->
        <AddClientProductDialog
            v-if="addProductDialogOpen"
            v-model="addProductDialogOpen"
            :client-id="selectedClientForProduct?.id || 0"
            @submit="handleDialogSubmit"
        />

        <!-- Purchase Wizard Dialog - Lazy loaded -->
        <PurchaseWizardDialog
            v-if="purchaseDialogOpen"
            v-model="purchaseDialogOpen"
            :client-id="selectedClientForPurchase?.id || 0"
            @submit="handleDialogSubmit"
        />

        <!-- View Client Products Dialog - Lazy loaded -->
        <ViewClientProductsDialog
            v-if="viewProductsDialogOpen"
            v-model="viewProductsDialogOpen"
            :client-id="selectedClientForViewProducts?.id || 0"
            :client-name="selectedClientForViewProducts?.name || ''"
        />

        <!-- View Client Transactions Dialog - Lazy loaded -->
        <ViewClientTransactionsDialog
            v-if="viewTransactionsDialogOpen"
            v-model="viewTransactionsDialogOpen"
            :client-id="selectedClientForTransactions?.id || 0"
            :client-name="selectedClientForTransactions?.name || ''"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useClient } from '~/composables/useClient'
import { useRole } from '~/composables/useRole'
import RoleGuard from '~/components/guards/RoleGuard.vue'
import type { Client } from '~/types/client.types'
import { getFullImageUrl } from '~/utils/image.util'

// Lazy load dialog components - only loaded when needed
const AddClientDialog = defineAsyncComponent(
    () => import('~/components/clients/AddClientDialog.vue')
)
const EditClientDialog = defineAsyncComponent(
    () => import('~/components/clients/EditClientDialog.vue')
)
const DeleteClientDialog = defineAsyncComponent(
    () => import('~/components/clients/DeleteClientDialog.vue')
)
const AddClientCreditCardDialog = defineAsyncComponent(
    () => import('~/components/clients/AddClientCreditCardDialog.vue')
)
const AddClientProductDialog = defineAsyncComponent(
    () => import('~/components/client-products/AddClientProductDialog.vue')
)
const PurchaseWizardDialog = defineAsyncComponent(
    () => import('~/components/client-products/PurchaseWizardDialog.vue')
)
const ViewClientProductsDialog = defineAsyncComponent(
    () => import('~/components/client-products/ViewClientProductsDialog.vue')
)
const ViewClientTransactionsDialog = defineAsyncComponent(
    () => import('~/components/clients/ViewClientTransactionsDialog.vue')
)

definePageMeta({
    middleware: ['auth'],
})

const { clients, loading, fetchClients, toggleActive } = useClient()
const { canAccess } = useRole()

const headers = [
    { title: 'Logo', key: 'logo', sortable: false },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Website', key: 'websiteUrl', sortable: true },
    { title: 'Active', key: 'isActive', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const searchQuery = ref('')
const addDialogOpen = ref(false)
const editDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const addCreditCardDialogOpen = ref(false)
const addProductDialogOpen = ref(false)
const purchaseDialogOpen = ref(false)
const viewProductsDialogOpen = ref(false)
const viewTransactionsDialogOpen = ref(false)
const selectedClient = ref<Client | null>(null)
const selectedClientForCreditCard = ref<Client | null>(null)
const selectedClientForProduct = ref<Client | null>(null)
const selectedClientForPurchase = ref<Client | null>(null)
const selectedClientForViewProducts = ref<Client | null>(null)
const selectedClientForTransactions = ref<Client | null>(null)

const filteredClients = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return clients.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return clients.value.filter((client) => {
        const nameMatch = client.name?.toLowerCase().includes(query)
        const emailMatch = client.email?.toLowerCase().includes(query)
        const websiteMatch = client.websiteUrl?.toLowerCase().includes(query)
        return nameMatch || emailMatch || websiteMatch
    })
})

const handleSearch = (query: string | null) => {
    searchQuery.value = query || ''
}

const openCreateDialog = () => {
    selectedClient.value = null
    addDialogOpen.value = true
}

const handleEdit = (item: unknown) => {
    selectedClient.value = item as Client
    editDialogOpen.value = true
}

const handleDelete = (item: unknown) => {
    selectedClient.value = item as Client
    deleteDialogOpen.value = true
}

const handleAddCreditCard = (item: Client) => {
    selectedClientForCreditCard.value = item
    addCreditCardDialogOpen.value = true
}

const handleAddProduct = (item: Client) => {
    selectedClientForProduct.value = item
    addProductDialogOpen.value = true
}

const handlePurchaseProducts = (item: Client) => {
    selectedClientForPurchase.value = item
    purchaseDialogOpen.value = true
}

const handleViewProducts = (item: Client) => {
    selectedClientForViewProducts.value = item
    viewProductsDialogOpen.value = true
}

const handleViewTransactions = (item: Client) => {
    selectedClientForTransactions.value = item
    viewTransactionsDialogOpen.value = true
}

const handleDialogSubmit = async () => {
    await fetchClients()
}

// Use useLazyAsyncData for initial data fetching
const { pending: clientsPending } = await useLazyAsyncData('clients-initial', async () => {
    await fetchClients()
})
</script>
