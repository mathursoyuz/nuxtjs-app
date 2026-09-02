<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Discounts</h1>
                    <v-btn color="primary" prepend-icon="mdi-download" :loading="loading" @click="fetchData">
                        Fetch from Square
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <div v-if="fetchedData.data.length > 0" class="mb-4">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <v-chip color="info" size="small">
                                    Total: {{ fetchedData.pagination.totalFetched }} discounts
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
                                    {{ selectedItems.length }} discount(s) selected
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
                            <template #item.discount_data.name="{ item }">
                                {{ item.discount_data?.name || '-' }}
                            </template>
                            <template #item.discount_data.discount_type="{ item }">
                                {{ item.discount_data?.discount_type || '-' }}
                            </template>
                            <template #item.discount_data.percentage="{ item }">
                                <span v-if="item.discount_data?.percentage">
                                    {{ item.discount_data.percentage }}%
                                </span>
                                <span v-else>-</span>
                            </template>
                            <template #item.discount_data.amount_money="{ item }">
                                <span v-if="item.discount_data?.amount_money">
                                    {{ formatCurrency(item.discount_data.amount_money.amount, item.discount_data.amount_money.currency) }}
                                </span>
                                <span v-else>-</span>
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
                            <p class="text-grey mt-4">No data fetched yet. Click "Fetch from Square" to load discounts.</p>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useSquareImport } from '~/composables/useSquareImport';
import { useToast } from '~/composables/useToast';
import { DISCOUNT_MESSAGES } from '~/constants/messages.constants';
import { useApiMessage } from '~/composables/useApiMessage';
import type { SquareDiscount } from '~/types/square-import.types';

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
} = useSquareImport<SquareDiscount>();

const { successFromResponse, errorFromError, success, error, warning } = useToast();
const { getImportResultMessage } = useApiMessage();

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'discount_data.name', sortable: true },
    { title: 'Type', key: 'discount_data.discount_type', sortable: true },
    { title: 'Percentage', key: 'discount_data.percentage', sortable: false },
    { title: 'Amount', key: 'discount_data.amount_money', sortable: false },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Updated At', key: 'updated_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
];

const formatCurrency = (amount: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    });
    return formatter.format(amount / 100);
};

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await squareImportApi.searchDiscounts();
        if (response.success && response.data) {
            fetchedData.value = response.data;
            successFromResponse(response, DISCOUNT_MESSAGES.FETCH_SUCCESS);
        } else {
            errorFromError(response, DISCOUNT_MESSAGES.FETCH_ERROR);
        }
    } catch (err) {
        console.error('Error fetching discounts:', err);
        errorFromError(err, DISCOUNT_MESSAGES.FETCH_ERROR);
    } finally {
        loading.value = false;
    }
};

const bulkImport = async () => {
    if (selectedItems.value.length === 0) return;

    importing.value = true;
    try {
        const response = await squareImportApi.importDiscounts(selectedItems.value as SquareDiscount[]);
        if (response.success && response.data) {
            const result = response.data;
            const message = getImportResultMessage(result, DISCOUNT_MESSAGES.IMPORT_SQUARE_SUCCESS);
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
            errorFromError(response, DISCOUNT_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing discounts:', err);
        errorFromError(err, DISCOUNT_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        importing.value = false;
    }
};

const importSingle = async (item: SquareDiscount) => {
    importing.value = true;
    try {
        const response = await squareImportApi.importDiscounts([item]);
        if (response.success && response.data) {
            const result = response.data;
            successFromResponse(response, DISCOUNT_MESSAGES.IMPORT_SQUARE_SUCCESS);
            await fetchData();
        } else {
            errorFromError(response, DISCOUNT_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing discount:', err);
        errorFromError(err, DISCOUNT_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        importing.value = false;
    }
};
</script>
