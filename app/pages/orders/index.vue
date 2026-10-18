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
            <v-btn
                v-if="canWriteCustomerOrders"
                color="primary"
                prepend-icon="mdi-plus"
                to="/orders/create"
            >
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
                        <div v-if="item.orderType === 'PROCUREMENT'">
                            <div class="d-flex align-center ga-2">
                                <span>
                                    {{ item.sellerOrganisation?.name || 'Platform Organisation' }}
                                </span>
                                <v-icon icon="tabler-arrow-right" size="16" />
                                <span>
                                    {{
                                        item.buyerOrganisation?.name ||
                                        'Organisation #' + item.organisationId
                                    }}
                                </span>
                            </div>
                            <div class="text-caption text-medium-emphasis">
                                Seller #{{ item.sellerOrganisation?.id ?? '—' }} · Buyer #{{
                                    item.buyerOrganisation?.id ?? item.organisationId
                                }}
                            </div>
                        </div>
                        <div v-else>
                            <div>
                                {{ item.organisation?.name || `Organisation #${item.organisationId}` }}
                            </div>
                            <div class="text-caption">
                                <template v-if="item.customer">
                                    {{ item.customer.firstName }} {{ item.customer.lastName }} ·
                                    {{ item.customer.email }}
                                </template>
                                <template v-else>Customer #{{ item.customerId }}</template>
                            </div>
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
                        <div class="d-flex flex-wrap ga-2">
                            <v-btn
                                size="small"
                                variant="tonal"
                                prepend-icon="mdi-eye"
                                @click="viewOrder(item)"
                            >
                                View transaction
                            </v-btn>
                            <v-btn
                                v-if="isChargeable(item) && canWriteOrder(item)"
                                size="small"
                                color="primary"
                                variant="tonal"
                                :loading="chargingRowKey === item.rowKey"
                                @click="charge(item)"
                            >
                                Charge same order
                            </v-btn>
                            <template
                                v-if="item.orderType === 'CUSTOMER_SALE' && canWriteOrder(item)"
                            >
                                <v-btn
                                    v-if="isDeliverable(item)"
                                    size="small"
                                    color="success"
                                    variant="tonal"
                                    prepend-icon="mdi-truck-check"
                                    :loading="actionRowKey === item.rowKey"
                                    @click="completeDelivery(item)"
                                >
                                    Delivery Done
                                </v-btn>
                                <v-btn
                                    v-if="isCancellable(item)"
                                    size="small"
                                    color="error"
                                    variant="tonal"
                                    prepend-icon="mdi-cancel"
                                    @click="requestCancel(item)"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    v-if="isRefundable(item)"
                                    size="small"
                                    color="warning"
                                    variant="tonal"
                                    prepend-icon="mdi-cash-refund"
                                    @click="requestRefund(item)"
                                >
                                    Refund
                                </v-btn>
                            </template>
                        </div>
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

        <OrderDetailsDialog
            v-if="selectedOrder"
            v-model="showDetails"
            :order="selectedOrder"
            :can-write="canWriteOrder(selectedOrder)"
            @updated="updateOrder"
        />
        <SaleOrderRefundDialog
            v-if="refundOrder"
            v-model="showRefund"
            :order="refundOrder"
            @refunded="updateSaleOrder"
        />
        <ConfirmDialog
            v-if="cancelOrderTarget"
            v-model="showCancelConfirmation"
            title="Cancel this order?"
            message="The order will become view-only and its inventory reservations will be released."
            details="A cancelled order cannot be edited, charged, delivered, or refunded."
            confirm-text="Cancel order"
            confirm-color="error"
            icon="mdi-cancel"
            :loading="cancelling"
            @cancel="closeCancelConfirmation"
            @confirm="cancelSaleOrder"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { CommerceOrder, CustomerSaleOrder, PaymentAttempt } from '~/types/order.types'
import { useAccessStore } from '~/stores/access.store'
import {
    CUSTOMER_ORDER_PERMISSIONS,
    PROCUREMENT_ORDER_PERMISSIONS,
} from '~/components/orders/order.permissions'
import OrderDetailsDialog from '~/components/orders/OrderDetailsDialog.vue'
import SaleOrderRefundDialog from '~/components/orders/SaleOrderRefundDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: {
        anyPermissions: [CUSTOMER_ORDER_PERMISSIONS.READ, PROCUREMENT_ORDER_PERMISSIONS.READ],
        allowCrossOrganisation: true,
    },
})

type OrderRow = CommerceOrder & { rowKey: string }

const nuxtApp = useNuxtApp()
const access = useAccessStore()
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError, error: showError } = useToast()
const orders = ref<OrderRow[]>([])
const tab = ref<'all' | 'pending'>('all')
const loading = ref(false)
const loadingMore = ref(false)
const procurementCursor = ref<number | null>(null)
const customerCursor = ref<number | null>(null)
const chargingRowKey = ref<string | null>(null)
const selectedOrder = ref<OrderRow | null>(null)
const showDetails = ref(false)
const actionRowKey = ref<string | null>(null)
const refundOrder = ref<CustomerSaleOrder | null>(null)
const showRefund = ref(false)
const cancelOrderTarget = ref<OrderRow | null>(null)
const showCancelConfirmation = ref(false)
const cancelling = ref(false)
const canUse = (permission: string) =>
    access.isPlatformContext
        ? access.canAcrossOrganisations(permission) || access.can(permission)
        : access.can(permission)
const canReadProcurementOrders = computed(() => canUse(PROCUREMENT_ORDER_PERMISSIONS.READ))
const canReadCustomerOrders = computed(() => canUse(CUSTOMER_ORDER_PERMISSIONS.READ))
const canWriteCustomerOrders = computed(() => access.can(CUSTOMER_ORDER_PERMISSIONS.WRITE))

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

function isCancellable(order: OrderRow): boolean {
    return order.orderType === 'CUSTOMER_SALE' && isChargeable(order)
}

function isDeliverable(order: OrderRow): boolean {
    return (
        order.orderType === 'CUSTOMER_SALE' &&
        !order.completedAt &&
        ['PAID', 'PARTIALLY_REFUNDED'].includes(order.status)
    )
}

function isRefundable(order: OrderRow): boolean {
    return (
        order.orderType === 'CUSTOMER_SALE' &&
        ['PAID', 'COMPLETED', 'PARTIALLY_REFUNDED'].includes(order.status)
    )
}

function canWriteOrder(order: OrderRow): boolean {
    const permission =
        order.orderType === 'PROCUREMENT'
            ? PROCUREMENT_ORDER_PERMISSIONS.WRITE
            : CUSTOMER_ORDER_PERMISSIONS.WRITE
    return access.can(permission, order.organisationId)
}

function lastAttempt(order: OrderRow): PaymentAttempt | undefined {
    return order.attempts.at(-1)
}

function viewOrder(order: OrderRow): void {
    selectedOrder.value = order
    showDetails.value = true
}

function updateOrder(order: CommerceOrder): void {
    const row: OrderRow = { ...order, rowKey: `${order.orderType}-${order.id}` }
    orders.value = orders.value.map((candidate) =>
        candidate.rowKey === row.rowKey ? row : candidate
    )
    selectedOrder.value = row
}

function updateSaleOrder(order: CustomerSaleOrder): void {
    updateOrder({ ...order, orderType: 'CUSTOMER_SALE' })
    refundOrder.value = order
}

function requestRefund(order: OrderRow): void {
    if (order.orderType !== 'CUSTOMER_SALE') return
    refundOrder.value = order
    showRefund.value = true
}

function requestCancel(order: OrderRow): void {
    cancelOrderTarget.value = order
    showCancelConfirmation.value = true
}

function closeCancelConfirmation(): void {
    showCancelConfirmation.value = false
    cancelOrderTarget.value = null
}

async function completeDelivery(order: OrderRow): Promise<void> {
    if (order.orderType !== 'CUSTOMER_SALE') return
    actionRowKey.value = order.rowKey
    try {
        const response = await orderApi.completeCustomerOrder(order.id)
        if (!response.data) throw new Error(response.message || 'Could not complete order')
        updateSaleOrder(response.data)
        successFromResponse(response, 'Order marked as delivered')
    } catch (error) {
        errorFromError(error, 'Failed to mark delivery done')
    } finally {
        actionRowKey.value = null
    }
}

async function cancelSaleOrder(): Promise<void> {
    const order = cancelOrderTarget.value
    if (!order || order.orderType !== 'CUSTOMER_SALE') return
    cancelling.value = true
    try {
        const response = await orderApi.cancelCustomerOrder(order.id)
        if (!response.data) throw new Error(response.message || 'Could not cancel order')
        updateSaleOrder(response.data)
        closeCancelConfirmation()
        successFromResponse(response, 'Order cancelled successfully')
    } catch (error) {
        errorFromError(error, 'Failed to cancel order')
    } finally {
        cancelling.value = false
    }
}

function formatStatus(value: string): string {
    return value ? value.replaceAll('_', ' ').toLowerCase() : 'not attempted'
}

function statusColor(status: string): string {
    if (status === 'PAID' || status === 'COMPLETED') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'CANCELLED') return 'error'
    if (status === 'PARTIALLY_REFUNDED') return 'orange'
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
            canReadProcurementOrders.value
                ? orderApi.getProcurementOrders({ limit: 100 })
                : Promise.resolve({ data: undefined }),
            canReadCustomerOrders.value
                ? orderApi.getCustomerOrders({ limit: 100 })
                : Promise.resolve({ data: undefined }),
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
        if (response.data?.status === 'PAID' || response.data?.status === 'COMPLETED') {
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
