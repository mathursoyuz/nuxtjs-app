<template>
    <v-dialog
        :model-value="modelValue"
        max-width="680"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader title="Subscribe to Platform Service" @close="close" />
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
                <v-btn color="primary" :loading="isSubmitting" @click="submit">Subscribe</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    membershipSelectionSchema,
    type MembershipSelectionFormData,
} from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { Membership, MembershipSubscription } from '~/types/membership.types'
import type { OrganisationCreditCard } from '~/types/organisation-credit-card.types'
import MembershipSelectionTiles from './MembershipSelectionTiles.vue'
import PaymentCardSelectionTiles from './PaymentCardSelectionTiles.vue'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    memberships: Membership[]
    subscriptions: MembershipSubscription[]
    cards: OrganisationCreditCard[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const eligibleMemberships = computed(() => props.memberships.filter((item) => item.isActive))
const subscriptionForGroup = (item: Membership): MembershipSubscription | undefined =>
    props.subscriptions.find(
        (subscription) => subscription.membershipTypeId === item.membershipTypeId
    )
const isDisabled = (item: Membership): boolean => Boolean(subscriptionForGroup(item))
const statusFor = (item: Membership): string => {
    const subscription = subscriptionForGroup(item)
    if (!subscription) return 'Available'
    if (subscription.membershipId === item.id) return `Subscribed · ${subscription.status}`
    return 'Another tier subscribed'
}
const memberships = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipSelectionFormData>({
        validationSchema: toTypedSchema(membershipSelectionSchema),
        initialValues: { membershipId: 0 },
    })
const [membershipId] = defineField('membershipId')
const [creditCardId] = defineField('creditCardId')
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
    try {
        const response = await memberships.joinOrganisationMembership(
            props.organisationId,
            data.membershipId,
            data.creditCardId
        )
        successFromResponse(response, 'Platform Service subscribed.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to subscribe to Platform Service.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
