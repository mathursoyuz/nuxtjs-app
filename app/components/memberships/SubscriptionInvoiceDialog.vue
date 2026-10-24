<template>
    <v-dialog
        :model-value="modelValue"
        max-width="720"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card v-if="order">
            <DialogsDialogHeader
                title="Subscription invoice"
                :entity-label="order.audience === 'CUSTOMER' ? 'Customer' : 'Organisation'"
                :entity-name="order.subscriberName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-text id="subscription-invoice">
                <div class="d-flex justify-space-between mb-6">
                    <div>
                        <div class="text-h6">{{ order.orderId }}</div>
                        <div>{{ new Date(order.createdAt).toLocaleString() }}</div>
                    </div>
                    <v-chip :color="order.status === 'PAID' ? 'success' : 'warning'">
                        {{ order.status }}
                    </v-chip>
                </div>
                <v-list lines="two">
                    <v-list-item
                        title="Subscriber"
                        :subtitle="`${order.subscriberName} · ${order.subscriberEmail}`"
                    />
                    <v-list-item title="Membership / Service" :subtitle="order.membershipName" />
                    <v-list-item
                        title="Billing period"
                        :subtitle="`${formatDate(order.periodStart)} — ${formatDate(order.periodEnd)}`"
                    />
                    <v-list-item
                        title="Price"
                        :subtitle="formatMembershipMoney(order.membershipPriceAmount)"
                    />
                    <v-list-item
                        title="Credit applied"
                        :subtitle="formatMembershipMoney(order.creditDiscountApplied)"
                    />
                    <v-list-item
                        title="Charged"
                        :subtitle="formatMembershipMoney(order.finalAmountCharged)"
                    />
                    <v-list-item
                        title="Refunded"
                        :subtitle="formatMembershipMoney(order.refundedAmount)"
                    />
                </v-list>
            </v-card-text>
            <v-card-actions>
                <v-btn prepend-icon="mdi-printer" @click="printInvoice">Print</v-btn>
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
const formatDate = (value: string | null): string =>
    value ? new Date(value).toLocaleDateString() : 'No expiry'
const printInvoice = (): void => window.print()
</script>
