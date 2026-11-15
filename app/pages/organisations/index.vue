<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Organisations</h1>
                    <v-btn
                        v-if="access.can(ORGANISATION_PERMISSIONS.CREATE)"
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
                            :selectable="access.can(ORGANISATION_PERMISSIONS.UPDATE)"
                            :show-select="access.can(ORGANISATION_PERMISSIONS.UPDATE)"
                            item-value="id"
                            class="elevation-1"
                        >
                            <template #item.actions="{ item }">
                                <div class="d-flex align-center gap-2" style="min-width: 400px">
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
                                    <v-btn
                                        v-if="canManageMemberships(item as Organisation)"
                                        icon="mdi-card-account-details-star"
                                        size="small"
                                        color="secondary"
                                        variant="text"
                                        @click="handleManageMemberships(item as Organisation)"
                                        title="Manage customer memberships"
                                    />
                                    <v-btn
                                        v-if="canManagePlatformServices(item as Organisation)"
                                        icon="mdi-shield-star"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handlePlatformServices(item as Organisation)"
                                        title="Subscribe to Platform Services"
                                    />
                                    <v-btn
                                        v-if="
                                            access.can(
                                                PROCUREMENT_ORDER_PERMISSIONS.CREATE,
                                                item.id
                                            )
                                        "
                                        icon="mdi-cart-plus"
                                        size="small"
                                        color="success"
                                        variant="text"
                                        @click="handlePurchaseProducts(item as Organisation)"
                                        title="Purchase Products"
                                    ></v-btn>
                                    <v-btn
                                        v-if="
                                            access.can(
                                                ORGANISATION_PRODUCT_PERMISSIONS.CREATE,
                                                item.id
                                            )
                                        "
                                        icon="mdi-plus-circle"
                                        size="small"
                                        color="info"
                                        variant="text"
                                        @click="handleAddProduct(item as Organisation)"
                                        title="Add Product"
                                    ></v-btn>
                                    <v-btn
                                        v-if="
                                            access.can(
                                                ORGANISATION_CREDIT_CARD_PERMISSIONS.CREATE,
                                                item.id
                                            )
                                        "
                                        icon="mdi-credit-card-plus"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleAddCreditCard(item as Organisation)"
                                        title="Add Credit Card"
                                    ></v-btn>
                                    <template v-if="access.can(ORGANISATION_PERMISSIONS.UPDATE)">
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
            :organisation="selectedOrganisationForCreditCard"
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

        <OrganisationPlatformServicesDialog
            v-if="platformServicesDialogOpen && selectedOrganisationForPlatformServices"
            v-model="platformServicesDialogOpen"
            :organisation-id="selectedOrganisationForPlatformServices.id"
            :organisation-name="selectedOrganisationForPlatformServices.name"
            :can-write="canWritePlatformServices"
        />

        <OrganisationMembershipManagerDialog
            v-if="membershipManagerDialogOpen && selectedOrganisationForMemberships"
            v-model="membershipManagerDialogOpen"
            :organisation-id="selectedOrganisationForMemberships.id"
            :organisation-name="selectedOrganisationForMemberships.name"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { useOrganisation } from '~/composables/useOrganisation'
import { useAccessStore } from '~/stores/access.store'
import { ORGANISATION_PERMISSIONS } from '~/components/organisations/organisation.permissions'
import { ORGANISATION_CREDIT_CARD_PERMISSIONS } from '~/components/organisations/organisation-credit-card.permissions'
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import { PROCUREMENT_ORDER_PERMISSIONS } from '~/components/orders/order.permissions'
import {
    ORGANISATION_MEMBERSHIP_PERMISSIONS,
    ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
} from '~/components/memberships/membership.permissions'
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
const OrganisationPlatformServicesDialog = defineAsyncComponent(
    () => import('~/components/memberships/OrganisationPlatformServicesDialog.vue')
)
const OrganisationMembershipManagerDialog = defineAsyncComponent(
    () => import('~/components/memberships/OrganisationMembershipManagerDialog.vue')
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
const platformServicesDialogOpen = ref(false)
const membershipManagerDialogOpen = ref(false)
const selectedOrganisation = ref<Organisation | null>(null)
const selectedOrganisationForCreditCard = ref<Organisation | null>(null)
const selectedOrganisationForProduct = ref<Organisation | null>(null)
const selectedOrganisationForPurchase = ref<Organisation | null>(null)
const selectedOrganisationForViewProducts = ref<Organisation | null>(null)
const selectedOrganisationForTransactions = ref<Organisation | null>(null)
const selectedOrganisationForPlatformServices = ref<Organisation | null>(null)
const selectedOrganisationForMemberships = ref<Organisation | null>(null)
const canWritePlatformServices = computed(() =>
    selectedOrganisationForPlatformServices.value
        ? access.can(
              ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.CREATE,
              selectedOrganisationForPlatformServices.value.id
          ) ||
          access.can(
              ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.UPDATE,
              selectedOrganisationForPlatformServices.value.id
          )
        : false
)
const canManageMemberships = (organisation: Organisation): boolean =>
    organisation.id !== access.platformOrganisationId &&
    access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.READ, organisation.id)
const canManagePlatformServices = (organisation: Organisation): boolean =>
    organisation.id !== access.platformOrganisationId &&
    access.can(ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, organisation.id)

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

const handleSearch = (query: string | null): void => {
    searchQuery.value = query || ''
}

const openCreateDialog = (): void => {
    selectedOrganisation.value = null
    addDialogOpen.value = true
}

const handleEdit = (item: unknown): void => {
    selectedOrganisation.value = item as Organisation
    editDialogOpen.value = true
}

const handleDelete = (item: unknown): void => {
    selectedOrganisation.value = item as Organisation
    deleteDialogOpen.value = true
}

const handleAddCreditCard = (item: Organisation): void => {
    selectedOrganisationForCreditCard.value = item
    addCreditCardDialogOpen.value = true
}

const handleAddProduct = (item: Organisation): void => {
    selectedOrganisationForProduct.value = item
    addProductDialogOpen.value = true
}

const handlePurchaseProducts = (item: Organisation): void => {
    selectedOrganisationForPurchase.value = item
    purchaseDialogOpen.value = true
}

const handleViewProducts = (item: Organisation): void => {
    selectedOrganisationForViewProducts.value = item
    viewProductsDialogOpen.value = true
}

const handleViewTransactions = (item: Organisation): void => {
    selectedOrganisationForTransactions.value = item
    viewTransactionsDialogOpen.value = true
}

const handleManageMemberships = (item: Organisation): void => {
    selectedOrganisationForMemberships.value = item
    membershipManagerDialogOpen.value = true
}

const handlePlatformServices = (item: Organisation): void => {
    selectedOrganisationForPlatformServices.value = item
    platformServicesDialogOpen.value = true
}

const handleDialogSubmit = async (): Promise<void> => {
    await fetchOrganisations()
}

// Use useLazyAsyncData for initial data fetching
const { pending: organisationsPending } = await useLazyAsyncData(
    'organisations-initial',
    async () => {
        await fetchOrganisations()
    }
)
</script>
