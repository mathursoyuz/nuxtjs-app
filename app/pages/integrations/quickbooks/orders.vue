<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">QuickBooks Orders (Transactions)</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        @click="refreshData"
                        :loading="loading"
                    >
                        Refresh
                    </v-btn>
                </div>

                <DataTable
                    :headers="headers"
                    :items="transactions"
                    :loading="loading"
                    title="QuickBooks Transactions"
                    searchable
                    search-label="Search transactions..."
                    :selectable="true"
                    :show-actions="false"
                    item-value-key="Id"
                    @search="handleSearch"
                    @selection-change="handleSelectionChange"
                >
                    <template #item.TxnDate="{ item }">
                        {{ formatDateOnly(item.TxnDate) }}
                    </template>
                    <template #item.TotalAmt="{ item }">
                        ${{ item.TotalAmt.toFixed(2) }}
                    </template>
                    <template #bulk-actions>
                        <v-btn
                            color="primary"
                            size="small"
                            prepend-icon="mdi-download"
                            :loading="importing"
                            @click="importSelectedTransactions"
                        >
                            Import selected to local
                        </v-btn>
                    </template>

                    <template #item.importActions="{ item }">
                        <v-btn
                            color="primary"
                            size="small"
                            variant="text"
                            prepend-icon="mdi-download"
                            :loading="importing"
                            @click="importSingleTransaction(item)"
                        >
                            Import / Re-import
                        </v-btn>
                    </template>
                </DataTable>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNuxtApp } from '#app';
import { useLoadingTask } from '~/composables/useLoadingTask';
import { useToast } from '~/composables/useToast';
import { INTEGRATION_MESSAGES, GENERAL_MESSAGES } from '~/constants/messages.constants';
import DataTable from '~/components/data-table/DataTable.vue';
import type { QuickBooksTransaction } from '~/services/api/wrappers/quickbooks.api';
import { formatDateOnly } from '~/utils/date.util';

definePageMeta({
    middleware: ['auth'],
});

const nuxtApp = useNuxtApp();
const { errorFromError, error, info } = useToast();
const quickbooksApi = nuxtApp.$quickbooksApi as import('~/services/api/wrappers/quickbooks.api').QuickBooksApiService;

const transactions = ref<QuickBooksTransaction[]>([]);
const loading = ref(false);
const importing = ref(false);
const selectedTransactions = ref<QuickBooksTransaction[]>([]);

const headers = [
    { title: 'ID', key: 'Id', sortable: true },
    { title: 'Transaction Date', key: 'TxnDate', sortable: true },
    { title: 'Type', key: 'TxnType', sortable: true },
    { title: 'Total Amount', key: 'TotalAmt', sortable: true },
    { title: 'Import', key: 'importActions', sortable: false },
];


const handleSearch = (query: string) => {
    // Optional: organisation-side filter can be implemented here if needed
};

const handleSelectionChange = (selected: unknown[]) => {
    selectedTransactions.value = selected as QuickBooksTransaction[];
};

const fetchTransactions = async () => {
    loading.value = true;
    try {
        const task = useLoadingTask('load-qb-transactions');
        await task.execute(async () => {
            const response = await quickbooksApi.getTransactions();
            if (response.success && response.data) {
                transactions.value = response.data;
            } else {
                errorFromError(response, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
            }
        });
    } catch (err) {
        console.error('Error fetching QuickBooks transactions:', err);
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
    } finally {
        loading.value = false;
    }
};

const refreshData = async () => {
    await fetchTransactions();
};

const importSelectedTransactions = async () => {
    if (selectedTransactions.value.length === 0) {
        error('Please select at least one transaction to import');
        return;
    }

    importing.value = true;
    try {
        const task = useLoadingTask('import-qb-transactions');
        await task.execute(async () => {
            const response = await quickbooksApi.importTransactions();
            info('Transactions import triggered from QuickBooks');
        });
    } catch (err) {
        console.error('Error importing QuickBooks transactions:', err);
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
    } finally {
        importing.value = false;
    }
};

const importSingleTransaction = async (transaction: QuickBooksTransaction) => {
    importing.value = true;
    try {
        const task = useLoadingTask('import-qb-transaction');
        await task.execute(async () => {
            const response = await quickbooksApi.importTransactions();
            info(
                `Transaction ${transaction.Id} import triggered from QuickBooks (full import executed)`
            );
        });
    } catch (err) {
        console.error('Error importing QuickBooks transaction:', err);
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
    } finally {
        importing.value = false;
    }
};

onMounted(() => {
    fetchTransactions();
});
</script>
