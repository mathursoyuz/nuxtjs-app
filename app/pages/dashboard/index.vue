<template>
    <v-container fluid>
        <h1 class="text-h4 mb-4">Dashboard</h1>
        <p class="text-body-1 mb-6">Welcome, {{ user?.firstName }}!</p>

        <v-row>
            <v-col cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="primary" class="mr-4">mdi-package-variant</v-icon>
                            <div>
                                <div class="text-h6">{{ productCount }}</div>
                                <div class="text-caption">Products</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="secondary" class="mr-4">mdi-folder</v-icon>
                            <div>
                                <div class="text-h6">{{ categoryCount }}</div>
                                <div class="text-caption">Categories</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="success" class="mr-4">mdi-account-group</v-icon>
                            <div>
                                <div class="text-h6">{{ customerCount }}</div>
                                <div class="text-caption">Customers</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="warning" class="mr-4">mdi-office-building</v-icon>
                            <div>
                                <div class="text-h6">{{ clientCount }}</div>
                                <div class="text-caption">Clients</div>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <v-row class="mt-4">
            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title>Quick Actions</v-card-title>
                    <v-card-text>
                        <v-list>
                            <RoleGuard roles="admin">
                                <v-list-item prepend-icon="mdi-plus" title="Create Product" :to="'/products'" />
                            </RoleGuard>
                            <RoleGuard roles="admin">
                                <v-list-item prepend-icon="mdi-plus" title="Create Category" :to="'/categories'" />
                            </RoleGuard>
                            <RoleGuard roles="admin">
                                <v-list-item prepend-icon="mdi-plus" title="Create Client" :to="'/clients'" />
                            </RoleGuard>
                            <RoleGuard roles="admin">
                                <v-list-item prepend-icon="mdi-link" title="QuickBooks Sync" :to="'/integrations/quickbooks'" />
                            </RoleGuard>
                        </v-list>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" md="6">
                <v-card>
                    <v-card-title>Recent Activity</v-card-title>
                    <v-card-text>
                        <v-alert type="info">Recent activity will be displayed here</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';
import { useProduct } from '~/composables/useProduct';
import { useCategory } from '~/composables/useCategory';
import { useClient } from '~/composables/useClient';
import { useCustomer } from '~/composables/useCustomer';
import RoleGuard from '~/components/guards/RoleGuard.vue';

definePageMeta({
    middleware: ['auth'],
});

const { user } = useAuth();
const { products, fetchProducts } = useProduct();
const { categories, fetchCategories } = useCategory();
const { clients, fetchClients } = useClient();
const { pagination, fetchCustomers } = useCustomer();

const productCount = computed(() => products.value.length);
const categoryCount = computed(() => categories.value.length);
const customerCount = computed(() => pagination.value?.total ?? 0);
const clientCount = computed(() => clients.value.length);

onMounted(async () => {
    await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchClients(),
        fetchCustomers(null, 1, 1),
    ]);
});
</script>
