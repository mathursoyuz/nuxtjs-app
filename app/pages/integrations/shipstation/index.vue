<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">ShipStation Integration</h1>

                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-store"
                                    :loading="loading"
                                    @click="fetchStores"
                                >
                                    Get Stores
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-package-variant"
                                    :loading="loading"
                                    @click="fetchOrders"
                                >
                                    Get Orders
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useNuxtApp } from '#app';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
});

const nuxtApp = useNuxtApp();
const shipstationApi = nuxtApp.$shipstationApi as import('~/services/api/wrappers/shipstation.api').ShipStationApiService;

const loading = ref(false);

const fetchStores = async () => {
    loading.value = true;
    try {
        const response = await shipstationApi.getStores();
        if (response.success) {
            console.log('Stores:', response.data);
        }
    } catch (error) {
        console.error('Error fetching stores:', error);
    } finally {
        loading.value = false;
    }
};

const fetchOrders = async () => {
    loading.value = true;
    try {
        const response = await shipstationApi.getOrders();
        if (response.success) {
            console.log('Orders:', response.data);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    } finally {
        loading.value = false;
    }
};
</script>
