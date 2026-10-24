<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1400"
        scrollable
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Procurement orders"
                :organisation-name="organisationName"
                entity-label="Organisation"
                :entity-name="organisationName"
                @close="close"
            />
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
    organisationId: number
    organisationName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()
const { ordersForOrganisation, isLoadingOrganisation, fetchProcurementOrders } =
    useProcurementOrders()
const activeTab = ref<'all' | 'paid' | 'pending' | 'failed'>('all')
const orders = computed(() => ordersForOrganisation(props.organisationId))
const loading = computed(() => isLoadingOrganisation(props.organisationId))

const displayedOrders = computed(() => {
    if (activeTab.value === 'paid')
        return orders.value.filter((order) => order.status === 'COMPLETED')
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
    () => [props.modelValue, props.organisationId] as const,
    ([isOpen, organisationId]) => {
        if (!isOpen || organisationId <= 0) return
        activeTab.value = 'all'
        void fetchProcurementOrders(organisationId, true)
    },
    { immediate: true }
)
</script>
