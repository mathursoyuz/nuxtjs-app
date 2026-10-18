<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Organisations</h1>
                    <v-btn
                        v-if="access.can(ORGANISATION_PERMISSIONS.WRITE)"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="openCreateDialog"
                    >
                        Create Organisation
                    </v-btn>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>Organisations</span>
                    </v-card-title>
                    <v-card-text>
                        <!-- Search -->
                        <div class="mb-4">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search organisations..."
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
                            :items="filteredOrganisations"
                            :loading="loading"
                            :selectable="access.can(ORGANISATION_PERMISSIONS.WRITE)"
                            :show-select="access.can(ORGANISATION_PERMISSIONS.WRITE)"
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
                                        @click="handleViewProducts(item as Organisation)"
                                        title="View Products"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-receipt-text"
                                        size="small"
                                        color="info"
                                        variant="text"
                                        @click="handleViewTransactions(item as Organisation)"
                                        title="View Transactions"
                                    ></v-btn>
                                    <template v-if="access.can(ORGANISATION_PERMISSIONS.WRITE)">
                                        <v-btn
                                            icon="mdi-cart-plus"
                                            size="small"
                                            color="success"
                                            variant="text"
                                            @click="handlePurchaseProducts(item as Organisation)"
                                            title="Purchase Products"
                                        ></v-btn>
                                        <v-btn
                                            icon="mdi-plus-circle"
                                            size="small"
                                            color="info"
                                            variant="text"
                                            @click="handleAddProduct(item as Organisation)"
                                            title="Add Product"
                                        ></v-btn>
                                        <v-btn
                                            icon="mdi-credit-card-plus"
                                            size="small"
                                            color="primary"
                                            variant="text"
                                            @click="handleAddCreditCard(item as Organisation)"
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
                                    </template>
                                    <v-btn
                                        v-if="access.can(ORGANISATION_PERMISSIONS.DELETE)"
                                        icon="mdi-delete"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        @click="handleDelete(item)"
                                        title="Delete"
                                    ></v-btn>
                                </div>
                            </template>
                            <template #item.logo="{ item }">
                                <v-avatar size="40">
                                    <v-img
                                        :src="getFullImageUrl(item.logo, 'organisations')"
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
                                    @update:model-value="toggleActive(item.id, !!$event)"
                                />
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Add Organisation Dialog - Lazy loaded -->
        <AddOrganisationDialog
            v-if="addDialogOpen"
            v-model="addDialogOpen"
            @submit="handleDialogSubmit"
        />

        <!-- Edit Organisation Dialog - Lazy loaded -->
        <EditOrganisationDialog
            v-if="editDialogOpen"
            v-model="editDialogOpen"
            :organisation="selectedOrganisation"
            @submit="handleDialogSubmit"
        />

        <!-- Delete Organisation Dialog - Lazy loaded -->
        <DeleteOrganisationDialog
            v-if="deleteDialogOpen"
            v-model="deleteDialogOpen"
            :organisation="selectedOrganisation"
            @submit="handleDialogSubmit"
        />

        <!-- Add Credit Card Dialog - Lazy loaded -->
        <AddOrganisationCreditCardDialog
            v-if="addCreditCardDialogOpen"
            v-model="addCreditCardDialogOpen"
            :organisation-id="selectedOrganisationForCreditCard?.id || 0"
            @submit="handleDialogSubmit"
        />

        <!-- Add Organisation Product Dialog - Lazy loaded -->
        <AddOrganisationProductDialog
            v-if="addProductDialogOpen && selectedOrganisationForProduct"
            v-model="addProductDialogOpen"
            :organisation-id="selectedOrganisationForProduct.id"
            :organisation-name="selectedOrganisationForProduct.name"
            @submit="handleDialogSubmit"
        />

        <!-- Purchase Wizard Dialog - Lazy loaded -->
        <PurchaseWizardDialog
            v-if="purchaseDialogOpen"
            v-model="purchaseDialogOpen"
            :organisation-id="selectedOrganisationForPurchase?.id || 0"
            @submit="handleDialogSubmit"
        />

        <!-- View Organisation Products Dialog - Lazy loaded -->
        <ViewOrganisationProductsDialog
            v-if="viewProductsDialogOpen && selectedOrganisationForViewProducts"
            v-model="viewProductsDialogOpen"
            :organisation-id="selectedOrganisationForViewProducts.id"
            :organisation-name="selectedOrganisationForViewProducts.name"
        />

        <!-- View Organisation Transactions Dialog - Lazy loaded -->
        <ViewOrganisationTransactionsDialog
            v-if="viewTransactionsDialogOpen"
            v-model="viewTransactionsDialogOpen"
            :organisation-id="selectedOrganisationForTransactions?.id || 0"
            :organisation-name="selectedOrganisationForTransactions?.name || ''"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useOrganisation } from '~/composables/useOrganisation'
import { useAccessStore } from '~/stores/access.store'
import { ORGANISATION_PERMISSIONS } from '~/components/organisations/organisation.permissions'
import type { Organisation } from '~/types/organisation.types'
import { getFullImageUrl } from '~/utils/image.util'

// Lazy load dialog components - only loaded when needed
const AddOrganisationDialog = defineAsyncComponent(
    () => import('~/components/organisations/AddOrganisationDialog.vue')
)
const EditOrganisationDialog = defineAsyncComponent(
    () => import('~/components/organisations/EditOrganisationDialog.vue')
)
const DeleteOrganisationDialog = defineAsyncComponent(
    () => import('~/components/organisations/DeleteOrganisationDialog.vue')
)
const AddOrganisationCreditCardDialog = defineAsyncComponent(
    () => import('~/components/organisations/AddOrganisationCreditCardDialog.vue')
)
const AddOrganisationProductDialog = defineAsyncComponent(
    () => import('~/components/organisation-products/AddOrganisationProductDialog.vue')
)
const PurchaseWizardDialog = defineAsyncComponent(
    () => import('~/components/organisation-products/PurchaseWizardDialog.vue')
)
const ViewOrganisationProductsDialog = defineAsyncComponent(
    () => import('~/components/organisation-products/ViewOrganisationProductsDialog.vue')
)
const ViewOrganisationTransactionsDialog = defineAsyncComponent(
    () => import('~/components/organisations/ViewOrganisationTransactionsDialog.vue')
)

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: ORGANISATION_PERMISSIONS.READ },
})

const { organisations, loading, fetchOrganisations, toggleActive } = useOrganisation()
const access = useAccessStore()

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
const selectedOrganisation = ref<Organisation | null>(null)
const selectedOrganisationForCreditCard = ref<Organisation | null>(null)
const selectedOrganisationForProduct = ref<Organisation | null>(null)
const selectedOrganisationForPurchase = ref<Organisation | null>(null)
const selectedOrganisationForViewProducts = ref<Organisation | null>(null)
const selectedOrganisationForTransactions = ref<Organisation | null>(null)

const filteredOrganisations = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return organisations.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return organisations.value.filter((organisation) => {
        const nameMatch = organisation.name?.toLowerCase().includes(query)
        const emailMatch = organisation.email?.toLowerCase().includes(query)
        const websiteMatch = organisation.websiteUrl?.toLowerCase().includes(query)
        return nameMatch || emailMatch || websiteMatch
    })
})

const handleSearch = (query: string | null) => {
    searchQuery.value = query || ''
}

const openCreateDialog = () => {
    selectedOrganisation.value = null
    addDialogOpen.value = true
}

const handleEdit = (item: unknown) => {
    selectedOrganisation.value = item as Organisation
    editDialogOpen.value = true
}

const handleDelete = (item: unknown) => {
    selectedOrganisation.value = item as Organisation
    deleteDialogOpen.value = true
}

const handleAddCreditCard = (item: Organisation) => {
    selectedOrganisationForCreditCard.value = item
    addCreditCardDialogOpen.value = true
}

const handleAddProduct = (item: Organisation) => {
    selectedOrganisationForProduct.value = item
    addProductDialogOpen.value = true
}

const handlePurchaseProducts = (item: Organisation) => {
    selectedOrganisationForPurchase.value = item
    purchaseDialogOpen.value = true
}

const handleViewProducts = (item: Organisation) => {
    selectedOrganisationForViewProducts.value = item
    viewProductsDialogOpen.value = true
}

const handleViewTransactions = (item: Organisation) => {
    selectedOrganisationForTransactions.value = item
    viewTransactionsDialogOpen.value = true
}

const handleDialogSubmit = async () => {
    await fetchOrganisations()
}

// Use useLazyAsyncData for initial data fetching
const { pending: organisationsPending } = await useLazyAsyncData('organisations-initial', async () => {
    await fetchOrganisations()
})
</script>
