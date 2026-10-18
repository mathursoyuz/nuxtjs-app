<template>
    <v-container fluid>
        <h1 class="text-h4 mb-4">Dashboard</h1>
        <p class="text-body-1 mb-6">Welcome, {{ user?.firstName }}!</p>

        <v-row>
            <v-col v-if="canReadProducts" cols="12" md="3">
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

            <v-col v-if="canReadCategories" cols="12" md="3">
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

            <v-col v-if="canReadCustomers" cols="12" md="3">
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

            <v-col v-if="canReadOrganisations" cols="12" md="3">
                <v-card>
                    <v-card-text>
                        <div class="d-flex align-center">
                            <v-icon size="48" color="warning" class="mr-4">mdi-office-building</v-icon>
                            <div>
                                <div class="text-h6">{{ organisationCount }}</div>
                                <div class="text-caption">Organisations</div>
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
                            <v-list-item
                                v-if="access.can(PRODUCT_PERMISSIONS.WRITE)"
                                prepend-icon="mdi-plus"
                                title="Create Product"
                                to="/products"
                            />
                            <v-list-item
                                v-if="access.can(CATEGORY_PERMISSIONS.WRITE)"
                                prepend-icon="mdi-plus"
                                title="Create Category"
                                to="/categories"
                            />
                            <v-list-item
                                v-if="access.can(ORGANISATION_PERMISSIONS.WRITE)"
                                prepend-icon="mdi-plus"
                                title="Create Organisation"
                                to="/organisations"
                            />
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
import { useOrganisation } from '~/composables/useOrganisation';
import { useCustomer } from '~/composables/useCustomer';
import { useAccessStore } from '~/stores/access.store';
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions';
import { CATEGORY_PERMISSIONS } from '~/components/categories/category.permissions';
import { ORGANISATION_PERMISSIONS } from '~/components/organisations/organisation.permissions';
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions';

definePageMeta({
    middleware: ['auth'],
});

const { user } = useAuth();
const access = useAccessStore();
const { products, fetchProducts } = useProduct();
const { categories, fetchCategories } = useCategory();
const { organisations, fetchOrganisations } = useOrganisation();
const { pagination, fetchCustomers } = useCustomer();

const productCount = computed(() => products.value.length);
const categoryCount = computed(() => categories.value.length);
const customerCount = computed(() => pagination.value?.total ?? 0);
const organisationCount = computed(() => organisations.value.length);
const canReadProducts = computed(() => access.can(PRODUCT_PERMISSIONS.READ));
const canReadCategories = computed(() => access.can(CATEGORY_PERMISSIONS.READ));
const canReadOrganisations = computed(() => access.can(ORGANISATION_PERMISSIONS.READ));
const canReadCustomers = computed(
    () => access.can(CUSTOMER_PERMISSIONS.READ) || access.canAcrossOrganisations(CUSTOMER_PERMISSIONS.READ)
);

onMounted(async () => {
    await Promise.all([
        canReadProducts.value ? fetchProducts() : Promise.resolve(),
        canReadCategories.value ? fetchCategories() : Promise.resolve(),
        canReadOrganisations.value ? fetchOrganisations() : Promise.resolve(),
        canReadCustomers.value ? fetchCustomers(null, 1, 1) : Promise.resolve(),
    ]);
});
</script>
