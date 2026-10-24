<template>
    <v-dialog :model-value="modelValue" max-width="760" persistent @update:model-value="close">
        <v-card>
            <DialogsDialogHeader
                title="Billing details for this order"
                entity-label="Customer"
                :entity-name="`${address.firstName} ${address.lastName}`.trim()"
                @close="close(false)"
            />
            <v-divider />
            <v-card-text class="pa-5">
                <v-row>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="draft.firstName"
                            label="First name *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="draft.lastName"
                            label="Last name *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field v-model="draft.company" label="Company" variant="outlined" />
                    </v-col>
                    <v-col cols="12">
                        <v-text-field
                            v-model="draft.address"
                            label="Address *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="draft.city" label="City *" variant="outlined" />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="draft.stateCode"
                            label="State code *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="draft.postalCode"
                            label="Postal code *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="draft.countryCode"
                            label="Country code *"
                            variant="outlined"
                        />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field v-model="draft.phone" label="Phone *" variant="outlined" />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field
                            v-model="draft.email"
                            label="Email *"
                            type="email"
                            variant="outlined"
                        />
                    </v-col>
                </v-row>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="text" @click="close(false)">Cancel</v-btn>
                <v-btn color="primary" :disabled="!isValid" @click="save">
                    Use billing details
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { CustomerOrderAddress } from '~/types/order.types'

const props = defineProps<{
    modelValue: boolean
    address: CustomerOrderAddress
}>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    save: [address: CustomerOrderAddress]
}>()

const draft = reactive<CustomerOrderAddress>({ ...props.address })
const requiredFields: Array<keyof CustomerOrderAddress> = [
    'firstName',
    'lastName',
    'address',
    'city',
    'stateCode',
    'postalCode',
    'countryCode',
    'phone',
    'email',
]
const isValid = computed(
    () =>
        requiredFields.every((field) => draft[field].trim().length > 0) &&
        /^\S+@\S+\.\S+$/.test(draft.email)
)

function close(value: boolean): void {
    emit('update:modelValue', value)
}

function save(): void {
    if (!isValid.value) return
    emit('save', { ...draft })
    close(false)
}

watch(
    () => [props.modelValue, props.address] as const,
    ([open, address]) => {
        if (open) Object.assign(draft, address)
    },
    { deep: true }
)
</script>
