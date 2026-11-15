<template>
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
                <tr v-for="attempt in attempts" :key="attempt.id">
                    <td>{{ attempt.attemptNumber }}</td>
                    <td>{{ formatOrderStatus(attempt.status) }}</td>
                    <td>{{ attempt.lastFour || '—' }}</td>
                    <td>{{ attempt.providerTransactionId || '—' }}</td>
                    <td>{{ formatOrderDate(attempt.startedAt) }}</td>
                    <td class="text-error">{{ attempt.errorMessage || '—' }}</td>
                </tr>
                <tr v-if="attempts.length === 0">
                    <td colspan="6" class="text-center text-medium-emphasis py-4">
                        No payment attempts.
                    </td>
                </tr>
            </tbody>
        </v-table>
    </v-card>
</template>

<script setup lang="ts">
import type { PaymentAttempt } from '~/types/order.types'
import { formatOrderDate, formatOrderStatus } from '~/utils/order-display.util'

defineProps<{ attempts: PaymentAttempt[] }>()
</script>
