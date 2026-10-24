<template>
    <v-dialog
        :model-value="modelValue"
        max-width="660"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Review Platform Service price"
                entity-label="Service"
                :entity-name="subscription?.membershipName"
                @close="close"
            />
            <v-card-text>
                <v-alert type="info" variant="tonal" class="mb-4">
                    The current price is
                    {{ subscription ? formatMembershipMoney(subscription.priceAmount) : '' }}.
                    Declining schedules cancellation at period end.
                </v-alert>
                <v-form @submit.prevent="submit">
                    <v-radio-group v-model="decision" :error-messages="errors.decision">
                        <v-radio label="Accept" value="ACCEPT" />
                        <v-radio label="Decline" value="DECLINE" />
                    </v-radio-group>
                    <v-textarea v-model="reason" label="Note (optional)" />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Close</v-btn>
                <v-btn color="primary" :loading="isSubmitting" @click="submit">Confirm</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    membershipPricingDecisionSchema,
    type MembershipPricingDecisionFormData,
} from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipAction, MembershipSubscription } from '~/types/membership.types'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    subscription: MembershipSubscription | null
    action: MembershipAction | null
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const manager = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipPricingDecisionFormData>({
        validationSchema: toTypedSchema(membershipPricingDecisionSchema),
        initialValues: { decision: 'ACCEPT' },
    })
const [decision] = defineField('decision')
const [reason] = defineField('reason')
const submitForm = handleSubmit(async (data) => {
    if (!props.action) return
    try {
        const response = await manager.resolveOrganisationAction(
            props.organisationId,
            props.action.id,
            data.decision,
            data.reason
        )
        successFromResponse(response, 'Pricing response saved.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to save pricing response.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
