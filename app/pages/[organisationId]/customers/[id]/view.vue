<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">
                        {{ currentCustomer ? `${currentCustomer.firstName} ${currentCustomer.lastName}` : 'Customer Details' }}
                    </h1>
                    <div class="d-flex gap-2">
                        <v-btn
                            v-if="access.can(CUSTOMER_PERMISSIONS.WRITE, organisationId)"
                            color="primary"
                            prepend-icon="mdi-pencil"
                            @click="navigateTo(`/${organisationId}/customers/${customerId}/edit`)"
                        >
                            Edit
                        </v-btn>
                    </div>
                </div>

                <v-card v-if="currentCustomer">
                    <v-tabs v-model="tab" class="mb-4">
                        <v-tab value="basic">Basic Info</v-tab>
                        <v-tab value="billing">Billing Address</v-tab>
                        <v-tab value="shipping">Shipping Addresses</v-tab>
                        <v-tab value="orders">Orders</v-tab>
                    </v-tabs>

                    <v-window v-model="tab">
                        <v-window-item value="basic">
                            <v-card-text>
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-title>Email</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <a :href="`mailto:${currentCustomer.email}`">{{ currentCustomer.email }}</a>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Phone</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <a :href="`tel:${currentCustomer.phoneNumber}`">{{ currentCustomer.phoneNumber }}</a>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Status</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <v-chip :color="currentCustomer.isActive ? 'success' : 'error'" size="small">
                                                {{ currentCustomer.isActive ? 'Active' : 'Inactive' }}
                                            </v-chip>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>App User</v-list-item-title>
                                        <v-list-item-subtitle>
                                            <v-icon :color="currentCustomer.isAppUser ? 'primary' : 'grey'">
                                                {{ currentCustomer.isAppUser ? 'mdi-check' : 'mdi-close' }}
                                            </v-icon>
                                        </v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-window-item>

                        <v-window-item value="billing">
                            <v-card-text>
                                <v-list>
                                    <v-list-item>
                                        <v-list-item-title>Company</v-list-item-title>
                                        <v-list-item-subtitle>{{ currentCustomer.billingCompany || 'N/A' }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Address</v-list-item-title>
                                        <v-list-item-subtitle>{{ currentCustomer.billingAddress }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>City</v-list-item-title>
                                        <v-list-item-subtitle>{{ currentCustomer.billingCity }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>State</v-list-item-title>
                                        <v-list-item-subtitle>{{ currentCustomer.billingStateCode }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Postal Code</v-list-item-title>
                                        <v-list-item-subtitle>{{ currentCustomer.billing.postalCode }}</v-list-item-subtitle>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title>Country</v-list-item-title>
                                        <v-list-item-subtitle>{{ currentCustomer.billingCountryCode }}</v-list-item-subtitle>
                                    </v-list-item>
                                </v-list>
                            </v-card-text>
                        </v-window-item>

                        <v-window-item value="shipping">
                            <v-card-text>
                                <div v-if="currentCustomer.shipping && currentCustomer.shipping.length > 0">
                                    <v-list>
                                        <v-list-item
                                            v-for="address in currentCustomer.shipping"
                                            :key="address.id"
                                            class="mb-2"
                                        >
                                            <v-list-item-title>{{ address.firstName }} {{ address.lastName }}</v-list-item-title>
                                            <v-list-item-subtitle>
                                                {{ address.address }}, {{ address.city }}, {{ address.stateCode }} {{ address.postalCode }}
                                            </v-list-item-subtitle>
                                            <template #append>
                                                <v-chip :color="address.isActive ? 'success' : 'error'" size="small">
                                                    {{ address.isActive ? 'Active' : 'Inactive' }}
                                                </v-chip>
                                            </template>
                                        </v-list-item>
                                    </v-list>
                                </div>
                                <v-alert v-else type="info">No shipping addresses</v-alert>
                            </v-card-text>
                        </v-window-item>

                        <v-window-item value="orders">
                            <v-card-text>
                                <v-alert type="info">Order history will be displayed here</v-alert>
                            </v-card-text>
                        </v-window-item>
                    </v-window>
                </v-card>

                <v-skeleton-loader v-else type="card" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'

import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCustomer } from '~/composables/useCustomer';

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_PERMISSIONS.READ },
});

const route = useRoute();
const access = useAccessStore();
const organisationId = computed(() => Number(route.params.organisationId));
const customerId = computed(() => Number(route.params.id));

const { currentCustomer, fetchCustomerById } = useCustomer();
const tab = ref('basic');

// Use useLazyAsyncData for initial data fetching
const { pending: customerViewPending } = await useLazyAsyncData(
    'customer-view-initial',
    async () => {
        await fetchCustomerById(organisationId.value, customerId.value);
    }
);
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
