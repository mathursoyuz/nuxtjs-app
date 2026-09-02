<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">QuickBooks Customers</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        @click="refreshData"
                        :loading="loading"
                    >
                        Refresh
                    </v-btn>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>QuickBooks Customers</span>
                    </v-card-title>
                    <v-card-text>
                        <!-- Search -->
                        <div class="mb-4">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search customers..."
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="compact"
                                clearable
                            />
                        </div>

                        <!-- Bulk Actions -->
                        <div v-if="selectedCustomers.length > 0" class="mb-4">
                            <v-alert type="info" density="compact">
                                {{ selectedCustomers.length }} item(s) selected
                                <template #append>
                                    <v-btn
                                        color="primary"
                                        size="small"
                                        prepend-icon="mdi-download"
                                        :loading="importing"
                                        :disabled="selectedCustomers.length === 0"
                                        @click="importSelectedCustomers"
                                    >
                                        Import Selected ({{ selectedCustomers.length }})
                                    </v-btn>
                                </template>
                            </v-alert>
                        </div>

                        <!-- Data Table -->
                        <v-data-table
                            v-model="selectedItems"
                            :headers="headers"
                            :items="filteredCustomers"
                            :loading="loading"
                            :selectable="true"
                            :show-select="true"
                            item-value="Id"
                            class="elevation-1"
                            @update:model-value="handleSelectionChange"
                        >
                    <template #item.DisplayName="{ item }">
                        {{ item.DisplayName }}
                    </template>
                    <template #item.PrimaryEmailAddr="{ item }">
                        {{ item.PrimaryEmailAddr?.Address || '-' }}
                    </template>
                    <template #item.Active="{ item }">
                        <v-chip :color="item.Active ? 'green' : 'red'" size="small">
                            {{ item.Active ? 'Active' : 'Inactive' }}
                        </v-chip>
                    </template>
                    <template #item.importActions="{ item }">
                        <v-btn
                            color="primary"
                            size="small"
                            variant="text"
                            prepend-icon="mdi-download"
                            :loading="importing"
                            @click="importSingleCustomer(item)"
                        >
                            Import / Re-import
                        </v-btn>
                    </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useNuxtApp } from '#app';
import { useLoadingTask } from '~/composables/useLoadingTask';
import { useToast } from '~/composables/useToast';
import { INTEGRATION_MESSAGES } from '~/constants/messages.constants';
import type { QuickBooksCustomer } from '~/services/api/wrappers/quickbooks.api';

definePageMeta({
    middleware: ['auth'],
});

const nuxtApp = useNuxtApp();
const { successFromResponse, errorFromError, error } = useToast();
const quickbooksApi = nuxtApp.$quickbooksApi as import('~/services/api/wrappers/quickbooks.api').QuickBooksApiService;

const customers = ref<QuickBooksCustomer[]>([]);
const loading = ref(false);
const importing = ref(false);
const selectedCustomers = ref<QuickBooksCustomer[]>([]);
const selectedItems = ref<QuickBooksCustomer[]>([]);
const searchQuery = ref('');

const headers = [
    { title: 'ID', key: 'Id', sortable: true },
    { title: 'Display Name', key: 'DisplayName', sortable: true },
    { title: 'Email', key: 'PrimaryEmailAddr', sortable: true },
    { title: 'Given Name', key: 'GivenName', sortable: true },
    { title: 'Family Name', key: 'FamilyName', sortable: true },
    { title: 'Active', key: 'Active', sortable: true },
    { title: 'Import', key: 'importActions', sortable: false },
];

const filteredCustomers = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return customers.value;
    }

    const query = searchQuery.value.toLowerCase().trim();
    return customers.value.filter((customer) => {
        const displayNameMatch = customer.DisplayName?.toLowerCase().includes(query);
        const emailMatch = customer.PrimaryEmailAddr?.Address?.toLowerCase().includes(query);
        const givenNameMatch = customer.GivenName?.toLowerCase().includes(query);
        const familyNameMatch = customer.FamilyName?.toLowerCase().includes(query);
        const idMatch = customer.Id?.toLowerCase().includes(query);
        return displayNameMatch || emailMatch || givenNameMatch || familyNameMatch || idMatch;
    });
});

const handleSelectionChange = (selected: unknown[]) => {
    selectedCustomers.value = selected as QuickBooksCustomer[];
};

const importSelectedCustomers = async () => {
    if (selectedCustomers.value.length === 0) {
        error('Please select at least one customer to import');
        return;
    }

    importing.value = true;
    try {
        const task = useLoadingTask('import-qb-customers');
        await task.execute(async () => {
            const response = await quickbooksApi.importCustomers();
            successFromResponse(response, 'Customers imported from QuickBooks');
        });
    } catch (err) {
        console.error('Error importing QuickBooks customers:', err);
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
    } finally {
        importing.value = false;
    }
};

const importSingleCustomer = async (customer: QuickBooksCustomer) => {
    importing.value = true;
    try {
        const task = useLoadingTask('import-qb-customer');
        await task.execute(async () => {
            const response = await quickbooksApi.importCustomers();
            successFromResponse(
                response,
                `Customer ${customer.DisplayName} imported from QuickBooks (full import executed)`
            );
        });
    } catch (err) {
        console.error('Error importing QuickBooks customer:', err);
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
    } finally {
        importing.value = false;
    }
};

const fetchCustomers = async () => {
    loading.value = true;
    try {
        const task = useLoadingTask('load-qb-customers');
        await task.execute(async () => {
            const response = await quickbooksApi.getCustomers();
            if (response.success && response.data) {
                customers.value = response.data;
            } else {
                errorFromError(response, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
            }
        });
    } catch (err) {
        console.error('Error fetching QuickBooks customers:', err);
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR);
    } finally {
        loading.value = false;
    }
};

const refreshData = async () => {
    await fetchCustomers();
};

onMounted(() => {
    fetchCustomers();
});
</script>
