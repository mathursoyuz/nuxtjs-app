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
                                    v-if="canWrite"
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
                                    v-if="canWrite"
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
import { SHIPSTATION_PERMISSIONS } from '~/constants/integration-permissions.constants'

import { computed, ref } from 'vue'
import { useAccessStore } from '~/stores/access.store'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: SHIPSTATION_PERMISSIONS.READ },
})

const access = useAccessStore()
const canWrite = computed(() => access.can(SHIPSTATION_PERMISSIONS.WRITE))

const shipstation = useShipStation()

const loading = ref(false)

const fetchStores = async () => {
    loading.value = true
    try {
        const response = await shipstation.getStores()
        if (response.success) {
            console.log('Stores:', response.data)
        }
    } catch (error) {
        console.error('Error fetching stores:', error)
    } finally {
        loading.value = false
    }
}

const fetchOrders = async () => {
    loading.value = true
    try {
        const response = await shipstation.getOrders()
        if (response.success) {
            console.log('Orders:', response.data)
        }
    } catch (error) {
        console.error('Error fetching orders:', error)
    } finally {
        loading.value = false
    }
}
</script>
