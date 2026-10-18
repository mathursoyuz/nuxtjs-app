<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">QuickBooks Transaction Sync</h1>

                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="transactionType"
                                    label="Transaction Type (optional)"
                                    prepend-inner-icon="mdi-filter"
                                    variant="outlined"
                                    class="mb-4"
                                    hint="e.g., Invoice, Payment, SalesReceipt"
                                />
                            </v-col>
                        </v-row>

                        <v-card>
                            <v-card-title>Import from QuickBooks</v-card-title>
                            <v-card-text>
                                <p class="text-body-2 mb-4">Import transactions from QuickBooks to local database</p>
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-download"
                                    :loading="isTransactionSyncing"
                                    @click="handleImport"
                                >
                                    Import Transactions
                                </v-btn>
                            </v-card-text>
                        </v-card>

                        <v-alert v-if="syncStatus.transactions.error" type="error" class="mt-4">
                            {{ syncStatus.transactions.error }}
                        </v-alert>

                        <v-alert v-if="syncStatus.transactions.status === 'success'" type="success" class="mt-4">
                            Sync completed successfully!
                        </v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { SYSTEM_ROLE } from '~/constants/access.constants'

import { ref } from 'vue';
import { useQuickbooks } from '~/composables/useQuickbooks';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: [SYSTEM_ROLE.PLATFORM_ADMIN],
});

const { importTransactions, isTransactionSyncing, syncStatus } = useQuickbooks();
const transactionType = ref('');

const handleImport = async () => {
    try {
        await importTransactions(transactionType.value || undefined);
    } catch (error) {
        console.error('Import error:', error);
    }
};
</script>
