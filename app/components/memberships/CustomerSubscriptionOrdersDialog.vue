<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Subscription orders and transactions"
                entity-label="Customer"
                :entity-name="customerName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-text>
                <v-data-table :headers="headers" :items="orders" :loading="loading">
                    <template #item.finalAmountCharged="{ item }">
                        {{ formatMembershipMoney(item.finalAmountCharged) }}
                    </template>
                    <template #item.refundedAmount="{ item }">
                        {{ formatMembershipMoney(item.refundedAmount) }}
                    </template>
                    <template #item.createdAt="{ item }">
                        {{ new Date(item.createdAt).toLocaleString() }}
                    </template>
                    <template #item.actions="{ item }">
                        <div class="d-flex ga-1">
                            <v-btn
                                v-if="item.membershipPriceAmount > 0"
                                icon="mdi-bank-transfer"
                                size="small"
                                variant="text"
                                title="View transactions"
                                @click="openTransactions(item)"
                            />
                            <v-btn
                                icon="mdi-receipt-text"
                                size="small"
                                variant="text"
                                title="View invoice"
                                @click="openInvoice(item)"
                            />
                            <v-btn
                                v-if="
                                    canRefund &&
                                    ['PAID', 'PARTIALLY_REFUNDED'].includes(item.status)
                                "
                                icon="mdi-cash-refund"
                                size="small"
                                color="error"
                                variant="text"
                                title="Refund or void"
                                @click="openRefund(item)"
                            />
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <SubscriptionOrderTransactionsDialog v-model="transactionsOpen" :order="selected" />
    <SubscriptionInvoiceDialog v-model="invoiceOpen" :order="selected" />
    <SubscriptionRefundDialog
        v-model="refundOpen"
        :organisation-id="organisationId"
        :order="selected"
        @refunded="refresh"
    />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import SubscriptionOrderTransactionsDialog from './SubscriptionOrderTransactionsDialog.vue'
import SubscriptionInvoiceDialog from './SubscriptionInvoiceDialog.vue'
import SubscriptionRefundDialog from './SubscriptionRefundDialog.vue'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipSubscriptionOrder } from '~/types/membership.types'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    customerId: number
    customerName: string
    canRefund: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const manager = useMemberships()
const { errorFromError } = useToast()
const orders = ref<MembershipSubscriptionOrder[]>([])
const selected = ref<MembershipSubscriptionOrder | null>(null)
const loading = ref(false)
const transactionsOpen = ref(false)
const invoiceOpen = ref(false)
const refundOpen = ref(false)
const headers = [
    { title: 'Order', key: 'orderId' },
    { title: 'Membership', key: 'membershipName' },
    { title: 'Membership group', key: 'membershipGroupName' },
    { title: 'Status', key: 'status' },
    { title: 'Charged', key: 'finalAmountCharged' },
    { title: 'Refunded', key: 'refundedAmount' },
    { title: 'Date', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const refresh = async (): Promise<void> => {
    loading.value = true
    try {
        orders.value =
            (await manager.getCustomerMembershipOrders(props.organisationId, props.customerId))
                .data ?? []
    } catch (error) {
        errorFromError(error, 'Unable to load this customer’s subscription orders.')
    } finally {
        loading.value = false
    }
}
const openTransactions = (order: MembershipSubscriptionOrder): void => {
    selected.value = order
    transactionsOpen.value = true
}
const openInvoice = (order: MembershipSubscriptionOrder): void => {
    selected.value = order
    invoiceOpen.value = true
}
const openRefund = (order: MembershipSubscriptionOrder): void => {
    selected.value = order
    refundOpen.value = true
}

watch(
    () => [props.modelValue, props.organisationId, props.customerId] as const,
    ([open]) => {
        if (open) void refresh()
    },
    { immediate: true }
)
</script>
