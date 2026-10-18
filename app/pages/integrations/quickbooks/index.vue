<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">QuickBooks Integration</h1>

                <v-card class="mb-4">
                    <v-card-title>Connection Status</v-card-title>
                    <v-card-text>
                        <v-alert :type="isConnected ? 'success' : 'warning'" class="mb-4">
                            {{ isConnected ? 'Connected to QuickBooks' : 'Not connected to QuickBooks' }}
                        </v-alert>
                        <v-btn
                            v-if="!isConnected"
                            color="primary"
                            prepend-icon="mdi-link"
                            @click="initiateAuth"
                        >
                            Connect to QuickBooks
                        </v-btn>
                        <v-btn
                            v-else
                            color="error"
                            prepend-icon="mdi-link-off"
                            @click="disconnect"
                        >
                            Disconnect
                        </v-btn>
                    </v-card-text>
                </v-card>

                <v-row>
                    <v-col cols="12" md="6">
                        <v-card>
                            <v-card-title>Categories</v-card-title>
                            <v-card-text>
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-download"
                                    :loading="isCategorySyncing"
                                    class="mb-2"
                                    block
                                    @click="navigateTo('/integrations/quickbooks/sync/categories')"
                                >
                                    Manage Category Sync
                                </v-btn>
                                <v-chip :color="getStatusColor(syncStatus.categories.status)" size="small">
                                    {{ syncStatus.categories.status }}
                                </v-chip>
                                <div v-if="syncStatus.categories.lastSync" class="text-caption mt-2">
                                    Last sync: {{ formatDate(syncStatus.categories.lastSync) }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-card>
                            <v-card-title>Products</v-card-title>
                            <v-card-text>
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-download"
                                    :loading="isProductSyncing"
                                    class="mb-2"
                                    block
                                    @click="navigateTo('/integrations/quickbooks/sync/products')"
                                >
                                    Manage Product Sync
                                </v-btn>
                                <v-chip :color="getStatusColor(syncStatus.products.status)" size="small">
                                    {{ syncStatus.products.status }}
                                </v-chip>
                                <div v-if="syncStatus.products.lastSync" class="text-caption mt-2">
                                    Last sync: {{ formatDate(syncStatus.products.lastSync) }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-card>
                            <v-card-title>Customers</v-card-title>
                            <v-card-text>
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-download"
                                    :loading="isCustomerSyncing"
                                    class="mb-2"
                                    block
                                    @click="navigateTo('/integrations/quickbooks/sync/customers')"
                                >
                                    Manage Customer Sync
                                </v-btn>
                                <v-chip :color="getStatusColor(syncStatus.customers.status)" size="small">
                                    {{ syncStatus.customers.status }}
                                </v-chip>
                                <div v-if="syncStatus.customers.lastSync" class="text-caption mt-2">
                                    Last sync: {{ formatDate(syncStatus.customers.lastSync) }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-card>
                            <v-card-title>Transactions</v-card-title>
                            <v-card-text>
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-download"
                                    :loading="isTransactionSyncing"
                                    class="mb-2"
                                    block
                                    @click="navigateTo('/integrations/quickbooks/sync/transactions')"
                                >
                                    Manage Transaction Sync
                                </v-btn>
                                <v-chip :color="getStatusColor(syncStatus.transactions.status)" size="small">
                                    {{ syncStatus.transactions.status }}
                                </v-chip>
                                <div v-if="syncStatus.transactions.lastSync" class="text-caption mt-2">
                                    Last sync: {{ formatDate(syncStatus.transactions.lastSync) }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { SYSTEM_ROLE } from '~/constants/access.constants'

import { computed } from 'vue';
import { useQuickbooks } from '~/composables/useQuickbooks';
import { formatDate } from '~/utils/date.util';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: [SYSTEM_ROLE.PLATFORM_ADMIN],
});

const { isConnected, syncStatus, isCategorySyncing, isProductSyncing, isCustomerSyncing, isTransactionSyncing, initiateAuth } = useQuickbooks();

const disconnect = () => {
    // Implement disconnect logic
    console.log('Disconnect QuickBooks');
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'success':
            return 'success';
        case 'error':
            return 'error';
        case 'syncing':
            return 'primary';
        default:
            return 'grey';
    }
};
</script>
