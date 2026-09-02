<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">QuickBooks Category Sync</h1>

                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-card>
                                    <v-card-title>Import from QuickBooks</v-card-title>
                                    <v-card-text>
                                        <p class="text-body-2 mb-4">Import categories from QuickBooks to local database</p>
                                        <v-btn
                                            color="primary"
                                            prepend-icon="mdi-download"
                                            :loading="isCategorySyncing"
                                            @click="handleImport"
                                        >
                                            Import Categories
                                        </v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-col>

                            <v-col cols="12" md="6">
                                <v-card>
                                    <v-card-title>Sync to QuickBooks</v-card-title>
                                    <v-card-text>
                                        <p class="text-body-2 mb-4">Sync local categories to QuickBooks</p>
                                        <v-btn
                                            color="secondary"
                                            prepend-icon="mdi-upload"
                                            :loading="isCategorySyncing"
                                            @click="handleBatchSync"
                                        >
                                            Batch Sync Categories
                                        </v-btn>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>

                        <v-alert v-if="syncStatus.categories.error" type="error" class="mt-4">
                            {{ syncStatus.categories.error }}
                        </v-alert>

                        <v-alert v-if="syncStatus.categories.status === 'success'" type="success" class="mt-4">
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

const { importCategories, batchSyncCategoriesToQB, isCategorySyncing, syncStatus } = useQuickbooks();

const handleImport = async () => {
    try {
        await importCategories();
    } catch (error) {
        console.error('Import error:', error);
    }
};

const handleBatchSync = async () => {
    try {
        await batchSyncCategoriesToQB();
    } catch (error) {
        console.error('Batch sync error:', error);
    }
};
</script>
