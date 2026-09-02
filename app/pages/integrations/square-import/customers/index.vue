<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Customers</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        :loading="loading"
                        @click="refreshData"
                    >
                        Refresh
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <!-- Bulk Actions -->
                        <div v-if="selectedItems.length > 0" class="mb-4">
                            <v-alert type="info" density="compact">
                                <div class="d-flex align-center justify-space-between">
                                    <span>
                                        {{ selectedItems.length }} customer(s) selected for import
                                    </span>
                                    <v-btn
                                        color="success"
                                        prepend-icon="mdi-import"
                                        :loading="importing"
                                        size="small"
                                        @click="importSelectedCustomers"
                                    >
                                        Import Selected
                                    </v-btn>
                                </div>
                            </v-alert>
                        </div>

                        <!-- Vuetify Data Table Server with Cursor-based Pagination -->
                        <v-data-table-server
                            v-model="selectedItems"
                            :headers="headers"
                            :items="paginatedCustomers"
                            :loading="loading"
                            :items-length="totalItems"
                            :page="currentPage"
                            item-value="id"
                            show-select
                            class="elevation-1"
                            @update:page="handlePageChange"
                            @update:items-per-page="handleItemsPerPageChange"
                        >
                            <!-- Custom footer to show next page button when cursor is available -->
                            <template #footer.prepend>
                                <div v-if="hasMore && nextCursor" class="d-flex align-center pa-2">
                                    <v-chip color="info" size="small" class="mr-2">
                                        {{ customers.length }} items loaded
                                        <span v-if="hasMore && nextCursor"> (more available)</span>
                                    </v-chip>
                                </div>
                            </template>
                            <template #item.name="{ item }">
                                <span>{{ getCustomerName(item) }}</span>
                            </template>
                            <template #item.email_address="{ item }">
                                <span>{{ item.email_address || '-' }}</span>
                            </template>
                            <template #item.phone_number="{ item }">
                                <span>{{ item.phone_number || '-' }}</span>
                            </template>
                            <template #item.syncStatus="{ item }">
                                <v-chip
                                    size="small"
                                    :color="item.localCustomer?.isSquareSynced ? 'success' : 'warning'"
                                >
                                    {{ item.localCustomer?.isSquareSynced ? 'Synced' : 'Not Synced' }}
                                </v-chip>
                            </template>
                            <template #item.created_at="{ item }">
                                <span>{{ formatDate(item.created_at) }}</span>
                            </template>
                            <template #item.updated_at="{ item }">
                                <span>{{ formatDate(item.updated_at) }}</span>
                            </template>
                            <template #item.actions="{ item }">
                                <div class="d-flex align-center gap-2">
                                    <v-btn
                                        icon="mdi-import"
                                        size="small"
                                        variant="text"
                                        color="primary"
                                        :loading="importingCustomerId === item.id"
                                        :disabled="importing && importingCustomerId !== item.id"
                                        @click="importSingleCustomer(item)"
                                    ></v-btn>
                                </div>
                            </template>
                        </v-data-table-server>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useToast } from '~/composables/useToast'
import { useLoadingTask } from '~/composables/useLoadingTask'
import type { SquareCustomer } from '~/types/square-import.types'
import type { SyncResult } from '~/types/square-import.types'

definePageMeta({
    middleware: ['auth'],
})

const nuxtApp = useNuxtApp()
const squareImportApi =
    nuxtApp.$squareImportApi as import('~/services/api/wrappers/square-import.api').SquareImportApiService

const { success, error, warning, successFromResponse, errorFromError } = useToast()

const loading = ref(false)
const importing = ref(false)
const importingCustomerId = ref<string | null>(null)
const customers = ref<SquareCustomer[]>([]) // Accumulated customers from all pages
const selectedItems = ref<string[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(100) // Track current items per page (default from global Vuetify config)
const totalItems = ref(0)
const nextCursor = ref<string | undefined>(undefined) // Current cursor for next page
const hasMore = ref(true)
const totalCount = ref<number | undefined>(undefined) // Total count from Square API

// Computed property to slice customers for current page
const paginatedCustomers = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return customers.value.slice(start, end)
})

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email_address', sortable: true },
    { title: 'Phone', key: 'phone_number', sortable: true },
    { title: 'Sync Status', key: 'syncStatus', sortable: false },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Updated At', key: 'updated_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const getCustomerName = (customer: SquareCustomer): string => {
    if (customer.given_name || customer.family_name) {
        return `${customer.given_name || ''} ${customer.family_name || ''}`.trim()
    }
    if (customer.company_name) {
        return customer.company_name
    }
    if (customer.nickname) {
        return customer.nickname
    }
    return '-'
}

const formatDate = (date?: string): string => {
    if (!date) return '-'
    try {
        return new Date(date).toLocaleString()
    } catch {
        return date
    }
}

const fetchCustomersPage = async (cursor?: string, append: boolean = false): Promise<void> => {
    loading.value = true
    try {
        const task = useLoadingTask('fetch-square-customers')
        await task.execute(async () => {
            const response = await squareImportApi.fetchCustomersWithCursor(cursor)
            if (response.success && response.data) {
                const pageCustomers = response.data.customers || []
                
                if (append) {
                    // Append new customers to existing list
                    customers.value = [...customers.value, ...pageCustomers]
                } else {
                    // Replace customers (for refresh or first page)
                    customers.value = pageCustomers
                }
                
                nextCursor.value = response.data.cursor
                hasMore.value = response.data.hasMore
                
                // Update total count if provided by API
                if (response.data.count !== undefined) {
                    totalCount.value = response.data.count
                    totalItems.value = response.data.count
                } else {
                    // If count not provided, use accumulated items count
                    // If hasMore is true and cursor exists, show that there are more items
                    if (hasMore.value && nextCursor.value) {
                        totalItems.value = customers.value.length + 1 // Show +1 to indicate more
                    } else {
                        totalItems.value = customers.value.length // Exact count
                    }
                }
            } else {
                errorFromError(response, 'Failed to fetch customers from Square')
            }
        })
    } catch (err) {
        console.error('Error fetching customers:', err)
        errorFromError(err, 'Failed to fetch customers from Square')
    } finally {
        loading.value = false
    }
}

const handlePageChange = async (page: number) => {
    const targetPage = page
    currentPage.value = targetPage
    
    // Calculate how many items we need for this page
    const itemsNeeded = targetPage * itemsPerPage.value
    const itemsWeHave = customers.value.length
    
    // If we need more items and have a cursor, keep fetching until we have enough
    while (itemsNeeded > itemsWeHave && nextCursor.value && hasMore.value) {
        await fetchCustomersPage(nextCursor.value, true) // Append to existing
        // Break if we now have enough items or no more cursor
        if (customers.value.length >= itemsNeeded || !nextCursor.value || !hasMore.value) {
            break
        }
    }
    
    // Update total items based on accumulated items
    if (hasMore.value && nextCursor.value) {
        // Show that there are more items available
        totalItems.value = customers.value.length + 1
    } else {
        // No more items, show exact count
        totalItems.value = customers.value.length
    }
}

const handleItemsPerPageChange = (itemsPerPageValue: number) => {
    itemsPerPage.value = itemsPerPageValue
    // Reset to first page when items per page changes
    currentPage.value = 1
}

const refreshData = async () => {
    nextCursor.value = undefined
    hasMore.value = true
    currentPage.value = 1
    totalCount.value = undefined
    selectedItems.value = []
    customers.value = [] // Clear accumulated customers
    await fetchCustomersPage(undefined, false) // Replace, don't append
}

const importSelectedCustomers = async () => {
    if (selectedItems.value.length === 0) {
        warning('Please select at least one customer to import')
        return
    }

    importing.value = true
    try {
        const task = useLoadingTask('import-square-customers')
        await task.execute(async () => {
            // Get selected customer objects from all accumulated customers
            const selectedCustomers = customers.value.filter((c) => selectedItems.value.includes(c.id))
            
            const response = await squareImportApi.storeSelectedCustomers(selectedCustomers)
            if (response.success && response.data) {
                const result = response.data.result
                const message = getImportResultMessage(result, `Successfully imported ${selectedItems.value.length} customer(s)`)
                
                if (result.errors.length > 0) {
                    warning(message)
                } else {
                    success(message)
                }

                selectedItems.value = []
                await refreshData()
            } else {
                errorFromError(response, 'Failed to import customers')
            }
        })
    } catch (err) {
        console.error('Error importing customers:', err)
        errorFromError(err, 'Failed to import customers')
    } finally {
        importing.value = false
    }
}

const importSingleCustomer = async (customer: SquareCustomer) => {
    importingCustomerId.value = customer.id
    try {
        const task = useLoadingTask(`import-square-customer-${customer.id}`)
        await task.execute(async () => {
            const response = await squareImportApi.storeSelectedCustomers([customer])
            if (response.success && response.data) {
                const result = response.data.result
                const successCount = result.created + result.updated

                if (successCount > 0) {
                    success('Successfully imported customer')
                } else {
                    warning('Customer was skipped (may already exist)')
                }

                if (result.errors.length > 0) {
                    const firstError = result.errors[0]
                    if (firstError) {
                        error(`Import failed: ${firstError.error}`)
                    }
                }

                await refreshData()
            } else {
                errorFromError(response, 'Failed to import customer')
            }
        })
    } catch (err) {
        console.error('Error importing customer:', err)
        errorFromError(err, 'Failed to import customer')
    } finally {
        importingCustomerId.value = null
    }
}

const getImportResultMessage = (result: SyncResult, baseMessage: string): string => {
    const parts: string[] = []
    if (result.created > 0) parts.push(`${result.created} created`)
    if (result.updated > 0) parts.push(`${result.updated} updated`)
    if (result.skipped > 0) parts.push(`${result.skipped} skipped`)
    if (result.errors.length > 0) parts.push(`${result.errors.length} errors`)

    return parts.length > 0 ? `${baseMessage}: ${parts.join(', ')}` : baseMessage
}

onMounted(() => {
    fetchCustomersPage(undefined, false) // Initial load, don't append
})
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
