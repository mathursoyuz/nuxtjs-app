<template>
    <v-dialog
        :model-value="modelValue"
        max-width="680"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Downgrade membership"
                entity-label="Membership"
                :entity-name="current?.membershipName"
                @close="close"
            />
            <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                    Choose whether the downgrade starts at the next renewal or immediately.
                </v-alert>
                <v-alert v-if="!hasEligibleOptions" type="warning" variant="tonal" class="mb-4">
                    No lower-tier membership is available.
                </v-alert>
                <v-form @submit.prevent="submit">
                    <MembershipSelectionTiles
                        v-model="membershipId"
                        :items="options"
                        :disabled-for="isDisabled"
                        :status-for="statusFor"
                        :error-messages="errors.membershipId"
                    />
                    <PaymentCardSelectionTiles
                        v-model="creditCardId"
                        :cards="cards"
                        :error-messages="errors.creditCardId"
                    />
                    <v-checkbox
                        v-model="effectiveImmediately"
                        label="Downgrade immediately"
                        color="primary"
                        hide-details
                    />
                    <v-alert
                        v-if="effectiveImmediately && proration"
                        type="warning"
                        variant="tonal"
                        class="mb-4"
                    >
                        <div>
                            Unused credit: {{ formatMembershipMoney(proration.unusedCreditAmount) }}
                        </div>
                        <div>
                            New membership:
                            {{ formatMembershipMoney(selectedMembership?.priceAmount ?? 0) }}
                        </div>
                        <div>
                            Credit applied:
                            {{ formatMembershipMoney(proration.creditDiscountApplied) }}
                        </div>
                        <div>
                            Charge now: {{ formatMembershipMoney(proration.finalAmountCharged) }}
                        </div>
                        <div>
                            Credit left after downgrade:
                            {{ formatMembershipMoney(proration.remainingCreditAmount) }}
                        </div>
                    </v-alert>
                    <v-checkbox
                        v-if="requiresForfeitureConfirmation"
                        v-model="forfeitRemainingCredit"
                        color="warning"
                        :label="`The customer agrees to forfeit the remaining ${formatMembershipMoney(proration?.remainingCreditAmount ?? 0)} credit.`"
                    />
                    <v-textarea v-model="reason" label="Reason (optional)" />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="!hasEligibleOptions || requiresUnconfirmedForfeiture"
                    @click="submit"
                >
                    {{ effectiveImmediately ? 'Downgrade now' : 'Schedule downgrade' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    membershipSelectionSchema,
    type MembershipSelectionFormData,
} from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { calculateMembershipProration, formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipSubscription } from '~/types/membership.types'
import MembershipSelectionTiles from './MembershipSelectionTiles.vue'
import PaymentCardSelectionTiles from './PaymentCardSelectionTiles.vue'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    customerId: number
    current: MembershipSubscription | null
    memberships: Membership[]
    subscriptions: MembershipSubscription[]
    cards: CustomerCreditCard[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const manager = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const options = computed(() =>
    props.memberships.filter(
        (item) => item.isActive && item.membershipTypeId === props.current?.membershipTypeId
    )
)
const isEligible = (item: Membership): boolean =>
    item.id !== props.current?.membershipId && item.tierRank < (props.current?.tierRank ?? 0)
const isDisabled = (item: Membership): boolean => !isEligible(item)
const statusFor = (item: Membership): string => {
    if (item.id === props.current?.membershipId) return 'Current'
    if (item.tierRank >= (props.current?.tierRank ?? 0)) return 'Not a lower tier'
    return 'Available downgrade'
}
const hasEligibleOptions = computed(() => options.value.some(isEligible))
const effectiveImmediately = ref(false)
const forfeitRemainingCredit = ref(false)
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipSelectionFormData>({
        validationSchema: toTypedSchema(membershipSelectionSchema),
        initialValues: { membershipId: 0 },
    })
const [membershipId] = defineField('membershipId')
const [creditCardId] = defineField('creditCardId')
const [reason] = defineField('reason')
const selectedMembership = computed(() =>
    props.memberships.find((membership) => membership.id === membershipId.value)
)
const proration = computed(() => {
    if (
        !effectiveImmediately.value ||
        !props.current?.currentPeriodEnd ||
        !selectedMembership.value
    ) {
        return null
    }
    return calculateMembershipProration(
        props.current.priceAmount,
        selectedMembership.value.priceAmount,
        props.current.currentPeriodStart,
        props.current.currentPeriodEnd
    )
})
const requiresForfeitureConfirmation = computed(
    () => (proration.value?.remainingCreditAmount ?? 0) > 0
)
const requiresUnconfirmedForfeiture = computed(
    () => requiresForfeitureConfirmation.value && !forfeitRemainingCredit.value
)
watch(
    () => props.modelValue,
    (open) => {
        if (open) {
            effectiveImmediately.value = false
            forfeitRemainingCredit.value = false
            resetForm({
                values: {
                    membershipId: 0,
                    creditCardId: props.cards.find((card) => card.isActive)?.id,
                },
            })
        }
    }
)
const submitForm = handleSubmit(async (data) => {
    if (!props.current) return
    try {
        const response = await manager.downgradeCustomerMembership(
            props.organisationId,
            props.customerId,
            props.current.id,
            data.membershipId,
            data.creditCardId,
            data.reason,
            effectiveImmediately.value,
            effectiveImmediately.value && forfeitRemainingCredit.value
        )
        successFromResponse(
            response,
            effectiveImmediately.value ? 'Membership downgraded.' : 'Downgrade scheduled.'
        )
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to downgrade membership.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    effectiveImmediately.value = false
    forfeitRemainingCredit.value = false
    resetForm()
    emit('update:modelValue', false)
}
</script>
