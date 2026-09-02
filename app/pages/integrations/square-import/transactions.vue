<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Transactions</h1>
                    <v-btn color="primary" prepend-icon="mdi-download" :loading="loading" @click="fetchData">
                        Fetch from Square
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <v-row class="mb-4">
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="filters.beginTime"
                                    label="Begin Time"
                                    type="datetime-local"
                                    variant="outlined"
                                    density="compact"
                                    hint="Optional - Start date/time"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="filters.endTime"
                                    label="End Time"
                                    type="datetime-local"
                                    variant="outlined"
                                    density="compact"
                                    hint="Optional - End date/time"
                                />
                            </v-col>
                        </v-row>

                        <div v-if="fetchedData.data.length > 0" class="mb-4">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <v-chip color="info" size="small">
                                    Total: {{ fetchedData.pagination.totalFetched }} transactions
                                </v-chip>
                                <div>
                                    <v-btn
                                        size="small"
                                        variant="text"
                                        :disabled="!hasSelectedItems"
                                        @click="clearSelection"
                                    >
                                        Clear Selection
                                    </v-btn>
                                    <v-btn
                                        size="small"
                                        variant="text"
                                        @click="selectAll"
                                    >
                                        {{ allSelected ? 'Deselect All' : 'Select All' }}
                                    </v-btn>
                                </div>
                            </div>

                            <div v-if="hasSelectedItems" class="mb-4">
                                <v-alert type="info" density="compact" class="mb-2">
                                    {{ selectedItems.length }} transaction(s) selected
                                </v-alert>
                                <v-btn
                                    color="success"
                                    prepend-icon="mdi-import"
                                    :loading="importing"
                                    @click="bulkImport"
                                >
                                    Import Selected ({{ selectedItems.length }})
                                </v-btn>
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
                            <template #item.amount_money="{ item }">
                                <span v-if="item.amount_money">
                                    {{ formatCurrency(item.amount_money.amount, item.amount_money.currency) }}
                                </span>
                                <span v-else>-</span>
                            </template>
                            <template #item.status="{ item }">
                                <v-chip size="small" :color="getStatusColor(item.status)">
                                    {{ item.status || '-' }}
                                </v-chip>
                            </template>
                            <template #item.actions="{ item }">
                                <v-btn
                                    size="small"
                                    color="primary"
                                    variant="text"
                                    prepend-icon="mdi-import"
                                    :loading="importing"
                                    @click="importSingle(item)"
                                >
                                    Import
                                </v-btn>
                            </template>
                        </v-data-table>

                        <div v-if="fetchedData.data.length === 0 && !loading" class="text-center py-8">
                            <v-icon size="64" color="grey">mdi-database-off</v-icon>
                            <p class="text-grey mt-4">No data fetched yet. Click "Fetch from Square" to load transactions.</p>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSquareImport } from '~/composables/useSquareImport';
import { useToast } from '~/composables/useToast';
import { TRANSACTION_MESSAGES } from '~/constants/messages.constants';
import { useApiMessage } from '~/composables/useApiMessage';
import type { SquareTransaction } from '~/types/square-import.types';

definePageMeta({
    middleware: ['auth'],
});

const {
    loading,
    importing,
    fetchedData,
    selectedItems,
    hasSelectedItems,
    allSelected,
    selectAll,
    clearSelection,
    squareImportApi,
} = useSquareImport<SquareTransaction>();

const { successFromResponse, errorFromError, success, error, warning } = useToast();
const { getImportResultMessage } = useApiMessage();

const filters = ref({
    beginTime: '',
    endTime: '',
});

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Amount', key: 'amount_money', sortable: false },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Source Type', key: 'source_type', sortable: true },
    { title: 'Location ID', key: 'location_id', sortable: true },
    { title: 'Order ID', key: 'order_id', sortable: true },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    });
    return formatter.format(amount / 100);
};

const getStatusColor = (status?: string) => {
    if (!status) return 'default';
    if (status === 'COMPLETED') return 'success';
    if (status === 'PENDING') return 'warning';
    if (status === 'FAILED') return 'error';
    return 'default';
};

const fetchData = async () => {
    loading.value = true;
    try {
        const params: any = {};
        if (filters.value.beginTime) {
            params.beginTime = new Date(filters.value.beginTime).toISOString();
        }
        if (filters.value.endTime) {
            params.endTime = new Date(filters.value.endTime).toISOString();
        }

        const response = await squareImportApi.searchTransactions(params);
        if (response.success && response.data) {
            fetchedData.value = response.data;
            successFromResponse(response, TRANSACTION_MESSAGES.FETCH_SUCCESS);
        } else {
            errorFromError(response, TRANSACTION_MESSAGES.FETCH_ERROR);
        }
    } catch (err) {
        console.error('Error fetching transactions:', err);
        errorFromError(err, TRANSACTION_MESSAGES.FETCH_ERROR);
    } finally {
        loading.value = false;
    }
};

const bulkImport = async () => {
    if (selectedItems.value.length === 0) return;

    importing.value = true;
    try {
        const response = await squareImportApi.importTransactions(selectedItems.value as SquareTransaction[]);
        if (response.success && response.data) {
            const result = response.data;
            const message = getImportResultMessage(result, TRANSACTION_MESSAGES.IMPORT_SQUARE_SUCCESS);
            if (result.errors.length > 0) {
                warning(message);
            } else {
                success(message);
            }
            if (result.errors.length > 0) {
                console.error('Import errors:', result.errors);
            }
            clearSelection();
            await fetchData();
        } else {
            errorFromError(response, TRANSACTION_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing transactions:', err);
        errorFromError(err, TRANSACTION_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        importing.value = false;
    }
};

const importSingle = async (item: SquareTransaction) => {
    importing.value = true;
    try {
        const response = await squareImportApi.importTransactions([item]);
        if (response.success && response.data) {
            const result = response.data;
            successFromResponse(response, TRANSACTION_MESSAGES.IMPORT_SQUARE_SUCCESS);
            await fetchData();
        } else {
            errorFromError(response, TRANSACTION_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing transaction:', err);
        errorFromError(err, TRANSACTION_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        importing.value = false;
    }
};
</script>
