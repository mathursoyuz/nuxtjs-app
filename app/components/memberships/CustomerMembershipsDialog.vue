<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Customer memberships"
                entity-label="Customer"
                :entity-name="customerName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-text>
                <CustomerMembershipManager
                    :organisation-id="organisationId"
                    :customer-id="customerId"
                    :customer-name="customerName"
                    :can-write="canWrite"
                    :active="modelValue"
                />
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import CustomerMembershipManager from './CustomerMembershipManager.vue'

defineProps<{
    modelValue: boolean
    organisationId: number
    customerId: number
    customerName: string
    canWrite: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>
