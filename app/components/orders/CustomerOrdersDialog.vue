<template>
    <v-dialog :model-value="modelValue" max-width="1200" scrollable @update:model-value="close">
        <v-card>
            <DialogsDialogHeader
                title="Customer orders"
                entity-label="Customer"
                :entity-name="`${customer.firstName} ${customer.lastName}`"
                @close="close(false)"
            />
            <v-divider />
            <v-tabs v-model="tab" class="px-4">
                <v-tab value="all">All</v-tab>
                <v-tab value="paid">Paid</v-tab>
                <v-tab value="pending">Pending</v-tab>
                <v-tab value="failed">Failed</v-tab>
            </v-tabs>
            <v-card-text class="pa-5">
                <div class="d-flex justify-end mb-3">
                    <v-btn
                        prepend-icon="mdi-refresh"
                        variant="tonal"
                        :loading="loading"
                        @click="load"
                    >
                        Refresh
                    </v-btn>
                </div>
                <v-data-table :headers="headers" :items="filteredOrders" :loading="loading">
                    <template #item.orderNumber="{ item }">#{{ item.orderNumber }}</template>
                    <template #item.status="{ item }">
                        <v-chip :color="statusColor(item.status)" size="small" variant="tonal">
                            {{ formatStatus(item.status) }}
                        </v-chip>
                    </template>
                    <template #item.items="{ item }">
                        {{ item.items.reduce((sum, line) => sum + line.quantity, 0) }}
                    </template>
                    <template #item.totalAmount="{ item }">{{ money(item.totalAmount) }}</template>
                    <template #item.createdAt="{ item }">{{ formatDate(item.createdAt) }}</template>
                    <template #item.actions="{ item }">
                        <div class="d-flex flex-wrap ga-2">
                            <v-btn
                                size="small"
                                variant="tonal"
                                prepend-icon="mdi-eye"
                                @click="viewOrder(item)"
                            >
                                View details
                            </v-btn>
                            <v-btn
                                v-if="canWrite && isDeliverable(item)"
                                size="small"
                                color="success"
                                variant="tonal"
                                prepend-icon="mdi-truck-check"
                                :loading="actionOrderId === item.id"
                                @click="completeDelivery(item)"
                            >
                                Delivery Done
                            </v-btn>
                            <v-btn
                                v-if="canWrite && isCancellable(item)"
                                size="small"
                                color="error"
                                variant="tonal"
                                prepend-icon="mdi-cancel"
                                @click="requestCancel(item)"
                            >
                                Cancel
                            </v-btn>
                            <v-btn
                                v-if="canWrite && isRefundable(item)"
                                size="small"
                                color="warning"
                                variant="tonal"
                                prepend-icon="mdi-cash-refund"
                                @click="requestRefund(item)"
                            >
                                Refund
                            </v-btn>
                        </div>
                    </template>
                    <template #no-data>
                        <div class="pa-8 text-center text-medium-emphasis">
                            No {{ tab === 'all' ? '' : tab }} orders for this customer.
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
    </v-dialog>

    <OrderDetailsDialog
        v-if="selectedOrder"
        v-model="showDetails"
        :order="selectedOrder"
        :can-write="canWrite"
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type { Customer } from '~/services/api/wrappers/customer.api'
import type { CustomerSaleOrder } from '~/types/order.types'
import type { CommerceOrder } from '~/types/order.types'
import { useAccessStore } from '~/stores/access.store'
import { CUSTOMER_ORDER_PERMISSIONS } from './order.permissions'
import SaleOrderRefundDialog from './SaleOrderRefundDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'

const props = defineProps<{ modelValue: boolean; customer: Customer }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const nuxtApp = useNuxtApp()
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError } = useToast()
const access = useAccessStore()
const tab = ref<'all' | 'paid' | 'pending' | 'failed'>('all')
const orders = ref<CustomerSaleOrder[]>([])
const loading = ref(false)
const showDetails = ref(false)
const selectedOrder = ref<CommerceOrder | null>(null)
const actionOrderId = ref<number | null>(null)
const refundOrder = ref<CustomerSaleOrder | null>(null)
const showRefund = ref(false)
const cancelOrderTarget = ref<CustomerSaleOrder | null>(null)
const showCancelConfirmation = ref(false)
const cancelling = ref(false)
const canWrite = computed(() =>
    access.can(CUSTOMER_ORDER_PERMISSIONS.WRITE, props.customer.organisationId)
)

const headers = [
    { title: 'Order', key: 'orderNumber' },
    { title: 'Status', key: 'status' },
    { title: 'Items', key: 'items', sortable: false },
    { title: 'Total', key: 'totalAmount' },
    { title: 'Created', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]
const pendingStatuses = ['PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAYMENT_HELD']
const filteredOrders = computed(() => {
    if (tab.value === 'paid')
        return orders.value.filter((order) =>
            ['PAID', 'COMPLETED', 'PARTIALLY_REFUNDED', 'REFUNDED'].includes(order.status)
        )
    if (tab.value === 'failed')
        return orders.value.filter((order) => order.status === 'PAYMENT_FAILED')
    if (tab.value === 'pending')
        return orders.value.filter((order) => pendingStatuses.includes(order.status))
    return orders.value
})

function close(value: boolean): void {
    emit('update:modelValue', value)
}
function money(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}
function formatStatus(value: string): string {
    return value
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/^./, (letter) => letter.toUpperCase())
}
function statusColor(status: string): string {
    if (status === 'PAID' || status === 'COMPLETED') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'CANCELLED') return 'error'
    if (status === 'PARTIALLY_REFUNDED') return 'orange'
    if (status === 'REFUNDED') return 'grey'
    return 'warning'
}
function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
    )
}
function viewOrder(order: CustomerSaleOrder): void {
    selectedOrder.value = { ...order, orderType: 'CUSTOMER_SALE' }
    showDetails.value = true
}
function updateOrder(order: CommerceOrder): void {
    if (order.orderType !== 'CUSTOMER_SALE') return
    orders.value = orders.value.map((candidate) => (candidate.id === order.id ? order : candidate))
    selectedOrder.value = order
}
function updateSaleOrder(order: CustomerSaleOrder): void {
    updateOrder({ ...order, orderType: 'CUSTOMER_SALE' })
    refundOrder.value = order
}
function isCancellable(order: CustomerSaleOrder): boolean {
    return ['PENDING_PAYMENT', 'PAYMENT_FAILED'].includes(order.status)
}
function isDeliverable(order: CustomerSaleOrder): boolean {
    return !order.completedAt && ['PAID', 'PARTIALLY_REFUNDED'].includes(order.status)
}
function isRefundable(order: CustomerSaleOrder): boolean {
    return ['PAID', 'COMPLETED', 'PARTIALLY_REFUNDED'].includes(order.status)
}
function requestRefund(order: CustomerSaleOrder): void {
    refundOrder.value = order
    showRefund.value = true
}
function requestCancel(order: CustomerSaleOrder): void {
    cancelOrderTarget.value = order
    showCancelConfirmation.value = true
}
function closeCancelConfirmation(): void {
    showCancelConfirmation.value = false
    cancelOrderTarget.value = null
}
async function completeDelivery(order: CustomerSaleOrder): Promise<void> {
    actionOrderId.value = order.id
    try {
        const response = await orderApi.completeCustomerOrder(order.id)
        if (!response.data) throw new Error(response.message || 'Could not complete order')
        updateSaleOrder(response.data)
        successFromResponse(response, 'Order marked as delivered')
    } catch (error) {
        errorFromError(error, 'Failed to mark delivery done')
    } finally {
        actionOrderId.value = null
    }
}
async function cancelSaleOrder(): Promise<void> {
    const order = cancelOrderTarget.value
    if (!order) return
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
async function load(): Promise<void> {
    loading.value = true
    try {
        const response = await orderApi.getCustomerOrders({
            organisationId: props.customer.organisationId,
            customerId: props.customer.id,
            limit: 100,
        })
        orders.value = response.data?.data ?? []
    } catch (error) {
        errorFromError(error, 'Failed to load customer orders')
    } finally {
        loading.value = false
    }
}

watch(
    () => props.modelValue,
    (open) => {
        if (open) void load()
    },
    { immediate: true }
)
</script>
