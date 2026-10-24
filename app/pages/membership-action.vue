<template>
    <v-container class="py-12" style="max-width: 760px">
        <v-card>
            <v-card-title>Membership pricing update</v-card-title>
            <v-card-text>
                <v-progress-linear v-if="loading" indeterminate />
                <v-alert v-else-if="errorMessage" type="error" variant="tonal">
                    {{ errorMessage }}
                </v-alert>
                <template v-else-if="action">
                    <p class="mb-4">
                        <strong>{{ action.membershipName }}</strong>
                        has an updated price of {{ formatMembershipMoney(action.priceAmount) }}.
                    </p>
                    <v-alert
                        v-if="action.status !== MEMBERSHIP_ACTION_STATUS.PENDING"
                        type="info"
                        variant="tonal"
                    >
                        This request has already been resolved.
                    </v-alert>
                    <v-form v-else @submit.prevent="submit">
                        <v-radio-group v-model="decision" :error-messages="errors.decision">
                            <v-radio label="Accept the new price and continue" value="ACCEPT" />
                            <v-radio
                                label="Decline and cancel at the end of the current period"
                                value="DECLINE"
                            />
                        </v-radio-group>
                        <v-textarea v-model="reason" label="Note (optional)" />
                    </v-form>
                </template>
            </v-card-text>
            <v-card-actions v-if="action?.status === MEMBERSHIP_ACTION_STATUS.PENDING">
                <v-spacer />
                <v-btn color="primary" :loading="isSubmitting" @click="submit">
                    Confirm decision
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import {
    membershipPricingDecisionSchema,
    type MembershipPricingDecisionFormData,
} from '~/schemas/membership.schema'
import { MEMBERSHIP_ACTION_STATUS } from '~/constants/membership.constants'
import { useMemberships } from '~/composables/useMemberships'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { PublicMembershipAction } from '~/types/membership.types'

definePageMeta({ layout: false })
const route = useRoute()
const manager = useMemberships()
const token = typeof route.query.token === 'string' ? route.query.token : ''
const action = ref<PublicMembershipAction | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const { errors, defineField, handleSubmit, isSubmitting } =
    useForm<MembershipPricingDecisionFormData>({
        validationSchema: toTypedSchema(membershipPricingDecisionSchema),
        initialValues: { decision: 'ACCEPT' },
    })
const [decision] = defineField('decision')
const [reason] = defineField('reason')
const load = async (): Promise<void> => {
    if (!token) {
        errorMessage.value = 'Membership action link is missing.'
        return
    }
    loading.value = true
    try {
        action.value = (await manager.previewAction(token)).data ?? null
    } catch (error) {
        errorMessage.value =
            error instanceof Error
                ? error.message
                : 'This membership action link is invalid or expired.'
    } finally {
        loading.value = false
    }
}
const submitForm = handleSubmit(async (data) => {
    try {
        await manager.resolvePublicAction(token, data.decision, data.reason)
        await load()
    } catch (error) {
        errorMessage.value =
            error instanceof Error ? error.message : 'Unable to save your response.'
    }
})
const submit = (): void => void submitForm()
onMounted(load)
</script>
