<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Customers</h1>
                    <v-btn
                        v-if="canWrite"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="navigateTo(`/${organisationId}/customers/create`)"
                    >
                        Create Customer
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <DataTable
                            :headers="headers"
                            :items="customers"
                            :loading="loading"
                            title="Customers"
                            searchable
                            search-label="Search customers..."
                            :selectable="canWrite"
                            :can-edit="canWrite"
                            :can-delete="canDelete"
                            :show-actions="true"
                            @search="handleSearch"
                            @edit="handleEdit"
                            @delete="handleDelete"
                        >
                            <template #item.email="{ item }">
                                <a :href="`mailto:${item.email}`">{{ item.email }}</a>
                            </template>

                            <template #item.phoneNumber="{ item }">
                                <a :href="`tel:${item.phoneNumber}`">{{ item.phoneNumber }}</a>
                            </template>

                            <template #item.isActive="{ item }">
                                <v-switch
                                    :disabled="!canWrite"
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="toggleActive(item.id, $event)"
                                />
                            </template>
                        </DataTable>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCustomer } from '~/composables/useCustomer';
import { useAccessStore } from '~/stores/access.store';
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions';
import DataTable from '~/components/data-table/DataTable.vue';
import type { Customer } from '~/services/api/wrappers/customer.api';

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_PERMISSIONS.READ },
});

const route = useRoute();
const organisationId = computed(() => Number(route.params.organisationId));

const { customers, loading, fetchCustomers, deleteCustomer, toggleActive } = useCustomer();
const access = useAccessStore();
const canWrite = computed(() => access.can(CUSTOMER_PERMISSIONS.WRITE, organisationId.value));
const canDelete = computed(() => access.can(CUSTOMER_PERMISSIONS.DELETE, organisationId.value));

const headers = [
    { title: 'Name', key: 'firstName', sortable: true },
    { title: 'Email', key: 'email', sortable: true },
    { title: 'Phone', key: 'phoneNumber', sortable: true },
    { title: 'Active', key: 'isActive', sortable: true },
    { title: 'Actions', key: 'actions', sortable: false },
];

const searchQuery = ref('');

const handleSearch = (query: string) => {
    searchQuery.value = query;
    fetchCustomers(organisationId.value);
};

const handleEdit = (item: Customer) => {
    navigateTo(`/${organisationId.value}/customers/${item.id}/edit`);
};

const handleDelete = async (item: Customer) => {
    if (confirm(`Are you sure you want to delete ${item.firstName} ${item.lastName}?`)) {
        try {
            await deleteCustomer(item.id);
        } catch (error) {
            console.error('Failed to delete customer:', error);
        }
    }
};

// Use useLazyAsyncData for initial data fetching
const { pending: customersPending } = await useLazyAsyncData(
    'customers-initial',
    async () => {
    await fetchCustomers(organisationId.value);
    }
);
</script>
