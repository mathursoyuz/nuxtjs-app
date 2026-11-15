<template>
    <v-card v-if="refunds.length" class="mt-4" variant="outlined">
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
                <tr v-for="refund in refunds" :key="refund.id">
                    <td>{{ formatOrderDate(refund.createdAt) }}</td>
                    <td>{{ formatOrderStatus(refund.method) }}</td>
                    <td>{{ refund.reason || '—' }}</td>
                    <td>{{ refundItemSummary(refund) }}</td>
                    <td class="text-right">{{ money(refund.shippingAmount) }}</td>
                    <td>{{ refund.providerTransactionId || 'Manual' }}</td>
                    <td class="text-right">{{ money(refund.amount) }}</td>
                </tr>
            </tbody>
        </v-table>
    </v-card>
</template>

<script setup lang="ts">
import type { CustomerOrderRefund } from '~/types/order.types'
import { formatOrderDate, formatOrderStatus } from '~/utils/order-display.util'

const props = defineProps<{ refunds: CustomerOrderRefund[]; currency: string }>()

const money = (value: number): string =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: props.currency }).format(value)

const refundItemSummary = (refund: CustomerOrderRefund): string => {
    if (refund.items.length === 0) return 'Shipping only'
    const quantity = refund.items.reduce((sum, item) => sum + item.quantity, 0)
    return `${quantity} item${quantity === 1 ? '' : 's'}`
}
</script>
