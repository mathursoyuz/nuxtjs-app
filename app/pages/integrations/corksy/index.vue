<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Corksy Integration</h1>

                <v-card>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="brandSlug"
                                    label="Brand Slug"
                                    prepend-inner-icon="mdi-tag"
                                    variant="outlined"
                                    class="mb-4"
                                />
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-key"
                                    :loading="loading"
                                    :disabled="!brandSlug"
                                    @click="getAccessToken"
                                >
                                    Get Access Token
                                </v-btn>
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-btn
                                    color="primary"
                                    prepend-icon="mdi-package-variant"
                                    :loading="loading"
                                    :disabled="!brandSlug"
                                    @click="getOrders"
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
const corksyApi = nuxtApp.$corksyApi as import('~/services/api/wrappers/corksy.api').CorksyApiService;

const loading = ref(false);
const brandSlug = ref('');

const getAccessToken = async () => {
    if (!brandSlug.value) return;
    loading.value = true;
    try {
        const response = await corksyApi.getAccessToken(brandSlug.value);
        if (response.success) {
            console.log('Access token:', response.data);
        }
    } catch (error) {
        console.error('Error getting access token:', error);
    } finally {
        loading.value = false;
    }
};

const getOrders = async () => {
    if (!brandSlug.value) return;
    loading.value = true;
    try {
        const response = await corksyApi.getOrders(brandSlug.value);
        if (response.success) {
            console.log('Orders:', response.data);
        }
    } catch (error) {
        console.error('Error getting orders:', error);
    } finally {
        loading.value = false;
    }
};
</script>
