<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">QuickBooks Product Sync</h1>

                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card>
                                    <v-card-title>Import from QuickBooks</v-card-title>
                                    <v-card-text>
                                        <p class="text-body-2 mb-4">Import products from QuickBooks to local database</p>
                                        <v-btn
                                            color="primary"
                                            prepend-icon="mdi-download"
                                            :loading="isProductSyncing"
                                            @click="handleImport"
                                        >
                                            Import Products
                                        </v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-card>
                                    <v-card-title>Sync to QuickBooks</v-card-title>
                                    <v-card-text>
                                        <p class="text-body-2 mb-4">Sync local products to QuickBooks</p>
                                        <v-btn
                                            color="secondary"
                                            prepend-icon="mdi-upload"
                                            :loading="isProductSyncing"
                                            @click="handleBatchSync"
                                        >
                                            Batch Sync Products
                                        </v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-alert v-if="syncStatus.products.error" type="error" class="mt-4">
                            {{ syncStatus.products.error }}
                        </v-alert>

                        <v-alert v-if="syncStatus.products.status === 'success'" type="success" class="mt-4">
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

const { importProducts, batchSyncProductsToQB, isProductSyncing, syncStatus } = useQuickbooks();

const handleImport = async () => {
    try {
        await importProducts();
    } catch (error) {
        console.error('Import error:', error);
    }
};

const handleBatchSync = async () => {
    try {
        await batchSyncProductsToQB();
    } catch (error) {
        console.error('Batch sync error:', error);
    }
};
</script>
