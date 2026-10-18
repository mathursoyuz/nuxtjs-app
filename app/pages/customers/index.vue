<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Customers</h1>
                    <div class="d-flex align-center gap-2">
                        <v-btn
                            v-if="canWriteSelectedOrganisation"
                            color="primary"
                            prepend-icon="mdi-plus"
                            @click="openAddDialog()"
                        >
                            Create Customer
                        </v-btn>
                    </div>
                </div>

                <v-card>
                    <v-card-text>
                        <v-select
                            v-model="selectedOrganisationId"
                            :items="organisationOptions"
                            item-title="name"
                            item-value="id"
                            label="Select Organisation"
                            style="max-width: 250px"
                            density="compact"
                            @update:model-value="handleOrganisationChange"
                        ></v-select>
                        <!-- Search -->
                        <div class="mb-4">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search customers..."
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="compact"
                                clearable
                                @update:model-value="handleSearch"
                            />
                        </div>

                        <!-- Data Table -->
                        <v-data-table-server
                            :headers="headers"
                            :items="customers"
                            :loading="loading"
                            :selectable="canWriteSelectedOrganisation"
                            :show-select="canWriteSelectedOrganisation"
                            :items-length="pagination?.total ?? 0"
                            :page="currentPage"
                            :items-per-page="itemsPerPage"
                            item-value="id"
                            class="elevation-1"
                            @update:page="handlePageChange"
                            @update:items-per-page="handleItemsPerPageChange"
                        >
                            <template #item.email="{ item }">
                                <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                            </template>

                            <template #item.phoneNumber="{ item }">
                                <a :href="`tel:${item.phoneNumber}`">{{ item.phoneNumber }}</a>
                            </template>

                            <template #item.qbStatus="{ item }">
                                <div class="d-flex flex-column gap-1" style="max-width: 200px">
                                    <div class="d-flex align-center gap-2">
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
                                                    <v-icon start size="small">
                                                        mdi-alert-circle
                                                    </v-icon>
                                                    QB Failed
                                                </v-chip>
                                            </template>
                                        </v-tooltip>
                                        <v-chip
                                            v-else-if="item.isQbSynced"
                                            color="success"
                                            size="small"
                                            variant="flat"
                                        >
                                            <v-icon start size="small">mdi-check-circle</v-icon>
                                            QB Synced
                                        </v-chip>
                                        <v-chip v-else color="warning" size="small" variant="flat">
                                            <v-icon start size="small">mdi-alert-circle</v-icon>
                                            QB Not Synced
                                        </v-chip>
                                    </div>
                                    <div
                                        v-if="item.qbSyncErrorReason"
                                        class="text-caption text-error"
                                        style="
                                            word-wrap: break-word;
                                            word-break: break-word;
                                            white-space: normal;
                                            line-height: 1.2;
                                            max-height: 60px;
                                            overflow: hidden;
                                        "
                                    >
                                        {{ item.qbSyncErrorReason }}
                                    </div>
                                    <v-btn
                                        v-if="!item.isQbSynced || item.qbSyncErrorReason"
                                        icon="mdi-sync"
                                        size="x-small"
                                        color="primary"
                                        variant="text"
                                        :loading="
                                            syncingCustomerId === item.id && syncingTo === 'qb'
                                        "
                                        @click="handleSyncToQB(item)"
                                        :title="
                                            item.qbSyncErrorReason
                                                ? `Resync to QuickBooks - ${item.qbSyncErrorReason}`
                                                : 'Sync to QuickBooks'
                                        "
                                    ></v-btn>
                                </div>
                            </template>

                            <template #item.squareStatus="{ item }">
                                <div class="d-flex flex-column gap-1" style="max-width: 200px">
                                    <div class="d-flex align-center gap-2">
                                        <v-tooltip
                                            v-if="item.squareSyncErrorReason"
                                            :text="item.squareSyncErrorReason"
                                            location="top"
                                        >
                                            <template v-slot:activator="{ props }">
                                                <v-chip
                                                    v-bind="props"
                                                    color="error"
                                                    size="small"
                                                    variant="flat"
                                                >
                                                    <v-icon start size="small">
                                                        mdi-alert-circle
                                                    </v-icon>
                                                    Square Failed
                                                </v-chip>
                                            </template>
                                        </v-tooltip>
                                        <v-chip
                                            v-else-if="item.isSquareSynced"
                                            color="success"
                                            size="small"
                                            variant="flat"
                                        >
                                            <v-icon start size="small">mdi-check-circle</v-icon>
                                            Square Synced
                                        </v-chip>
                                        <v-chip v-else color="warning" size="small" variant="flat">
                                            <v-icon start size="small">mdi-alert-circle</v-icon>
                                            Square Not Synced
                                        </v-chip>
                                    </div>
                                    <div
                                        v-if="item.squareSyncErrorReason"
                                        class="text-caption text-error"
                                        style="
                                            word-wrap: break-word;
                                            word-break: break-word;
                                            white-space: normal;
                                            line-height: 1.2;
                                            max-height: 60px;
                                            overflow: hidden;
                                        "
                                    >
                                        {{ item.squareSyncErrorReason }}
                                    </div>
                                    <v-btn
                                        v-if="!item.isSquareSynced || item.squareSyncErrorReason"
                                        icon="mdi-sync"
                                        size="x-small"
                                        color="primary"
                                        variant="text"
                                        :loading="
                                            syncingCustomerId === item.id && syncingTo === 'square'
                                        "
                                        @click="handleSyncToSquare(item)"
                                        :title="
                                            item.squareSyncErrorReason
                                                ? `Resync to Square - ${item.squareSyncErrorReason}`
                                                : 'Sync to Square'
                                        "
                                    ></v-btn>
                                </div>
                            </template>

                            <template #item.isActive="{ item }">
                                <v-switch
                                    :disabled="!canWriteCustomer(item)"
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="handleToggleActive(item.id, !!$event)"
                                />
                            </template>

                            <template #item.actions="{ item }">
                                <div class="d-flex align-center gap-2 flex-wrap">
                                    <v-btn
                                        v-if="canReadCustomerOrders(item)"
                                        icon="mdi-receipt-text-clock"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleOrders(item)"
                                        title="View paid, pending and failed orders"
                                    ></v-btn>
                                    <v-btn
                                        v-if="canCreateCustomerOrder(item)"
                                        icon="mdi-cart-plus"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handlePurchase(item)"
                                        title="Create customer order"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-eye"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleView(item)"
                                        title="View Details"
                                    ></v-btn>
                                    <v-btn
                                        v-if="canWriteCustomer(item)"
                                        icon="mdi-credit-card"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleAddCreditCard(item)"
                                        title="Add Credit Card"
                                    ></v-btn>
                                    <v-btn
                                        v-if="canWriteCustomer(item)"
                                        icon="mdi-truck-delivery"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleManageShipping(item)"
                                        title="Manage Shipping Addresses"
                                    ></v-btn>
                                    <v-btn
                                        v-if="canWriteCustomer(item)"
                                        icon="mdi-pencil"
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        @click="handleEdit(item)"
                                        title="Edit Customer"
                                    ></v-btn>
                                    <v-btn
                                        v-if="canDeleteCustomer(item)"
                                        icon="mdi-delete"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        @click="handleDelete(item)"
                                        title="Delete Customer"
                                    ></v-btn>
                                </div>
                            </template>
                        </v-data-table-server>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Add Customer Dialog - Lazy loaded -->
        <AddCustomerDialog
            v-if="showAddDialog"
            v-model="showAddDialog"
            :organisations="organisations"
            :organisation-id="selectedOrganisationId ?? 0"
            @submit="handleCustomerCreated"
        />

        <!-- Edit Customer Dialog - Lazy loaded -->
        <EditCustomerDialog
            v-if="showEditDialog"
            v-model="showEditDialog"
            :customer="selectedCustomer"
            :organisations="organisations"
            :organisation-id="selectedCustomer?.organisationId ?? selectedOrganisationId ?? 0"
            @submit="handleCustomerUpdated"
        />

        <!-- Add Credit Card Dialog - Lazy loaded -->
        <AddCreditCardDialog
            v-if="showAddCreditCardDialog"
            v-model="showAddCreditCardDialog"
            :customer="selectedCustomerForCreditCard"
            :organisation-id="selectedCustomerForCreditCard?.organisationId ?? selectedOrganisationId ?? 0"
            @submit="handleCreditCardAdded"
        />

        <!-- Manage Shipping Addresses Dialog - Lazy loaded -->
        <ManageShippingAddressesDialog
            v-if="showManageShippingDialog"
            v-model="showManageShippingDialog"
            :customer="selectedCustomerForShipping"
            :organisation-id="selectedCustomerForShipping?.organisationId ?? selectedOrganisationId ?? 0"
            @submit="handleShippingAddressesUpdated"
        />

        <!-- View Customer Dialog - Lazy loaded -->
        <ViewCustomerDialog
            v-if="showViewDialog"
            v-model="showViewDialog"
            :customer-id="selectedCustomerId"
            :organisation-id="selectedCustomer?.organisationId ?? selectedOrganisationId ?? null"
            @edit="handleEditFromView"
        />

        <CustomerOrdersDialog
            v-if="showOrdersDialog && selectedCustomerForOrders"
            v-model="showOrdersDialog"
            :customer="selectedCustomerForOrders"
        />

        <!-- Delete Confirmation Dialog -->
        <ConfirmDialog
            v-if="showDeleteDialog"
            v-model="showDeleteDialog"
            title="Delete Customer"
            :message="`Are you sure you want to delete ${customerToDelete?.firstName} ${customerToDelete?.lastName}?`"
            confirm-text="Delete"
            cancel-text="Cancel"
            confirm-color="error"
            icon="mdi-delete"
            icon-color="error"
            @confirm="confirmDelete"
            @cancel="customerToDelete = null"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCustomer } from '~/composables/useCustomer'
import { useOrganisation } from '~/composables/useOrganisation'
import { useAccessStore } from '~/stores/access.store'
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'
import { CUSTOMER_ORDER_PERMISSIONS } from '~/components/orders/order.permissions'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { useToast } from '~/composables/useToast'
import { useApiMessage } from '~/composables/useApiMessage'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { defineAsyncComponent } from 'vue'
import type { Customer } from '~/services/api/wrappers/customer.api'

// Lazy load dialog components - only loaded when needed
const AddCustomerDialog = defineAsyncComponent(
    () => import('~/components/customers/AddCustomerDialog.vue')
)
const EditCustomerDialog = defineAsyncComponent(
    () => import('~/components/customers/EditCustomerDialog.vue')
)
const AddCreditCardDialog = defineAsyncComponent(
    () => import('~/components/customers/AddCreditCardDialog.vue')
)
const ManageShippingAddressesDialog = defineAsyncComponent(
    () => import('~/components/customers/ManageShippingAddressesDialog.vue')
)
const ViewCustomerDialog = defineAsyncComponent(
    () => import('~/components/customers/ViewCustomerDialog.vue')
)
const CustomerOrdersDialog = defineAsyncComponent(
    () => import('~/components/orders/CustomerOrdersDialog.vue')
)
const ConfirmDialog = defineAsyncComponent(() => import('~/components/dialogs/ConfirmDialog.vue'))

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_PERMISSIONS.READ, allowCrossOrganisation: true },
})

const { organisations, fetchOrganisations } = useOrganisation()
const {
    customers,
    loading,
    fetchCustomers,
    toggleActive: toggleCustomerActive,
    fetchCustomerById,
    deleteCustomer,
    pagination,
    syncCustomerToQB,
    importCustomersFromQB,
    importCustomersFromSquare,
    syncCustomerToSquare,
} = useCustomer()
const access = useAccessStore()
const canWriteSelectedOrganisation = computed(
    () =>
        selectedOrganisationId.value !== null &&
        access.can(CUSTOMER_PERMISSIONS.WRITE, selectedOrganisationId.value)
)
const canWriteCustomer = (customer: Customer) =>
    access.can(CUSTOMER_PERMISSIONS.WRITE, customer.organisationId)
const canDeleteCustomer = (customer: Customer) =>
    access.can(CUSTOMER_PERMISSIONS.DELETE, customer.organisationId)
const canReadCustomerOrders = (customer: Customer) =>
    access.can(CUSTOMER_ORDER_PERMISSIONS.READ, customer.organisationId)
const canCreateCustomerOrder = (customer: Customer) =>
    access.can(CUSTOMER_ORDER_PERMISSIONS.WRITE, customer.organisationId)
const { successFromResponse, errorFromError, success } = useToast()
const { getImportResultMessage } = useApiMessage()

// No organisation is selected by default, so the first request includes every organisation.
const selectedOrganisationId = ref<number | null>(null)

// Pagination state
const currentPage = ref(1)
const itemsPerPage = ref(25)

const organisationOptions = computed(() => {
    const options = [
        { id: null, name: 'All Organisations' },
        ...organisations.value.map((organisation) => ({
            id: organisation.id,
            name: organisation.name,
        })),
    ]
    return options
})

const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showViewDialog = ref(false)
const showAddCreditCardDialog = ref(false)
const showManageShippingDialog = ref(false)
const selectedCustomer = ref<Customer | null>(null)
const selectedCustomerId = ref<number | null>(null)
const selectedCustomerForCreditCard = ref<Customer | null>(null)
const selectedCustomerForShipping = ref<Customer | null>(null)
const selectedCustomerForOrders = ref<Customer | null>(null)
const showOrdersDialog = ref(false)

const headers = [
    { title: 'Name', key: 'firstName', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Phone', key: 'phoneNumber', sortable: true },
    { title: 'QB Status', key: 'qbStatus', sortable: false },
    { title: 'Square Status', key: 'squareStatus', sortable: false },
    { title: 'Active', key: 'isActive', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const searchQuery = ref('')
const syncingCustomerId = ref<number | null>(null)
const syncingTo = ref<'qb' | 'square' | null>(null)
const importingFrom = ref<'qb' | 'square' | null>(null)

const handleImportFromQB = async () => {
    importingFrom.value = 'qb'

    try {
        const loadingTask = useLoadingTask('import-customers-qb')
        await loadingTask.execute(async () => {
            const result = await importCustomersFromQB()
            const message = getImportResultMessage(result, CUSTOMER_MESSAGES.IMPORT_QB_SUCCESS)
            success(message)
            await refreshCustomers()
        })
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.IMPORT_QB_ERROR)
    } finally {
        importingFrom.value = null
    }
}

const handleImportFromSquare = async () => {
    importingFrom.value = 'square'

    try {
        const loadingTask = useLoadingTask('import-customers-square')
        await loadingTask.execute(async () => {
            const result = await importCustomersFromSquare()
            const message = getImportResultMessage(result, CUSTOMER_MESSAGES.IMPORT_SQUARE_SUCCESS)
            success(message)
            await refreshCustomers()
        })
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        importingFrom.value = null
    }
}

const handleSyncToQB = async (customer: Customer) => {
    syncingCustomerId.value = customer.id
    syncingTo.value = 'qb'

    try {
        const loadingTask = useLoadingTask('sync-customer-qb')
        await loadingTask.execute(async () => {
            const response = await syncCustomerToQB(customer.id)
            const fallbackMessage = customer.qbSyncErrorReason
                ? CUSTOMER_MESSAGES.SYNC_QB_RESYNC_SUCCESS
                : CUSTOMER_MESSAGES.SYNC_QB_SUCCESS
            successFromResponse({ success: true, message: '', data: response }, fallbackMessage)
            await refreshCustomers()
        })
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.SYNC_QB_ERROR)
    } finally {
        syncingCustomerId.value = null
        syncingTo.value = null
    }
}

const handleSyncToSquare = async (customer: Customer) => {
    syncingCustomerId.value = customer.id
    syncingTo.value = 'square'

    try {
        const loadingTask = useLoadingTask('sync-customer-square')
        await loadingTask.execute(async () => {
            const response = await syncCustomerToSquare(customer.id)
            successFromResponse(
                { success: true, message: '', data: response },
                CUSTOMER_MESSAGES.SYNC_SQUARE_SUCCESS
            )
            await refreshCustomers()
        })
    } catch (error) {
        errorFromError(error, CUSTOMER_MESSAGES.SYNC_SQUARE_ERROR)
    } finally {
        syncingCustomerId.value = null
        syncingTo.value = null
    }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

const handleSearch = (query: string | null) => {
    searchQuery.value = query || ''
    currentPage.value = 1
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
        void refreshCustomers()
    }, 300)
}

const openAddDialog = () => {
    showAddDialog.value = true
}

const handleView = (item: Customer) => {
    selectedCustomerId.value = item.id
    selectedCustomer.value = item
    showViewDialog.value = true
}

const handleOrders = (item: Customer) => {
    selectedCustomerForOrders.value = item
    showOrdersDialog.value = true
}

const handlePurchase = async (item: Customer) => {
    await navigateTo({ path: '/orders/create', query: { customerId: String(item.id) } })
}

const handleEdit = async (item: Customer) => {
    const loadingTask = useLoadingTask('load-customer-for-edit')
    await loadingTask.execute(async () => {
        const fullCustomer = await fetchCustomerById(item.id)
        selectedCustomer.value = fullCustomer
        showEditDialog.value = true
    })
}

const handleEditFromView = (customerId: number, _organisationId: number) => {
    showViewDialog.value = false
    const customer = customers.value.find((c) => c.id === customerId)
    if (customer) {
        handleEdit(customer)
    }
}

const showDeleteDialog = ref(false)
const customerToDelete = ref<Customer | null>(null)

const handleDelete = (item: Customer) => {
    customerToDelete.value = item
    showDeleteDialog.value = true
}

const confirmDelete = async () => {
    if (!customerToDelete.value) return

    try {
        const loadingTask = useLoadingTask('delete-customer')
        await loadingTask.execute(async () => {
            await deleteCustomer(customerToDelete.value!.id)
            await refreshCustomers()
        })
    } catch (error) {
        console.error('Failed to delete customer:', error)
    } finally {
        showDeleteDialog.value = false
        customerToDelete.value = null
    }
}

const handleToggleActive = async (customerId: number, isActive: boolean) => {
    try {
        const loadingTask = useLoadingTask('toggle-customer-active')
        await loadingTask.execute(async () => {
            await toggleCustomerActive(customerId, isActive)
            await refreshCustomers()
        })
    } catch (error) {
        console.error('Failed to toggle customer status:', error)
    }
}

const handleOrganisationChange = async () => {
    currentPage.value = 1 // Reset to first page on organisation change
    const loadingTask = useLoadingTask('fetch-customers')
    await loadingTask.execute(async () => {
        await fetchCustomers(
            selectedOrganisationId.value,
            currentPage.value,
            itemsPerPage.value,
            searchQuery.value
        )
    })
}

const handlePageChange = async (page: number) => {
    currentPage.value = page
    const loadingTask = useLoadingTask('fetch-customers-page')
    await loadingTask.execute(async () => {
        await fetchCustomers(
            selectedOrganisationId.value,
            currentPage.value,
            itemsPerPage.value,
            searchQuery.value
        )
    })
}

const handleItemsPerPageChange = async (limit: number) => {
    itemsPerPage.value = limit
    currentPage.value = 1 // Reset to first page when changing items per page
    const loadingTask = useLoadingTask('fetch-customers-limit')
    await loadingTask.execute(async () => {
        await fetchCustomers(
            selectedOrganisationId.value,
            currentPage.value,
            itemsPerPage.value,
            searchQuery.value
        )
    })
}

// Optimized: Single refresh function to avoid redundant calls
const refreshCustomers = async () => {
    const loadingTask = useLoadingTask('refresh-customers')
    await loadingTask.execute(async () => {
        await fetchCustomers(
            selectedOrganisationId.value,
            currentPage.value,
            itemsPerPage.value,
            searchQuery.value
        )
    })
}

const handleCustomerCreated = async () => {
    currentPage.value = 1 // Reset to first page after creating
    await refreshCustomers()
}

const handleCustomerUpdated = async () => {
    await refreshCustomers()
}

const handleAddCreditCard = async (item: Customer) => {
    const loadingTask = useLoadingTask('load-customer-for-credit-card')
    await loadingTask.execute(async () => {
        const fullCustomer = await fetchCustomerById(item.id)
        selectedCustomerForCreditCard.value = fullCustomer
        showAddCreditCardDialog.value = true
    })
}

const handleManageShipping = async (item: Customer) => {
    const loadingTask = useLoadingTask('load-customer-for-shipping')
    await loadingTask.execute(async () => {
        const fullCustomer = await fetchCustomerById(item.id)
        selectedCustomerForShipping.value = fullCustomer
        showManageShippingDialog.value = true
    })
}

const handleCreditCardAdded = async () => {
    await refreshCustomers()
}

const handleShippingAddressesUpdated = async () => {
    await refreshCustomers()
}

await useAsyncData('customers-initial-data', async () => {
    await Promise.all([
        fetchOrganisations(),
        fetchCustomers(
            selectedOrganisationId.value,
            currentPage.value,
            itemsPerPage.value,
            searchQuery.value
        ),
    ])
    return true
})
</script>
