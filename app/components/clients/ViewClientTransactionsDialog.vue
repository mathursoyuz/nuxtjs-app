<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1400"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
                <span>Procurement orders — {{ clientName }}</span>
                <v-btn icon="mdi-close" variant="text" @click="close" />
            </v-card-title>
            <v-divider />
            <v-tabs v-model="activeTab" color="primary">
                <v-tab value="all">All</v-tab>
                <v-tab value="paid">Paid</v-tab>
                <v-tab value="pending">Pending</v-tab>
                <v-tab value="failed">Failed</v-tab>
            </v-tabs>
            <v-divider />
            <TransactionList
                :orders="displayedOrders"
                :loading="loading"
                :empty-message="emptyMessage"
            />
            <v-divider />
            <v-card-actions>
                <v-spacer />
                <v-btn variant="outlined" @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import TransactionList from './TransactionList.vue'
import { useProcurementOrders } from '~/composables/useProcurementOrders'

interface Props {
    modelValue: boolean
    clientId: number
    clientName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()
const { ordersForClient, isLoadingClient, fetchProcurementOrders } = useProcurementOrders()
const activeTab = ref<'all' | 'paid' | 'pending' | 'failed'>('all')
const orders = computed(() => ordersForClient(props.clientId))
const loading = computed(() => isLoadingClient(props.clientId))

const displayedOrders = computed(() => {
    if (activeTab.value === 'paid') return orders.value.filter((order) => order.status === 'PAID')
    if (activeTab.value === 'failed') {
        return orders.value.filter((order) => order.status === 'PAYMENT_FAILED')
    }
    if (activeTab.value === 'pending') {
        return orders.value.filter((order) =>
            ['PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAYMENT_HELD'].includes(order.status)
        )
    }
    return orders.value
})

const emptyMessage = computed(() => {
    if (activeTab.value === 'paid') return 'No paid procurement orders found.'
    if (activeTab.value === 'pending') return 'No pending procurement orders found.'
    if (activeTab.value === 'failed') return 'No failed procurement orders found.'
    return 'No procurement orders found.'
})

function close(): void {
    emit('update:modelValue', false)
}

watch(
    () => [props.modelValue, props.clientId] as const,
    ([isOpen, clientId]) => {
        if (!isOpen || clientId <= 0) return
        activeTab.value = 'all'
        void fetchProcurementOrders(clientId, true)
    },
    { immediate: true }
)
</script>
