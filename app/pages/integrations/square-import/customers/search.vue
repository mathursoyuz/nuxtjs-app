<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Search Customers</h1>
                </div>

                <v-card class="mb-4">
                    <v-card-title>Search Filters</v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.email"
                                    label="Email"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.phoneNumber"
                                    label="Phone Number"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.createdAtFrom"
                                    label="Created At (From)"
                                    type="datetime-local"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.createdAtTo"
                                    label="Created At (To)"
                                    type="datetime-local"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.updatedAtFrom"
                                    label="Updated At (From)"
                                    type="datetime-local"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.updatedAtTo"
                                    label="Updated At (To)"
                                    type="datetime-local"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.customAttributeKey"
                                    label="Custom Attribute Key"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                ></v-text-field>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="searchFilters.customAttributeValue"
                                    label="Custom Attribute Value"
                                    variant="outlined"
                                    density="compact"
                                    clearable
                                    :disabled="!searchFilters.customAttributeKey"
                                ></v-text-field>
                            </v-col>
                        </v-row>
                        <div class="d-flex align-center gap-2">
                            <v-btn
                                color="primary"
                                prepend-icon="mdi-magnify"
                                :loading="loading"
                                @click="searchCustomers"
                            >
                                Search
                            </v-btn>
                            <v-btn
                                variant="outlined"
                                prepend-icon="mdi-refresh"
                                @click="clearFilters"
                            >
                                Clear Filters
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>

                <v-card>
                    <v-card-text>
                        <div v-if="fetchedData.data.length > 0" class="mb-4">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <div class="d-flex align-center gap-2">
                                    <v-chip color="info" size="small">
                                        Found: {{ fetchedData.data.length }} customer(s)
                                    </v-chip>
                                    <v-chip
                                        v-if="selectedItems.length > 0"
                                        color="primary"
                                        size="small"
                                    >
                                        Selected: {{ selectedItems.length }} customer(s)
                                    </v-chip>
                                </div>
                                <div>
                                    <v-btn
                                        size="small"
                                        variant="text"
                                        :disabled="!hasSelectedItems"
                                        @click="clearSelection"
                                    >
                                        Clear Selection
                                    </v-btn>
                                </div>
                            </div>

                            <div v-if="hasSelectedItems" class="mb-4">
                                <v-alert type="info" density="compact" class="mb-2">
                                    <div class="d-flex align-center justify-space-between">
                                        <span>
                                            {{ selectedItems.length }} customer(s) selected for
                                            import
                                        </span>
                                        <v-btn
                                            color="success"
                                            prepend-icon="mdi-import"
                                            :loading="importing"
                                            size="small"
                                            @click="bulkImport"
                                        >
                                            Import Selected
                                        </v-btn>
                                    </div>
                                </v-alert>
                            </div>
                        </div>

                        <v-data-table
                            v-model="selectedItems"
                            :headers="headers"
                            :items="fetchedData.data"
                            :loading="loading"
                            item-value="id"
                            show-select
                            class="elevation-1"
                        >
                            <template #item.email_address="{ item }">
                                <span>{{ item.email_address || '-' }}</span>
                            </template>
                            <template #item.phone_number="{ item }">
                                <span>{{ item.phone_number || '-' }}</span>
                            </template>
                            <template #item.name="{ item }">
                                <span>{{ getCustomerName(item) }}</span>
                            </template>
                            <template #item.squareSynced="{ item }">
                                <v-chip
                                    size="small"
                                    :color="
                                        item.localCustomer?.isSquareSynced ? 'success' : 'error'
                                    "
                                >
                                    {{
                                        item.localCustomer?.isSquareSynced ? 'Synced' : 'Not Synced'
                                    }}
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
                                        :loading="syncingSquare[item.id]"
                                        @click="importSingle(item)"
                                    ></v-btn>
                                    <v-btn
                                        icon="mdi-eye"
                                        size="small"
                                        variant="text"
                                        color="info"
                                        @click="viewRawData(item)"
                                    ></v-btn>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Raw Data Dialog -->
        <v-dialog v-model="rawDataDialog" max-width="800px">
            <v-card>
                <DialogsDialogHeader
                    title="Raw Square customer data"
                    entity-label="Customer"
                    :entity-name="selectedRawData ? getCustomerName(selectedRawData) : undefined"
                    @close="rawDataDialog = false"
                />
                <v-card-text>
                    <pre class="raw-json">{{ JSON.stringify(selectedRawData, null, 2) }}</pre>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="rawDataDialog = false">Close</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '~/composables/useToast'
import type { SquareCustomer } from '~/types/square-import.types'
import type { SyncResult } from '~/types/square-import.types'

definePageMeta({
    middleware: ['auth'],
})

const nuxtApp = useNuxtApp()
const squareImportApi =
    nuxtApp.$squareImportApi as import('~/services/api/wrappers/square-import.api').SquareImportApiService

const { success, error, warning, info, successFromResponse, errorFromError } = useToast()

const loading = ref(false)
const importing = ref(false)
const fetchedData = ref<{ data: SquareCustomer[] }>({ data: [] })
const selectedItems = ref<string[]>([])
const rawDataDialog = ref(false)
const selectedRawData = ref<SquareCustomer | null>(null)

const searchFilters = ref({
    email: '',
    phoneNumber: '',
    createdAtFrom: '',
    createdAtTo: '',
    updatedAtFrom: '',
    updatedAtTo: '',
    customAttributeKey: '',
    customAttributeValue: '',
})

// Map to store raw customers by ID for import
const rawCustomersMap = ref<Map<string, SquareCustomer>>(new Map())
// Track sync state for each customer
const syncingSquare = ref<Record<string, boolean>>({})

const viewRawData = (item: SquareCustomer) => {
    selectedRawData.value = item
    rawDataDialog.value = true
}

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Email', key: 'email_address', sortable: true },
    { title: 'Phone', key: 'phone_number', sortable: true },
    { title: 'Square Synced', key: 'squareSynced', sortable: true },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Updated At', key: 'updated_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
]

const hasSelectedItems = computed(() => selectedItems.value.length > 0)

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

const clearSelection = () => {
    selectedItems.value = []
}

const clearFilters = () => {
    searchFilters.value = {
        email: '',
        phoneNumber: '',
        createdAtFrom: '',
        createdAtTo: '',
        updatedAtFrom: '',
        updatedAtTo: '',
        customAttributeKey: '',
        customAttributeValue: '',
    }
    fetchedData.value = { data: [] }
    clearSelection()
}

const getImportResultMessage = (result: SyncResult, baseMessage: string): string => {
    const parts: string[] = []
    if (result.created > 0) parts.push(`${result.created} created`)
    if (result.updated > 0) parts.push(`${result.updated} updated`)
    if (result.skipped > 0) parts.push(`${result.skipped} skipped`)
    if (result.errors.length > 0) parts.push(`${result.errors.length} errors`)

    return parts.length > 0 ? `${baseMessage}: ${parts.join(', ')}` : baseMessage
}

const formatDateTimeForAPI = (dateTime: string): string => {
    if (!dateTime) return ''
    // Convert local datetime to ISO 8601 format
    const date = new Date(dateTime)
    return date.toISOString()
}

const searchCustomers = async () => {
    loading.value = true
    clearSelection()
    try {
        const params: {
            email?: string
            phoneNumber?: string
            createdAtFrom?: string
            createdAtTo?: string
            updatedAtFrom?: string
            updatedAtTo?: string
            customAttributeKey?: string
            customAttributeValue?: string
        } = {}

        if (searchFilters.value.email) params.email = searchFilters.value.email
        if (searchFilters.value.phoneNumber) params.phoneNumber = searchFilters.value.phoneNumber
        if (searchFilters.value.createdAtFrom) {
            params.createdAtFrom = formatDateTimeForAPI(searchFilters.value.createdAtFrom)
        }
        if (searchFilters.value.createdAtTo) {
            params.createdAtTo = formatDateTimeForAPI(searchFilters.value.createdAtTo)
        }
        if (searchFilters.value.updatedAtFrom) {
            params.updatedAtFrom = formatDateTimeForAPI(searchFilters.value.updatedAtFrom)
        }
        if (searchFilters.value.updatedAtTo) {
            params.updatedAtTo = formatDateTimeForAPI(searchFilters.value.updatedAtTo)
        }
        if (searchFilters.value.customAttributeKey) {
            params.customAttributeKey = searchFilters.value.customAttributeKey
            if (searchFilters.value.customAttributeValue) {
                params.customAttributeValue = searchFilters.value.customAttributeValue
            }
        }

        // Only search if at least one filter is provided
        if (Object.keys(params).length === 0) {
            warning('Please provide at least one search filter')
            loading.value = false
            return
        }

        const response = await squareImportApi.searchCustomers(params)

        if (response.success && response.data) {
            const customers = Array.isArray(response.data) ? response.data : []

            // Create a map of customers by ID for easy lookup during import
            rawCustomersMap.value.clear()
            customers.forEach((customer) => {
                if (customer?.id && typeof customer.id === 'string') {
                    rawCustomersMap.value.set(String(customer.id), customer)
                }
            })

            fetchedData.value = {
                data: customers,
            }

            const count = fetchedData.value.data.length
            if (count > 0) {
                success(`Found ${count} customer(s) matching search criteria`)
            } else {
                info('No customers found matching search criteria')
            }
        } else {
            errorFromError(response, 'Failed to search customers')
        }
    } catch (err) {
        console.error('Error searching customers:', err)
        errorFromError(err, 'Failed to search customers')
    } finally {
        loading.value = false
    }
}

const bulkImport = async () => {
    if (selectedItems.value.length === 0) {
        warning('Please select at least one customer to import')
        return
    }

    const selectedCount = selectedItems.value.length
    importing.value = true
    try {
        const rawCustomersToImport: SquareCustomer[] = []
        for (const selectedItem of selectedItems.value) {
            const rawCustomer = rawCustomersMap.value.get(selectedItem)
            if (rawCustomer) {
                rawCustomersToImport.push(rawCustomer)
            }
        }
        const response = await squareImportApi.importCustomers(rawCustomersToImport)

        if (response.success && response.data) {
            const result = response.data.result
            const message = getImportResultMessage(
                result,
                `Successfully imported ${selectedCount} customer(s)`
            )
            if (result.errors.length > 0) {
                warning(message)
            } else {
                success(message)
            }

            if (result.errors.length > 0) {
                console.error('Import errors:', result.errors)
            }

            clearSelection()
            await searchCustomers()
        } else {
            errorFromError(response, 'Failed to import customers')
        }
    } catch (err) {
        console.error('Error importing customers:', err)
        errorFromError(err, 'Failed to import customers')
    } finally {
        importing.value = false
    }
}

const importSingle = async (item: SquareCustomer) => {
    const itemId = String(item.id)
    syncingSquare.value[itemId] = true
    try {
        const rawCustomer = rawCustomersMap.value.get(itemId)
        const customerToImport = rawCustomer || item

        if (!rawCustomer) {
            console.warn(`Raw customer not found for ID: ${itemId}, using enriched customer`)
        }

        const response = await squareImportApi.importCustomers([customerToImport])
        if (response.success && response.data) {
            const result = response.data.result
            const successCount = result.created + result.updated

            if (successCount > 0) {
                success(`Successfully imported customer`)
            } else {
                info('Customer was skipped (may already exist)')
            }

            if (result.errors.length > 0) {
                const firstError = result.errors[0]
                if (firstError) {
                    error(`Import failed: ${firstError.error}`)
                }
            }

            await searchCustomers()
        } else {
            errorFromError(response, 'Failed to import customer')
        }
    } catch (err) {
        console.error('Error importing customer:', err)
        errorFromError(err, 'Failed to import customer')
    } finally {
        syncingSquare.value[itemId] = false
    }
}
</script>

<style scoped>
.raw-json {
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 16px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    overflow-x: auto;
    max-height: 600px;
    overflow-y: auto;
}
</style>
