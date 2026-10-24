<template>
    <v-dialog
        :model-value="modelValue"
        max-width="900"
        persistent
        scrollable
        @update:model-value="close"
    >
        <v-card>
            <DialogsDialogHeader
                :title="`Refund order ${order.orderNumber}`"
                :organisation-name="order.organisation.name"
                entity-label="Customer"
                :entity-name="`${order.customer.firstName} ${order.customer.lastName}`"
                :close-disabled="processing"
                @close="close(false)"
            />
            <v-divider />
            <v-card-text class="pa-5">
                <v-alert v-if="refunds.length" type="info" variant="tonal" class="mb-4">
                    Previously refunded: {{ money(previouslyRefunded) }}
                </v-alert>

                <div class="d-flex align-center mb-2">
                    <v-checkbox
                        v-model="allItemsSelected"
                        label="Select all remaining items"
                        hide-details
                        :disabled="!hasRefundableItems || processing"
                    />
                </div>
                <v-table>
                    <thead>
                        <tr>
                            <th style="width: 56px">Select</th>
                            <th>Item</th>
                            <th>SKU</th>
                            <th class="text-right">Remaining</th>
                            <th style="width: 150px">Refund qty</th>
                            <th class="text-right">Refund</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="line in lines" :key="line.item.id">
                            <td>
                                <v-checkbox-btn
                                    v-model="line.selected"
                                    :disabled="line.remaining === 0 || processing"
                                />
                            </td>
                            <td>{{ line.item.sellerProductName }}</td>
                            <td>{{ line.item.sellerSku }}</td>
                            <td class="text-right">{{ line.remaining }}</td>
                            <td>
                                <v-number-input
                                    v-model="line.quantity"
                                    density="compact"
                                    control-variant="stacked"
                                    hide-details
                                    :min="1"
                                    :max="line.remaining"
                                    :disabled="!line.selected || processing"
                                />
                            </td>
                            <td class="text-right">{{ money(lineRefund(line)) }}</td>
                        </tr>
                    </tbody>
                </v-table>

                <v-card variant="outlined" class="mt-4">
                    <v-card-text class="d-flex flex-wrap align-center ga-4">
                        <v-checkbox
                            v-model="refundShipping"
                            label="Refund remaining shipping"
                            hide-details
                            :disabled="remainingShipping <= 0 || processing"
                        />
                        <v-spacer />
                        <span class="text-body-2">
                            Remaining shipping: {{ money(remainingShipping) }}
                        </span>
                    </v-card-text>
                </v-card>

                <v-textarea
                    v-model="reason"
                    label="Refund reason (optional)"
                    maxlength="500"
                    counter
                    rows="2"
                    class="mt-4"
                    :disabled="processing"
                />

                <div class="d-flex justify-end text-h6 mt-2">
                    Refund total: {{ money(refundTotal) }}
                </div>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <v-btn variant="outlined" :disabled="processing" @click="close(false)">
                    Cancel
                </v-btn>
                <v-spacer />
                <v-btn
                    color="warning"
                    variant="tonal"
                    prepend-icon="mdi-cash-refund"
                    :disabled="!canSubmit"
                    @click="showManualConfirmation = true"
                >
                    Record manual cash refund
                </v-btn>
                <v-btn
                    color="primary"
                    prepend-icon="mdi-credit-card-refund"
                    :loading="processing && !manualProcessing"
                    :disabled="!canSubmit"
                    @click="submit(false)"
                >
                    Refund to card
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <ConfirmDialog
        v-model="showManualConfirmation"
        title="Record manual cash refund?"
        message="This records the refund in the system but does not return money through the payment gateway."
        details="Continue only after the customer has already received the money outside this system, such as in cash."
        confirm-text="Record manual refund"
        confirm-color="warning"
        icon="mdi-cash-alert"
        :loading="manualProcessing"
        @cancel="showManualConfirmation = false"
        @confirm="submit(true)"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import { useToast } from '~/composables/useToast'
import type { CustomerOrderItem, CustomerSaleOrder } from '~/types/order.types'

interface RefundLine {
    item: CustomerOrderItem
    selected: boolean
    quantity: number
    remaining: number
}

const props = defineProps<{ modelValue: boolean; order: CustomerSaleOrder }>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    refunded: [order: CustomerSaleOrder]
}>()
const nuxtApp = useNuxtApp()
const orderApi = nuxtApp.$orderApi as import('~/services/api/wrappers/order.api').OrderApiService
const { successFromResponse, errorFromError } = useToast()
const lines = ref<RefundLine[]>([])
const refundShipping = ref(false)
const reason = ref('')
const processing = ref(false)
const manualProcessing = ref(false)
const showManualConfirmation = ref(false)

const refunds = computed(() => props.order.refunds ?? [])

const previouslyRefunded = computed(() =>
    refunds.value.reduce((sum, refund) => sum + refund.amount, 0)
)
const remainingShipping = computed(() =>
    moneyValue(
        Math.max(
            0,
            props.order.shippingAmount -
                refunds.value.reduce((sum, refund) => sum + refund.shippingAmount, 0)
        )
    )
)
const hasRefundableItems = computed(() => lines.value.some((line) => line.remaining > 0))
const allItemsSelected = computed({
    get: () =>
        hasRefundableItems.value &&
        lines.value.filter((line) => line.remaining > 0).every((line) => line.selected),
    set: (selected: boolean) => {
        for (const line of lines.value) {
            if (line.remaining > 0) line.selected = selected
        }
    },
})
const refundTotal = computed(() =>
    moneyValue(
        lines.value.reduce((sum, line) => sum + lineRefund(line), 0) +
            (refundShipping.value ? remainingShipping.value : 0)
    )
)
const canSubmit = computed(() => refundTotal.value > 0 && !processing.value)

function reset(): void {
    lines.value = props.order.items.map((item) => {
        const refunded = refunds.value
            .flatMap((refund) => refund.items)
            .filter((entry) => entry.orderItemId === item.id)
            .reduce((sum, entry) => sum + entry.quantity, 0)
        return {
            item,
            selected: false,
            quantity: 1,
            remaining: Math.max(0, item.quantity - refunded),
        }
    })
    refundShipping.value = false
    reason.value = ''
    showManualConfirmation.value = false
}
function lineRefund(line: RefundLine): number {
    if (!line.selected || line.remaining === 0) return 0
    const quantity = Math.min(Math.max(Number(line.quantity) || 1, 1), line.remaining)
    return moneyValue(
        ((line.item.totalAmount + line.item.taxAmount) / line.item.quantity) * quantity
    )
}
function close(value: boolean): void {
    if (!processing.value) emit('update:modelValue', value)
}
function moneyValue(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100
}
function money(value: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: props.order.currency,
    }).format(value)
}
async function submit(manual: boolean): Promise<void> {
    processing.value = true
    manualProcessing.value = manual
    try {
        const response = await orderApi.refundCustomerOrder(props.order.id, {
            idempotencyKey: `sale-refund-${props.order.id}-${crypto.randomUUID()}`,
            manual,
            refundShipping: refundShipping.value,
            reason: reason.value.trim() || undefined,
            items: lines.value
                .filter((line) => line.selected && line.remaining > 0)
                .map((line) => ({
                    orderItemId: line.item.id,
                    quantity: Math.min(Math.max(Number(line.quantity) || 1, 1), line.remaining),
                })),
        })
        if (!response.data) throw new Error(response.message || 'Refund failed')
        successFromResponse(
            response,
            manual ? 'Manual refund recorded successfully' : 'Refund completed successfully'
        )
        emit('refunded', response.data)
        showManualConfirmation.value = false
        emit('update:modelValue', false)
    } catch (error) {
        errorFromError(error, manual ? 'Failed to record manual refund' : 'Refund failed')
    } finally {
        processing.value = false
        manualProcessing.value = false
    }
}

watch(
    () => props.modelValue,
    (open) => {
        if (open) reset()
    },
    { immediate: true }
)
</script>
