<template>
    <v-dialog
        :model-value="modelValue"
        max-width="760"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Refund subscription order"
                :entity-label="order?.audience === 'CUSTOMER' ? 'Customer' : 'Organisation'"
                :entity-name="order?.subscriberName"
                :close-disabled="submitting"
                @close="close"
            />
            <v-card-subtitle>{{ order?.orderId }}</v-card-subtitle>
            <v-card-text>
                <v-progress-linear v-if="loading" indeterminate class="mb-4" />
                <template v-if="preview">
                    <v-row class="mb-4">
                        <v-col cols="6" sm="3">
                            <div class="text-caption">Refundable</div>
                            <strong>{{ money(preview.refundableAmount) }}</strong>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <div class="text-caption">Unused credit</div>
                            <strong>{{ money(preview.unusedCreditAmount) }}</strong>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <div class="text-caption">Consumed</div>
                            <strong>{{ money(preview.consumedAmount) }}</strong>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <div class="text-caption">Full action</div>
                            <strong>{{ preview.fullRefundOperation }}</strong>
                        </v-col>
                    </v-row>
                    <v-radio-group v-model="refundType" inline>
                        <v-card
                            class="mr-3 pa-3 cursor-pointer"
                            :variant="refundType === 'PARTIAL' ? 'tonal' : 'outlined'"
                            @click="refundType = 'PARTIAL'"
                        >
                            <v-radio value="PARTIAL" label="Partial refund" hide-details />
                            <div class="text-caption">
                                Suggested unused credit:
                                {{ money(preview.recommendedRefundAmount) }}
                            </div>
                        </v-card>
                        <v-card
                            class="pa-3 cursor-pointer"
                            :variant="refundType === 'FULL' ? 'tonal' : 'outlined'"
                            @click="refundType = 'FULL'"
                        >
                            <v-radio value="FULL" label="Full refund" hide-details />
                            <div class="text-caption">
                                {{
                                    preview.sameDay
                                        ? 'Voids today’s transaction'
                                        : 'Refunds the remaining balance'
                                }}
                            </div>
                        </v-card>
                    </v-radio-group>
                    <v-text-field
                        v-if="refundType === 'PARTIAL'"
                        v-model.number="amountDollars"
                        type="number"
                        min="0.01"
                        step="0.01"
                        label="Refund amount"
                        prefix="$"
                    />
                    <v-textarea v-model="reason" label="Reason (optional)" />
                </template>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="close">Cancel</v-btn>
                <v-btn color="error" :loading="submitting" :disabled="!preview" @click="submit">
                    Process refund
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipRefundPreview, MembershipSubscriptionOrder } from '~/types/membership.types'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    order: MembershipSubscriptionOrder | null
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; refunded: [] }>()
const manager = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const preview = ref<MembershipRefundPreview | null>(null)
const refundType = ref<'FULL' | 'PARTIAL'>('PARTIAL')
const amountDollars = ref<number>(0)
const reason = ref('')
const loading = ref(false)
const submitting = ref(false)
const money = formatMembershipMoney
const load = async (): Promise<void> => {
    if (!props.order) return
    loading.value = true
    try {
        preview.value =
            (
                await manager.previewSubscriptionRefund(
                    props.order.audience,
                    props.organisationId,
                    props.order.billingCycleId
                )
            ).data ?? null
        amountDollars.value = (preview.value?.recommendedRefundAmount ?? 0) / 100
    } catch (error) {
        errorFromError(error, 'Unable to calculate the refund.')
    } finally {
        loading.value = false
    }
}
const submit = async (): Promise<void> => {
    if (!props.order || !preview.value) return
    submitting.value = true
    try {
        const amount =
            refundType.value === 'PARTIAL'
                ? Math.round(Number(amountDollars.value) * 100)
                : undefined
        const response = await manager.refundSubscriptionOrder(
            props.order.audience,
            props.organisationId,
            props.order.billingCycleId,
            refundType.value,
            amount,
            reason.value || undefined
        )
        successFromResponse(response, 'Refund completed.')
        emit('refunded')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to process refund.')
    } finally {
        submitting.value = false
    }
}
const close = (): void => emit('update:modelValue', false)
watch(
    () => [props.modelValue, props.order?.billingCycleId] as const,
    ([open]) => {
        if (open) void load()
    }
)
</script>
