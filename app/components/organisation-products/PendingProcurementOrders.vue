<template>
    <div class="d-flex justify-end mb-3">
        <v-btn prepend-icon="mdi-refresh" variant="tonal" :loading="loading" @click="emit('refresh')">
            Refresh
        </v-btn>
    </div>
    <v-data-table :headers="headers" :items="orders" :loading="loading" item-value="id">
        <template #item.orderNumber="{ item }">#{{ item.orderNumber }}</template>
        <template #item.parties="{ item }">
            <div class="d-flex align-center ga-2">
                <span>{{ item.sellerOrganisation?.name || 'Platform Organisation' }}</span>
                <v-icon icon="tabler-arrow-right" size="16" />
                <span>{{ item.buyerOrganisation?.name || 'Organisation #' + item.organisationId }}</span>
            </div>
        </template>
        <template #item.status="{ item }">
            <v-chip :color="statusColor(item.status)" size="small">
                {{ formatStatus(item.status) }}
            </v-chip>
        </template>
        <template #item.totalAmount="{ item }">{{ money(item.totalAmount) }}</template>
        <template #item.items="{ item }">
            {{ item.items.reduce((total, line) => total + line.quantity, 0) }}
        </template>
        <template #item.lastAttempt="{ item }">
            <div v-if="lastAttempt(item)">
                <div>{{ formatStatus(lastAttempt(item)?.status ?? '') }}</div>
                <div class="text-caption text-error">
                    {{ item.lastPaymentError || lastAttempt(item)?.errorMessage || '—' }}
                </div>
            </div>
            <span v-else>Not attempted</span>
        </template>
        <template #item.createdAt="{ item }">{{ formatDate(item.createdAt) }}</template>
        <template #item.actions="{ item }">
            <div class="d-flex ga-2 flex-wrap">
                <v-btn size="small" variant="tonal" prepend-icon="mdi-eye" @click="emit('view', item)">
                    View details
                </v-btn>
                <v-btn
                    color="primary"
                    size="small"
                    prepend-icon="mdi-credit-card-refresh"
                    :disabled="!isChargeable(item)"
                    :loading="processingOrderId === item.id"
                    @click="emit('charge', item)"
                >
                    Charge order
                </v-btn>
            </div>
        </template>
        <template #no-data>
            <div class="text-center pa-8 text-medium-emphasis">No pending procurement orders.</div>
        </template>
    </v-data-table>
</template>

<script setup lang="ts">
import type { PaymentAttempt, ProcurementOrder } from '~/types/order.types'

defineProps<{
    orders: ProcurementOrder[]
    loading: boolean
    processingOrderId: number | null
}>()

const emit = defineEmits<{
    refresh: []
    view: [order: ProcurementOrder]
    charge: [order: ProcurementOrder]
}>()

const headers = [
    { title: 'Order', key: 'orderNumber' },
    { title: 'Procurement', key: 'parties', sortable: false },
    { title: 'Status', key: 'status' },
    { title: 'Quantity', key: 'items', sortable: false },
    { title: 'Total', key: 'totalAmount' },
    { title: 'Last attempt', key: 'lastAttempt', sortable: false },
    { title: 'Created', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const money = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatDate = (value: string): string =>
    new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

const formatStatus = (value: string): string => value.replaceAll('_', ' ').toLowerCase()

const statusColor = (status: string): string => {
    if (status === 'PAID' || status === 'COMPLETED') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'PENDING_PAYMENT') return 'warning'
    return 'info'
}

const lastAttempt = (order: ProcurementOrder): PaymentAttempt | undefined => order.attempts.at(-1)

const isChargeable = (order: ProcurementOrder): boolean =>
    order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED'
</script>
