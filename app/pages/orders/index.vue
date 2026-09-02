<template>
    <v-container fluid>
        <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
            <div>
                <h1 class="text-h4">Orders</h1>
                <div class="text-body-2 text-medium-emphasis">
                    Procurement and customer-sale orders share payment-attempt history and retry the
                    same order.
                </div>
            </div>
            <v-btn color="primary" prepend-icon="mdi-plus" to="/orders/create">
                Create customer order
            </v-btn>
        </div>

        <v-card>
            <v-tabs v-model="tab" color="primary">
                <v-tab value="all">All orders</v-tab>
                <v-tab value="pending">
                    Pending charges
                    <v-chip class="ml-2" size="small">{{ pendingOrders.length }}</v-chip>
                </v-tab>
            </v-tabs>
            <v-divider />

            <v-card-text>
                <v-data-table
                    :headers="headers"
                    :items="displayedOrders"
                    :loading="loading"
                    item-value="rowKey"
                >
                    <template #item.orderType="{ item }">
                        <v-chip
                            size="small"
                            :color="item.orderType === 'PROCUREMENT' ? 'indigo' : 'teal'"
                            variant="tonal"
                        >
                            {{ item.orderType === 'PROCUREMENT' ? 'Procurement' : 'Customer sale' }}
                        </v-chip>
                    </template>
                    <template #item.status="{ item }">
                        <v-chip size="small" :color="statusColor(item.status)" variant="tonal">
                            {{ formatStatus(item.status) }}
                        </v-chip>
                    </template>
                    <template #item.party="{ item }">
                        <div>Client #{{ item.clientId }}</div>
                        <div v-if="item.orderType === 'CUSTOMER_SALE'" class="text-caption">
                            Customer #{{ item.customerId }}
                        </div>
                    </template>
                    <template #item.quantity="{ item }">
                        {{ item.items.reduce((total, line) => total + line.quantity, 0) }}
                    </template>
                    <template #item.totalAmount="{ item }">
                        {{ money(item.totalAmount, item.currency) }}
                    </template>
                    <template #item.attempts="{ item }">
                        {{ item.attempts.length }}
                    </template>
                    <template #item.lastAttempt="{ item }">
                        <div v-if="lastAttempt(item)" class="text-caption">
                            <div>{{ formatStatus(lastAttempt(item)?.status ?? '') }}</div>
                            <div
                                v-if="item.lastPaymentError || lastAttempt(item)?.errorMessage"
                                class="text-error"
                            >
                                {{ item.lastPaymentError || lastAttempt(item)?.errorMessage }}
                            </div>
                        </div>
                        <span v-else>—</span>
                    </template>
                    <template #item.createdAt="{ item }">
                        {{ formatDate(item.createdAt) }}
                    </template>
                    <template #item.actions="{ item }">
                        <v-btn
                            v-if="isChargeable(item)"
                            size="small"
                            color="primary"
                            variant="tonal"
                            :loading="chargingRowKey === item.rowKey"
                            @click="charge(item)"
                        >
                            Charge same order
                        </v-btn>
                    </template>
                    <template #no-data>
                        <div class="pa-8 text-center text-medium-emphasis">No orders found.</div>
                    </template>
                </v-data-table>

                <div v-if="hasMore" class="d-flex justify-center mt-4">
                    <v-btn variant="tonal" :loading="loadingMore" @click="loadMore">
                        Load more
                    </v-btn>
                </div>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { CommerceOrder, PaymentAttempt } from '~/types/order.types'

definePageMeta({ middleware: ['auth'] })

type OrderRow = CommerceOrder & { rowKey: string }

const nuxtApp = useNuxtApp()
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError, error: showError } = useToast()
const orders = ref<OrderRow[]>([])
const tab = ref<'all' | 'pending'>('all')
const loading = ref(false)
const loadingMore = ref(false)
const procurementCursor = ref<number | null>(null)
const customerCursor = ref<number | null>(null)
const chargingRowKey = ref<string | null>(null)

const headers = [
    { title: 'Order', key: 'orderNumber' },
    { title: 'Type', key: 'orderType' },
    { title: 'Party', key: 'party', sortable: false },
    { title: 'Status', key: 'status' },
    { title: 'Quantity', key: 'quantity', sortable: false },
    { title: 'Total', key: 'totalAmount' },
    { title: 'Attempts', key: 'attempts', sortable: false },
    { title: 'Last attempt', key: 'lastAttempt', sortable: false },
    { title: 'Created', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const pendingOrders = computed(() => orders.value.filter(isPending))
const displayedOrders = computed(() =>
    tab.value === 'pending' ? pendingOrders.value : orders.value
)
const hasMore = computed(() => procurementCursor.value !== null || customerCursor.value !== null)

function toRows(
    procurement: Awaited<ReturnType<typeof orderApi.getProcurementOrders>>['data'],
    customer: Awaited<ReturnType<typeof orderApi.getCustomerOrders>>['data']
): OrderRow[] {
    return [
        ...(procurement?.data ?? []).map((order) => ({
            ...order,
            orderType: 'PROCUREMENT' as const,
            rowKey: `PROCUREMENT-${order.id}`,
        })),
        ...(customer?.data ?? []).map((order) => ({
            ...order,
            orderType: 'CUSTOMER_SALE' as const,
            rowKey: `CUSTOMER_SALE-${order.id}`,
        })),
    ].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
}

function isPending(order: OrderRow): boolean {
    return ['PENDING_PAYMENT', 'PAYMENT_FAILED', 'PAYMENT_PROCESSING', 'PAYMENT_HELD'].includes(
        order.status
    )
}

function isChargeable(order: OrderRow): boolean {
    return order.status === 'PENDING_PAYMENT' || order.status === 'PAYMENT_FAILED'
}

function lastAttempt(order: OrderRow): PaymentAttempt | undefined {
    return order.attempts.at(-1)
}

function formatStatus(value: string): string {
    return value ? value.replaceAll('_', ' ').toLowerCase() : 'not attempted'
}

function statusColor(status: string): string {
    if (status === 'PAID') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'PENDING_PAYMENT') return 'warning'
    if (status === 'REFUNDED') return 'grey'
    return 'info'
}

function money(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

function idempotencyKey(order: OrderRow): string {
    return `admin-${order.orderType.toLowerCase()}-charge-${order.id}-${crypto.randomUUID()}`
}

async function loadOrders(): Promise<void> {
    loading.value = true
    try {
        const [procurementResponse, customerResponse] = await Promise.all([
            orderApi.getProcurementOrders({ limit: 100 }),
            orderApi.getCustomerOrders({ limit: 100 }),
        ])
        orders.value = toRows(procurementResponse.data, customerResponse.data)
        procurementCursor.value = procurementResponse.data?.nextCursor ?? null
        customerCursor.value = customerResponse.data?.nextCursor ?? null
    } catch (error) {
        errorFromError(error, 'Failed to load orders')
    } finally {
        loading.value = false
    }
}

async function loadMore(): Promise<void> {
    loadingMore.value = true
    try {
        const [procurementResponse, customerResponse] = await Promise.all([
            procurementCursor.value
                ? orderApi.getProcurementOrders({ cursor: procurementCursor.value, limit: 100 })
                : Promise.resolve({ data: undefined }),
            customerCursor.value
                ? orderApi.getCustomerOrders({ cursor: customerCursor.value, limit: 100 })
                : Promise.resolve({ data: undefined }),
        ])
        const nextRows = toRows(procurementResponse.data, customerResponse.data)
        orders.value = [...orders.value, ...nextRows].sort(
            (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
        )
        procurementCursor.value = procurementResponse.data?.nextCursor ?? null
        customerCursor.value = customerResponse.data?.nextCursor ?? null
    } catch (error) {
        errorFromError(error, 'Failed to load more orders')
    } finally {
        loadingMore.value = false
    }
}

async function charge(order: OrderRow): Promise<void> {
    chargingRowKey.value = order.rowKey
    try {
        const response =
            order.orderType === 'PROCUREMENT'
                ? await orderApi.chargeProcurementOrder(order.id, {
                      idempotencyKey: idempotencyKey(order),
                  })
                : await orderApi.chargeCustomerOrder(order.id, {
                      idempotencyKey: idempotencyKey(order),
                  })
        if (response.data?.status === 'PAID') {
            successFromResponse(response, 'Order charged successfully')
        } else {
            showError(response.message || 'Charge attempt failed')
        }
        await loadOrders()
    } catch (error) {
        errorFromError(error, 'Failed to charge order')
    } finally {
        chargingRowKey.value = null
    }
}

await useLazyAsyncData('commerce-orders', loadOrders)
</script>
