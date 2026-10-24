<template>
    <v-dialog
        :model-value="modelValue"
        max-width="680"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader title="Join membership" @close="close" />
            <v-card-text>
                <v-form @submit.prevent="submit">
                    <MembershipSelectionTiles
                        v-model="membershipId"
                        :items="eligibleMemberships"
                        :disabled-for="isDisabled"
                        :status-for="statusFor"
                        :error-messages="errors.membershipId"
                    />
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
                <v-btn color="primary" :loading="isSubmitting" @click="submit">Join</v-btn>
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
    memberships: Membership[]
    subscriptions: MembershipSubscription[]
    cards: CustomerCreditCard[]
    initialMembershipId?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const manager = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const eligibleMemberships = computed(() => props.memberships.filter((item) => item.isActive))
const subscriptionForGroup = (item: Membership): MembershipSubscription | undefined =>
    props.subscriptions.find(
        (subscription) => subscription.membershipTypeId === item.membershipTypeId
    )
const isDisabled = (item: Membership): boolean => Boolean(subscriptionForGroup(item))
const statusFor = (item: Membership): string => {
    const subscription = subscriptionForGroup(item)
    if (!subscription) return 'Available'
    if (subscription.membershipId === item.id) return `Joined · ${subscription.status}`
    return 'Another tier joined'
}
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipSelectionFormData>({
        validationSchema: toTypedSchema(membershipSelectionSchema),
        initialValues: { membershipId: 0 },
    })
const [membershipId] = defineField('membershipId')
const [creditCardId] = defineField('creditCardId')
watch(
    () => [props.modelValue, props.initialMembershipId] as const,
    ([open, initialMembershipId]) => {
        if (!open) return
        const initial = eligibleMemberships.value.find(
            (item) => item.id === initialMembershipId && !isDisabled(item)
        )
        resetForm({
            values: {
                membershipId: initial?.id ?? 0,
                creditCardId: props.cards.find((card) => card.isActive)?.id,
            },
        })
    },
    { immediate: true }
)
const submitForm = handleSubmit(async (data) => {
    try {
        const response = await manager.joinCustomerMembership(
            props.organisationId,
            props.customerId,
            data.membershipId,
            data.creditCardId
        )
        successFromResponse(response, 'Membership joined.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to join membership.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
