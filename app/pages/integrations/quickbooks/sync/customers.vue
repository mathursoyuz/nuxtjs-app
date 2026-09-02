<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">QuickBooks Customer Sync</h1>

                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card>
                                    <v-card-title>Import from QuickBooks</v-card-title>
                                    <v-card-text>
                                        <p class="text-body-2 mb-4">Import customers from QuickBooks to local database</p>
                                        <v-btn
                                            color="primary"
                                            prepend-icon="mdi-download"
                                            :loading="isCustomerSyncing"
                                            @click="handleImport"
                                        >
                                            Import Customers
                                        </v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-card>
                                    <v-card-title>Sync to QuickBooks</v-card-title>
                                    <v-card-text>
                                        <p class="text-body-2 mb-4">Sync local customers to QuickBooks</p>
                                        <v-btn
                                            color="secondary"
                                            prepend-icon="mdi-upload"
                                            :loading="isCustomerSyncing"
                                            @click="handleBatchSync"
                                        >
                                            Batch Sync Customers
                                        </v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-alert v-if="syncStatus.customers.error" type="error" class="mt-4">
                            {{ syncStatus.customers.error }}
                        </v-alert>

                        <v-alert v-if="syncStatus.customers.status === 'success'" type="success" class="mt-4">
                            Sync completed successfully!
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useQuickbooks } from '~/composables/useQuickbooks';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
});

const { importCustomers, batchSyncCustomersToQB, isCustomerSyncing, syncStatus } = useQuickbooks();

const handleImport = async () => {
    try {
        await importCustomers();
    } catch (error) {
        console.error('Import error:', error);
    }
};

const handleBatchSync = async () => {
    try {
        await batchSyncCustomersToQB();
    } catch (error) {
        console.error('Batch sync error:', error);
    }
};
</script>
