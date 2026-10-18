<template>
    <v-sheet class="pa-6">
        <div v-if="loading" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" />
            <div class="mt-4">Loading procurement orders...</div>
        </div>
        <div v-else-if="orders.length === 0" class="text-center py-8 text-medium-emphasis">
            {{ emptyMessage }}
        </div>
        <v-expansion-panels v-else variant="accordion">
            <v-expansion-panel v-for="order in orders" :key="order.id" class="mb-2">
                <v-expansion-panel-title>
                    <div class="d-flex align-center justify-space-between w-100 pr-4">
                        <div>
                            <div class="font-weight-medium">{{ order.orderNumber }}</div>
                            <div class="text-caption">{{ formatDate(order.createdAt) }}</div>
                        </div>
                        <v-chip :color="statusColor(order.status)" size="small" variant="tonal">
                            {{ formatStatus(order.status) }}
                        </v-chip>
                        <div class="text-h6">{{ money(order.totalAmount, order.currency) }}</div>
                    </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                    <v-row>
                        <v-col cols="12" md="6">
                            <div class="text-subtitle-2 mb-2">Billing snapshot</div>
                            <div>{{ order.billing.firstName }} {{ order.billing.lastName }}</div>
                            <div>{{ order.billing.email }}</div>
                            <div>{{ order.billing.company }}</div>
                            <div>{{ order.billing.address }}</div>
                            <div>
                                {{ order.billing.city }}, {{ order.billing.stateCode }}
                                {{ order.billing.postalCode }}
                            </div>
                        </v-col>
                        <v-col cols="12" md="6">
                            <div class="text-subtitle-2 mb-2">Payment attempts</div>
                            <div v-if="order.attempts.length === 0">No attempts.</div>
                            <div v-for="attempt in order.attempts" :key="attempt.id" class="mb-2">
                                #{{ attempt.attemptNumber }} — {{ formatStatus(attempt.status) }}
                                <div v-if="attempt.errorMessage" class="text-caption text-error">
                                    {{ attempt.errorMessage }}
                                </div>
                            </div>
                            <div v-if="order.lastPaymentError" class="text-caption text-error">
                                {{ order.lastPaymentError }}
                            </div>
                        </v-col>
                    </v-row>
                    <div class="d-flex justify-end mt-3">
                        <v-btn
                            size="small"
                            variant="tonal"
                            prepend-icon="mdi-eye"
                            @click="viewOrder(order)"
                        >
                            View complete order
                        </v-btn>
                    </div>
                    <v-divider class="my-4" />
                    <v-table>
                        <thead>
                            <tr>
                                <th>Organisation product</th>
                                <th>SKU</th>
                                <th>Destination</th>
                                <th>Quantity</th>
                                <th>Unit price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in order.items" :key="item.id">
                                <td>{{ item.buyerProductName }}</td>
                                <td>{{ item.buyerSku }}</td>
                                <td>Location #{{ item.destinationLocationId }}</td>
                                <td>{{ item.quantity }}</td>
                                <td>{{ money(item.unitPrice, order.currency) }}</td>
                                <td>{{ money(item.totalAmount, order.currency) }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-expansion-panel-text>
            </v-expansion-panel>
        </v-expansion-panels>

        <OrderDetailsDialog
            v-if="selectedOrder"
            v-model="showDetails"
            :order="selectedOrder"
            :can-write="canWriteSelectedOrder"
            @updated="updateSelectedOrder"
        />
    </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ProcurementOrder } from '~/types/order.types'
import type { CommerceOrder } from '~/types/order.types'
import { useAccessStore } from '~/stores/access.store'
import { PROCUREMENT_ORDER_PERMISSIONS } from '~/components/orders/order.permissions'

const props = withDefaults(
    defineProps<{
        orders: ProcurementOrder[]
        loading: boolean
        emptyMessage?: string
    }>(),
    {
        emptyMessage: 'No procurement orders found.',
    }
)
const emit = defineEmits<{ updated: [order: ProcurementOrder] }>()
const access = useAccessStore()
const selectedOrder = ref<CommerceOrder | null>(null)
const showDetails = ref(false)
const canWriteSelectedOrder = computed(
    () =>
        selectedOrder.value !== null &&
        access.can(PROCUREMENT_ORDER_PERMISSIONS.WRITE, selectedOrder.value.organisationId)
)

function viewOrder(order: ProcurementOrder): void {
    selectedOrder.value = { ...order, orderType: 'PROCUREMENT' }
    showDetails.value = true
}

function updateSelectedOrder(order: CommerceOrder): void {
    if (order.orderType !== 'PROCUREMENT') return
    selectedOrder.value = order
    emit('updated', order)
}

function formatStatus(value: string): string {
    return value.replaceAll('_', ' ').toLowerCase()
}

function statusColor(status: string): string {
    if (status === 'PAID' || status === 'COMPLETED') return 'success'
    if (status === 'PAYMENT_FAILED') return 'error'
    if (status === 'PENDING_PAYMENT') return 'warning'
    return 'info'
}

function money(value: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value)
}

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}
</script>
