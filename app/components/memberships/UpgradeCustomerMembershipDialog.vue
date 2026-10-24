<template>
    <v-dialog
        :model-value="modelValue"
        max-width="680"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Upgrade membership"
                entity-label="Membership"
                :entity-name="current?.membershipName"
                @close="close"
            />
            <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                    The unused value of the current period is applied as a credit. The upgraded
                    billing cycle starts today.
                </v-alert>
                <v-alert v-if="!hasEligibleOptions" type="warning" variant="tonal" class="mb-4">
                    No higher-tier membership is available.
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
                    <v-textarea v-model="reason" label="Reason (optional)" />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="!hasEligibleOptions"
                    @click="submit"
                >
                    Upgrade now
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    membershipSelectionSchema,
    type MembershipSelectionFormData,
} from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { Membership, MembershipSubscription } from '~/types/membership.types'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
import MembershipSelectionTiles from './MembershipSelectionTiles.vue'
import PaymentCardSelectionTiles from './PaymentCardSelectionTiles.vue'
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
    item.id !== props.current?.membershipId && item.tierRank > (props.current?.tierRank ?? 0)
const isDisabled = (item: Membership): boolean => !isEligible(item)
const statusFor = (item: Membership): string => {
    if (item.id === props.current?.membershipId) return 'Current'
    if (item.tierRank <= (props.current?.tierRank ?? 0)) return 'Not a higher tier'
    return 'Available upgrade'
}
const hasEligibleOptions = computed(() => options.value.some(isEligible))
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipSelectionFormData>({
        validationSchema: toTypedSchema(membershipSelectionSchema),
        initialValues: { membershipId: 0 },
    })
const [membershipId] = defineField('membershipId')
const [creditCardId] = defineField('creditCardId')
const [reason] = defineField('reason')
watch(
    () => props.modelValue,
    (open) => {
        if (open)
            resetForm({
                values: {
                    membershipId: 0,
                    creditCardId: props.cards.find((card) => card.isActive)?.id,
                },
            })
    }
)
const submitForm = handleSubmit(async (data) => {
    if (!props.current) return
    try {
        const response = await manager.upgradeCustomerMembership(
            props.organisationId,
            props.customerId,
            props.current.id,
            data.membershipId,
            data.creditCardId,
            data.reason
        )
        successFromResponse(response, 'Membership upgraded.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to upgrade membership.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
