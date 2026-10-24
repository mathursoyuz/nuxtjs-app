<template>
    <v-dialog
        :model-value="modelValue"
        max-width="600"
        persistent
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Cancel membership"
                entity-label="Membership"
                :entity-name="subscription?.membershipName"
                @close="close"
            />
            <v-card-text>
                <MembershipSubscriptionSummaryCard :subscription="subscription" />
                <v-alert type="warning" variant="tonal" class="mb-4">
                    Benefits remain available until the end of the paid period.
                </v-alert>
                <v-form @submit.prevent="submit">
                    <v-textarea
                        v-model="reason"
                        label="Cancellation reason (optional)"
                        :error-messages="errors.reason"
                    />
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="close">Keep membership</v-btn>
                <v-btn color="error" :loading="isSubmitting" @click="submit">
                    Schedule cancellation
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import MembershipSubscriptionSummaryCard from './MembershipSubscriptionSummaryCard.vue'
import { membershipReasonSchema, type MembershipReasonFormData } from '~/schemas/membership.schema'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { MembershipSubscription } from '~/types/membership.types'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    subscription: MembershipSubscription | null
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()
const manager = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const { errors, defineField, handleSubmit, isSubmitting, resetForm } =
    useForm<MembershipReasonFormData>({
        validationSchema: toTypedSchema(membershipReasonSchema),
        initialValues: {},
    })
const [reason] = defineField('reason')
const submitForm = handleSubmit(async (data) => {
    if (!props.subscription) return
    try {
        const response = await manager.cancelCustomerMembership(
            props.organisationId,
            props.subscription.id,
            data.reason
        )
        successFromResponse(response, 'Cancellation scheduled.')
        emit('saved')
        close()
    } catch (error) {
        errorFromError(error, 'Unable to cancel membership.')
    }
})
const submit = (): void => void submitForm()
const close = (): void => {
    resetForm()
    emit('update:modelValue', false)
}
</script>
