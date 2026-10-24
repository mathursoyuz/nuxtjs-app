<template>
    <v-dialog
        :model-value="modelValue"
        max-width="900"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Subscription transactions"
                :entity-label="order?.audience === 'CUSTOMER' ? 'Customer' : 'Organisation'"
                :entity-name="order?.subscriberName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-subtitle>{{ order?.orderId }}</v-card-subtitle>
            <v-card-text>
                <v-data-table :headers="headers" :items="order?.paymentAttempts ?? []">
                    <template #item.amount="{ item }">
                        {{ formatMembershipMoney(item.amount) }}
                    </template>
                    <template #item.createdAt="{ item }">
                        {{ new Date(item.createdAt).toLocaleString() }}
                    </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipSubscriptionOrder } from '~/types/membership.types'
defineProps<{ modelValue: boolean; order: MembershipSubscriptionOrder | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const headers = [
    { title: 'Operation', key: 'operation' },
    { title: 'Status', key: 'status' },
    { title: 'Amount', key: 'amount' },
    { title: 'Provider transaction', key: 'providerTransactionId' },
    { title: 'Card', key: 'lastFour' },
    { title: 'Date', key: 'createdAt' },
]
</script>
