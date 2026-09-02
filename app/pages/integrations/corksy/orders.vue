<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Corksy Orders</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        @click="refreshOrders"
                        :loading="loading"
                    >
                        Refresh
                    </v-btn>
                </div>

                <v-card>
                    <v-card-text>
                        <v-row class="mb-4">
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="selectedBrandSlug"
                                    :items="brandOptions"
                                    item-title="label"
                                    item-value="value"
                                    label="Filter by Brand"
                                    clearable
                                    density="compact"
                                    @update:model-value="handleBrandChange"
                                />
                            </v-col>
                        </v-row>

                        <DataTable
                            v-if="orders.length > 0"
                            :headers="headers"
                            :items="orders"
                            :loading="loading"
                            title="Corksy Orders"
                            searchable
                            search-label="Search orders..."
                            :show-actions="false"
                            @search="handleSearch"
                        >
                            <template
                                v-for="(header, index) in headers"
                                :key="index"
                                #[`item.${header.key}`]="{ item }"
                            >
                                <span>{{ formatValue(item[header.key]) }}</span>
                            </template>
                        </DataTable>

                        <v-alert v-else-if="!loading" type="info">No orders found.</v-alert>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { useToast } from '~/composables/useToast'
import DataTable from '~/components/data-table/DataTable.vue'
import type { CorksyOrder, CorksyConfig } from '~/services/api/wrappers/corksy.api'

definePageMeta({
    middleware: ['auth'],
})

const nuxtApp = useNuxtApp()
const { errorFromError } = useToast()
const corksyApi =
    nuxtApp.$corksyApi as import('~/services/api/wrappers/corksy.api').CorksyApiService

const orders = ref<CorksyOrder[]>([])
const loading = ref(false)
const searchQuery = ref('')
const brandOptions = ref<{ label: string; value: string }[]>([])
const selectedBrandSlug = ref<string | null>(null)

// Dynamic headers based on order data structure
const headers = ref<Array<{ title: string; key: string; sortable?: boolean }>>([])

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
}

const handleSearch = (query: string) => {
    searchQuery.value = query
    // Implement search logic
}

const buildHeadersFromOrders = () => {
    if (!orders.value || orders.value.length === 0) {
        headers.value = []
        return
    }
    const [firstOrder] = orders.value
    if (!firstOrder) {
        headers.value = []
        return
    }
    headers.value = Object.keys(firstOrder as Record<string, unknown>).map((key) => ({
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
        key,
        sortable: true,
    }))
}

const fetchOrders = async () => {
    loading.value = true
    try {
        const task = useLoadingTask('load-corksy-orders')
        await task.execute(async () => {
            const response = await corksyApi.listStoredOrders(selectedBrandSlug.value ?? undefined)
            if (response.success && response.data) {
                orders.value = response.data
                buildHeadersFromOrders()
            } else {
                errorFromError(response, 'Failed to fetch Corksy orders')
            }
        })
    } catch (err) {
        console.error('Error fetching Corksy orders:', err)
        errorFromError(err, 'Failed to fetch Corksy orders')
    } finally {
        loading.value = false
    }
}

const fetchConfigs = async () => {
    try {
        const response = await corksyApi.listConfigs()
        if (response.success && response.data) {
            brandOptions.value = response.data.map((cfg: CorksyConfig) => ({
                label: cfg.brandName,
                value: cfg.brandSlug,
            }))
        }
    } catch (err) {
        console.error('Error fetching Corksy configs:', err)
        // Non-blocking for orders list
    }
}

const refreshOrders = async () => {
    await fetchOrders()
}

const handleBrandChange = () => {
    fetchOrders()
}

const { pending: productsPending } = await useLazyAsyncData('corksy:orders:initial', async () => {
    await Promise.all([fetchConfigs(), fetchOrders()])
    return null
})
</script>
