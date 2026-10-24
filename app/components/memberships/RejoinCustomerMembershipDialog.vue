<template>
    <v-dialog
        :model-value="modelValue"
        max-width="640"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Rejoin membership"
                entity-label="Membership"
                :entity-name="subscription?.membershipName"
                @close="close"
            />
            <v-card-text>
                <MembershipSubscriptionSummaryCard :subscription="subscription" />
                <div class="mb-4">
                    Rejoin {{ subscription?.membershipName }} using its current price and benefits.
                </div>
                <v-form @submit.prevent="submit">
                    <PaymentCardSelectionTiles
                        v-model="creditCardId"
                        :cards="cards"
                        :error-messages="errors.creditCardId"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Cancel</v-btn>
                <v-btn color="primary" :loading="isSubmitting" @click="submit">Rejoin</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { watch } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import MembershipSubscriptionSummaryCard from './MembershipSubscriptionSummaryCard.vue'
import {
    membershipCardSelectionSchema,
    type MembershipCardSelectionFormData,
} from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { MembershipSubscription } from '~/types/membership.types'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
import PaymentCardSelectionTiles from './PaymentCardSelectionTiles.vue'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    customerId: number
    subscription: MembershipSubscription | null
    cards: CustomerCreditCard[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const manager = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipCardSelectionFormData>({
        validationSchema: toTypedSchema(membershipCardSelectionSchema),
        initialValues: {},
    })
const [creditCardId] = defineField('creditCardId')
watch(
    () => props.modelValue,
    (open) => {
        if (open)
            resetForm({
                values: { creditCardId: props.cards.find((card) => card.isActive)?.id },
            })
    }
)
const submitForm = handleSubmit(async (data) => {
    if (!props.subscription) return
    try {
        const response = await manager.rejoinCustomerMembership(
            props.organisationId,
            props.customerId,
            props.subscription.membershipId,
            data.creditCardId
        )
        successFromResponse(response, 'Membership rejoined.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to rejoin membership.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
