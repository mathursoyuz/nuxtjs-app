<template>
    <v-dialog :model-value="modelValue" max-width="1250" scrollable @update:model-value="close">
        <v-card v-if="currentOrder">
            <DialogsDialogHeader
                :title="`Order ${currentOrder.orderNumber}`"
                :organisation-name="
                    currentOrder.orderType === 'CUSTOMER_SALE'
                        ? currentOrder.organisation?.name
                        : currentOrder.buyerOrganisation?.name
                "
                :entity-label="
                    currentOrder.orderType === 'CUSTOMER_SALE' ? 'Customer' : 'Order type'
                "
                :entity-name="
                    currentOrder.orderType === 'CUSTOMER_SALE'
                        ? `${currentOrder.customer.firstName} ${currentOrder.customer.lastName}`
                        : 'Procurement'
                "
                @close="close(false)"
            >
                <template #actions>
                    <v-chip color="white" variant="outlined">
                        {{ formatStatus(currentOrder.status) }}
                    </v-chip>
                </template>
            </DialogsDialogHeader>
            <v-divider />
            <v-card-text class="pa-5">
                <v-progress-linear v-if="loading" indeterminate class="mb-4" />

                <v-row>
                    <v-col cols="12" md="4">
                        <v-card variant="outlined" height="100%">
                            <v-card-title>Order parties</v-card-title>
                            <v-card-text v-if="currentOrder.orderType === 'CUSTOMER_SALE'">
                                <div class="text-caption text-medium-emphasis">Organisation</div>
                                <div class="font-weight-medium mb-3">
                                    {{
                                        currentOrder.organisation?.name ||
                                        `Organisation #${currentOrder.organisationId}`
                                    }}
                                </div>
                                <div class="text-caption text-medium-emphasis">Customer</div>
                                <template v-if="currentOrder.customer">
                                    <div class="font-weight-medium">
                                        {{ currentOrder.customer.firstName }}
                                        {{ currentOrder.customer.lastName }}
                                    </div>
                                    <div>{{ currentOrder.customer.email }}</div>
                                    <div>{{ currentOrder.customer.phoneNumber }}</div>
                                </template>
                                <div v-else>Customer #{{ currentOrder.customerId }}</div>
                            </v-card-text>
                            <v-card-text v-else>
                                <div class="text-caption text-medium-emphasis">Seller</div>
                                <div class="font-weight-medium mb-3">
                                    {{
                                        currentOrder.sellerOrganisation?.name ??
                                        'Platform Organisation'
                                    }}
                                </div>
                                <div class="text-caption text-medium-emphasis">Buyer</div>
                                <div class="font-weight-medium">
                                    {{
                                        currentOrder.buyerOrganisation?.name ??
                                        `Organisation #${currentOrder.organisationId}`
                                    }}
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card variant="outlined" height="100%">
                            <v-card-title>Billing details</v-card-title>
                            <v-card-text>
                                <OrderAddressSummary :address="billingAddress" />
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="4">
                        <v-card variant="outlined" height="100%">
                            <v-card-title>
                                {{
                                    currentOrder.orderType === 'CUSTOMER_SALE' &&
                                    currentOrder.shippingMethod === 'PICKUP'
                                        ? 'Pickup details'
                                        : 'Shipping details'
                                }}
                            </v-card-title>
                            <v-card-text v-if="currentOrder.orderType === 'CUSTOMER_SALE'">
                                <v-chip class="mb-3" size="small" variant="tonal">
                                    {{
                                        currentOrder.shippingMethod === 'PICKUP'
                                            ? 'Customer pickup'
                                            : currentOrder.shippingMethod
                                    }}
                                </v-chip>
                                <OrderAddressSummary :address="currentOrder.payment.shipping" />
                            </v-card-text>
                            <v-card-text v-else class="text-medium-emphasis">
                                Destination locations are listed with each order item.
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <v-card class="mt-4" variant="outlined">
                    <v-card-title>Products</v-card-title>
                    <v-table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>SKU</th>
                                <th>Location</th>
                                <th class="text-right">Qty</th>
                                <th class="text-right">Unit price</th>
                                <th class="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in currentOrder.items" :key="item.id">
                                <td>{{ itemName(item) }}</td>
                                <td>{{ itemSku(item) }}</td>
                                <td>Location #{{ itemLocation(item) }}</td>
                                <td class="text-right">{{ item.quantity }}</td>
                                <td class="text-right">{{ money(item.unitPrice) }}</td>
                                <td class="text-right">{{ money(item.totalAmount) }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                    <v-divider />
                    <v-card-text class="d-flex justify-end">
                        <div style="min-width: 300px">
                            <div class="d-flex justify-space-between">
                                <span>Subtotal</span>
                                <span>{{ money(currentOrder.subtotalAmount) }}</span>
                            </div>
                            <div class="d-flex justify-space-between">
                                <span>Tax</span>
                                <span>{{ money(currentOrder.totalTax) }}</span>
                            </div>
                            <div
                                v-if="currentOrder.orderType === 'CUSTOMER_SALE'"
                                class="d-flex justify-space-between"
                            >
                                <span>Shipping</span>
                                <span>{{ money(currentOrder.shippingAmount) }}</span>
                            </div>
                            <v-divider class="my-2" />
                            <div class="d-flex justify-space-between text-h6">
                                <span>Total</span>
                                <span>{{ money(currentOrder.totalAmount) }}</span>
                            </div>
                        </div>
                    </v-card-text>
                </v-card>

                <v-row class="mt-1">
                    <v-col cols="12" md="5">
                        <v-card variant="outlined" height="100%">
                            <v-card-title>Payment details</v-card-title>
                            <v-card-text>
                                <div>Method: Authorize.Net</div>
                                <div>Card ending: {{ paymentLastFour || '—' }}</div>
                                <div>
                                    Payment status: {{ formatStatus(currentOrder.paymentStatus) }}
                                </div>
                                <div v-if="currentOrder.paidAt">
                                    Paid: {{ formatDate(currentOrder.paidAt) }}
                                </div>
                                <v-alert
                                    v-if="currentOrder.lastPaymentError"
                                    type="error"
                                    variant="tonal"
                                    class="mt-3"
                                >
                                    {{ currentOrder.lastPaymentError }}
                                </v-alert>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="7">
                        <v-card variant="outlined">
                            <v-card-title>Payment attempts</v-card-title>
                            <v-table density="compact">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Status</th>
                                        <th>Card</th>
                                        <th>Transaction</th>
                                        <th>Started</th>
                                        <th>Error</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="attempt in currentOrder.attempts" :key="attempt.id">
                                        <td>{{ attempt.attemptNumber }}</td>
                                        <td>{{ formatStatus(attempt.status) }}</td>
                                        <td>{{ attempt.lastFour || '—' }}</td>
                                        <td>{{ attempt.providerTransactionId || '—' }}</td>
                                        <td>{{ formatDate(attempt.startedAt) }}</td>
                                        <td class="text-error">
                                            {{ attempt.errorMessage || '—' }}
                                        </td>
                                    </tr>
                                    <tr v-if="currentOrder.attempts.length === 0">
                                        <td
                                            colspan="6"
                                            class="text-center text-medium-emphasis py-4"
                                        >
                                            No payment attempts.
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card>
                    </v-col>
                </v-row>
                <v-alert v-if="orderNotes" type="info" variant="tonal" class="mt-4">
                    <strong>Order notes:</strong>
                    {{ orderNotes }}
                </v-alert>
                <v-card
                    v-if="
                        currentOrder.orderType === 'CUSTOMER_SALE' && currentOrder.refunds?.length
                    "
                    class="mt-4"
                    variant="outlined"
                >
                    <v-card-title>Refund history</v-card-title>
                    <v-table density="compact">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Method</th>
                                <th>Reason</th>
                                <th>Items</th>
                                <th class="text-right">Shipping</th>
                                <th>Transaction</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="refund in currentOrder.refunds" :key="refund.id">
                                <td>{{ formatDate(refund.createdAt) }}</td>
                                <td>{{ formatStatus(refund.method) }}</td>
                                <td>{{ refund.reason || '—' }}</td>
                                <td>{{ refundItemSummary(refund) }}</td>
                                <td class="text-right">{{ money(refund.shippingAmount) }}</td>
                                <td>{{ refund.providerTransactionId || 'Manual' }}</td>
                                <td class="text-right">{{ money(refund.amount) }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <v-btn
                    prepend-icon="mdi-download"
                    variant="tonal"
                    @click="downloadOrderInvoice(currentOrder)"
                >
                    Download invoice
                </v-btn>
                <v-spacer />
                <v-btn
                    v-if="isEditableSale && canWrite"
                    prepend-icon="mdi-pencil"
                    variant="tonal"
                    @click="showEdit = true"
                >
                    Edit pending order
                </v-btn>
                <v-btn
                    v-if="isCancellableSale && canWrite"
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-cancel"
                    :loading="cancelling"
                    @click="showCancelConfirmation = true"
                >
                    Cancel order
                </v-btn>
                <v-btn
                    v-if="isChargeable && canWrite"
                    color="primary"
                    prepend-icon="mdi-credit-card"
                    :loading="charging"
                    @click="charge"
                >
                    Attempt charge again
                </v-btn>
                <v-btn
                    v-if="isDeliverableSale && canWrite"
                    color="success"
                    prepend-icon="mdi-truck-check"
                    :loading="completing"
                    @click="completeDelivery"
                >
                    Delivery Done
                </v-btn>
                <v-btn
                    v-if="isRefundableSale && canWrite"
                    color="warning"
                    variant="tonal"
                    prepend-icon="mdi-cash-refund"
                    @click="showRefund = true"
                >
                    Refund
                </v-btn>
                <v-btn variant="outlined" @click="close(false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <EditPendingCustomerOrderDialog
        v-if="currentOrder?.orderType === 'CUSTOMER_SALE'"
        v-model="showEdit"
        :order="currentOrder"
        @saved="replaceOrder"
        @charged="replaceOrder"
    />
    <SaleOrderRefundDialog
        v-if="saleOrder"
        v-model="showRefund"
        :order="saleOrder"
        @refunded="replaceOrder"
    />
    <ConfirmDialog
        v-model="showCancelConfirmation"
        title="Cancel this order?"
        message="The order will become view-only and its inventory reservations will be released."
        details="A cancelled order cannot be edited, charged, delivered, or refunded."
        confirm-text="Cancel order"
        confirm-color="error"
        icon="mdi-cancel"
        :loading="cancelling"
        entity-label="Order"
        :entity-name="currentOrder?.orderNumber"
        @cancel="showCancelConfirmation = false"
        @confirm="cancelOrder"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import type {
    CommerceOrder,
    CustomerOrderAddress,
    CustomerOrderItem,
    CustomerOrderRefund,
    CustomerSaleOrder,
    ProcurementOrderItem,
} from '~/types/order.types'
import { downloadOrderInvoice } from '~/utils/order-invoice'
import OrderAddressSummary from '~/components/orders/OrderAddressSummary.vue'
import EditPendingCustomerOrderDialog from '~/components/orders/EditPendingCustomerOrderDialog.vue'
import SaleOrderRefundDialog from '~/components/orders/SaleOrderRefundDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'

const props = defineProps<{ modelValue: boolean; order: CommerceOrder; canWrite?: boolean }>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    updated: [order: CommerceOrder]
}>()
const nuxtApp = useNuxtApp()
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError } = useToast()
const currentOrder = ref<CommerceOrder>({ ...props.order })
const loading = ref(false)
const charging = ref(false)
const showEdit = ref(false)
const showRefund = ref(false)
const showCancelConfirmation = ref(false)
const cancelling = ref(false)
const completing = ref(false)

const isChargeable = computed(() =>
    ['PENDING_PAYMENT', 'PAYMENT_FAILED'].includes(currentOrder.value.status)
)
const isEditableSale = computed(
    () => currentOrder.value.orderType === 'CUSTOMER_SALE' && isChargeable.value
)
const saleOrder = computed<CustomerSaleOrder | null>(() =>
    currentOrder.value.orderType === 'CUSTOMER_SALE' ? currentOrder.value : null
)
const isCancellableSale = computed(
    () => currentOrder.value.orderType === 'CUSTOMER_SALE' && isChargeable.value
)
const isDeliverableSale = computed(
    () =>
        currentOrder.value.orderType === 'CUSTOMER_SALE' &&
        !currentOrder.value.completedAt &&
        ['PAID', 'PARTIALLY_REFUNDED'].includes(currentOrder.value.status)
)
const isRefundableSale = computed(
    () =>
        currentOrder.value.orderType === 'CUSTOMER_SALE' &&
        ['PAID', 'COMPLETED', 'PARTIALLY_REFUNDED'].includes(currentOrder.value.status)
)
const billingAddress = computed<CustomerOrderAddress>(() =>
    currentOrder.value.orderType === 'CUSTOMER_SALE'
        ? currentOrder.value.payment.billing
        : currentOrder.value.billing
)
const paymentLastFour = computed(() =>
    currentOrder.value.orderType === 'CUSTOMER_SALE'
        ? currentOrder.value.payment.lastFour
        : currentOrder.value.billing.lastFour
)
const orderNotes = computed(() =>
    currentOrder.value.orderType === 'CUSTOMER_SALE' ? currentOrder.value.notes : null
)

function close(value: boolean): void {
    emit('update:modelValue', value)
}
function formatStatus(value: string): string {
    return value
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/^./, (letter) => letter.toUpperCase())
}
function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(
        new Date(value)
    )
}
function statusColor(status: string): string {
    if (status === 'PAID' || status === 'COMPLETED') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'CANCELLED') return 'error'
    if (status === 'PARTIALLY_REFUNDED') return 'orange'
    if (status === 'REFUNDED') return 'grey'
    return 'warning'
}
function money(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currentOrder.value.currency,
    }).format(value)
}
function itemName(item: CustomerOrderItem | ProcurementOrderItem): string {
    return currentOrder.value.orderType === 'CUSTOMER_SALE'
        ? (item as CustomerOrderItem).sellerProductName
        : (item as ProcurementOrderItem).buyerProductName
}
function itemSku(item: CustomerOrderItem | ProcurementOrderItem): string {
    return currentOrder.value.orderType === 'CUSTOMER_SALE'
        ? (item as CustomerOrderItem).sellerSku
        : (item as ProcurementOrderItem).buyerSku
}
function itemLocation(item: CustomerOrderItem | ProcurementOrderItem): number {
    return currentOrder.value.orderType === 'CUSTOMER_SALE'
        ? (item as CustomerOrderItem).inventoryLocationId
        : (item as ProcurementOrderItem).destinationLocationId
}
function refundItemSummary(refund: CustomerOrderRefund): string {
    if (refund.items.length === 0) return 'Shipping only'
    const quantity = refund.items.reduce((sum, item) => sum + item.quantity, 0)
    return `${quantity} item${quantity === 1 ? '' : 's'}`
}
function replaceOrder(order: CustomerSaleOrder): void {
    currentOrder.value = { ...order, orderType: 'CUSTOMER_SALE' }
    emit('updated', currentOrder.value)
}
async function loadFresh(): Promise<void> {
    loading.value = true
    try {
        const response =
            props.order.orderType === 'CUSTOMER_SALE'
                ? await orderApi.getCustomerOrder(props.order.id)
                : await orderApi.getProcurementOrder(props.order.id)
        if (response.data) {
            currentOrder.value = {
                ...response.data,
                orderType: props.order.orderType,
            } as CommerceOrder
        }
    } catch (error) {
        errorFromError(error, 'Failed to load complete order details')
    } finally {
        loading.value = false
    }
}
async function charge(): Promise<void> {
    charging.value = true
    try {
        const key = `admin-${currentOrder.value.orderType.toLowerCase()}-charge-${currentOrder.value.id}-${crypto.randomUUID()}`
        const response =
            currentOrder.value.orderType === 'CUSTOMER_SALE'
                ? await orderApi.chargeCustomerOrder(currentOrder.value.id, { idempotencyKey: key })
                : await orderApi.chargeProcurementOrder(currentOrder.value.id, {
                      idempotencyKey: key,
                  })
        if (!response.data) throw new Error(response.message || 'Payment attempt failed')
        currentOrder.value = {
            ...response.data,
            orderType: currentOrder.value.orderType,
        } as CommerceOrder
        successFromResponse(response, 'Payment attempt completed')
        emit('updated', currentOrder.value)
    } catch (error) {
        errorFromError(error, 'Failed to charge order')
    } finally {
        charging.value = false
    }
}
async function completeDelivery(): Promise<void> {
    if (currentOrder.value.orderType !== 'CUSTOMER_SALE') return
    completing.value = true
    try {
        const response = await orderApi.completeCustomerOrder(currentOrder.value.id)
        if (!response.data) throw new Error(response.message || 'Could not complete order')
        replaceOrder(response.data)
        successFromResponse(response, 'Order marked as delivered')
    } catch (error) {
        errorFromError(error, 'Failed to mark delivery done')
    } finally {
        completing.value = false
    }
}
async function cancelOrder(): Promise<void> {
    if (currentOrder.value.orderType !== 'CUSTOMER_SALE') return
    cancelling.value = true
    try {
        const response = await orderApi.cancelCustomerOrder(currentOrder.value.id)
        if (!response.data) throw new Error(response.message || 'Could not cancel order')
        replaceOrder(response.data)
        showCancelConfirmation.value = false
        successFromResponse(response, 'Order cancelled successfully')
    } catch (error) {
        errorFromError(error, 'Failed to cancel order')
    } finally {
        cancelling.value = false
    }
}

watch(
    () => props.modelValue,
    (open) => {
        if (!open) return
        currentOrder.value = { ...props.order }
        void loadFresh()
    },
    { immediate: true }
)
</script>
