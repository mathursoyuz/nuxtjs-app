<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Manage customer subscriptions"
                :organisation-name="organisationName"
                entity-label="Customer"
                :entity-name="
                    selectedCustomer
                        ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                        : 'Select a customer'
                "
                @close="emit('update:modelValue', false)"
            />
            <v-card-text>
                <CustomerSearchStep
                    v-model="selectedCustomer"
                    :organisation-id="organisationId"
                    class="mb-6"
                />

                <CustomerMembershipManager
                    v-if="selectedCustomer"
                    :organisation-id="organisationId"
                    :customer-id="selectedCustomer.id"
                    :customer-name="`${selectedCustomer.firstName} ${selectedCustomer.lastName}`"
                    :can-write="canWrite"
                    @updated="emit('subscriptions-updated')"
                />
                <v-alert v-else type="info" variant="tonal">
                    Select a customer to manage memberships, upgrades, downgrades, renewals, and
                    cancellations.
                </v-alert>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CustomerMembershipManager from './CustomerMembershipManager.vue'
import CustomerSearchStep from '~/components/orders/CustomerSearchStep.vue'
import type { Customer } from '~/services/api/wrappers/customer.api'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    organisationName: string
    canWrite: boolean
}>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'subscriptions-updated': []
}>()
const selectedCustomer = ref<Customer | null>(null)

watch(
    () => [props.modelValue, props.organisationId] as const,
    ([open]) => {
        if (!open) return
        selectedCustomer.value = null
    }
)
</script>
