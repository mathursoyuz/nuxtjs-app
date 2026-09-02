<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Square Import - Vendors</h1>
                    <v-btn color="primary" prepend-icon="mdi-download" :loading="loading" @click="fetchData">
                        Fetch from Square
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <div v-if="fetchedData.data.length > 0" class="mb-4">
                            <div class="d-flex align-center justify-space-between mb-2">
                                <v-chip color="info" size="small">
                                    Total: {{ fetchedData.pagination.totalFetched }} vendors
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
                                    {{ selectedItems.length }} vendor(s) selected
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
                            <p class="text-grey mt-4">No data fetched yet. Click "Fetch from Square" to load vendors.</p>
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
import { VENDOR_MESSAGES } from '~/constants/messages.constants';
import { useApiMessage } from '~/composables/useApiMessage';
import type { SquareVendor } from '~/types/square-import.types';

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
} = useSquareImport<SquareVendor>();

const { successFromResponse, errorFromError, success, error, warning } = useToast();
const { getImportResultMessage } = useApiMessage();

const headers = [
    { title: 'ID', key: 'id', sortable: true },
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Created At', key: 'created_at', sortable: true },
    { title: 'Updated At', key: 'updated_at', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const response = await squareImportApi.searchVendors();
        if (response.success && response.data) {
            fetchedData.value = response.data;
            successFromResponse(response, VENDOR_MESSAGES.FETCH_SUCCESS);
        } else {
            errorFromError(response, VENDOR_MESSAGES.FETCH_ERROR);
        }
    } catch (err) {
        console.error('Error fetching vendors:', err);
        errorFromError(err, VENDOR_MESSAGES.FETCH_ERROR);
    } finally {
        loading.value = false;
    }
};

const bulkImport = async () => {
    if (selectedItems.value.length === 0) return;

    importing.value = true;
    try {
        const response = await squareImportApi.importVendors(selectedItems.value as SquareVendor[]);
        if (response.success && response.data) {
            const result = response.data;
            const message = getImportResultMessage(result, VENDOR_MESSAGES.IMPORT_SQUARE_SUCCESS);
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
            errorFromError(response, VENDOR_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing vendors:', err);
        errorFromError(err, VENDOR_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        importing.value = false;
    }
};

const importSingle = async (item: SquareVendor) => {
    importing.value = true;
    try {
        const response = await squareImportApi.importVendors([item]);
        if (response.success && response.data) {
            const result = response.data;
            successFromResponse(response, VENDOR_MESSAGES.IMPORT_SQUARE_SUCCESS);
            await fetchData();
        } else {
            errorFromError(response, VENDOR_MESSAGES.IMPORT_SQUARE_ERROR);
        }
    } catch (err) {
        console.error('Error importing vendor:', err);
        errorFromError(err, VENDOR_MESSAGES.IMPORT_SQUARE_ERROR);
    } finally {
        importing.value = false;
    }
};
</script>
