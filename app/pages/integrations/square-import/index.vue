<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Square Import</h1>
                <p class="text-body-1 mb-6 text-grey">
                    Import data from Square into your local database. Fetch data from Square, review it, and selectively import items.
                </p>

                <v-row>
                    <v-col v-for="entity in entities" :key="entity.route" cols="12" md="6" lg="4">
                        <v-card :to="entity.route" hover class="h-100">
                            <v-card-title class="d-flex align-center">
                                <v-icon :icon="entity.icon" class="mr-3" size="32" :color="entity.color" />
                                <span>{{ entity.name }}</span>
                            </v-card-title>
                            <v-card-text>
                                <p class="text-body-2 text-grey">{{ entity.description }}</p>
                            </v-card-text>
                            <v-card-actions>
                                <v-btn color="primary" variant="text" :to="entity.route">
                                    Open
                                    <v-icon icon="mdi-arrow-right" class="ml-2" />
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['auth'],
});

const entities = [
    {
        name: 'Categories',
        description: 'Import Square categories into your local database',
        route: '/integrations/square-import/categories',
        icon: 'mdi-tag-multiple',
        color: 'primary',
    },
    {
        name: 'Products',
        description: 'Import Square products with filtering options',
        route: '/integrations/square-import/products',
        icon: 'mdi-package-variant',
        color: 'success',
    },
    {
        name: 'Locations',
        description: 'Import Square locations',
        route: '/integrations/square-import/locations',
        icon: 'mdi-map-marker',
        color: 'info',
    },
    {
        name: 'Transactions',
        description: 'Import Square transactions with date filtering',
        route: '/integrations/square-import/transactions',
        icon: 'mdi-cash-multiple',
        color: 'warning',
    },
    {
        name: 'Vendors',
        description: 'Import Square vendors',
        route: '/integrations/square-import/vendors',
        icon: 'mdi-account-group',
        color: 'purple',
    },
    {
        name: 'Discounts',
        description: 'Import Square discounts and promotions',
        route: '/integrations/square-import/discounts',
        icon: 'mdi-tag-off',
        color: 'orange',
    },
];
</script>
