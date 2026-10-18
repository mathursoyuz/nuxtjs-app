<template>
    <v-dialog :model-value="modelValue" max-width="850" persistent @update:model-value="close">
        <v-card>
            <v-card-title class="d-flex align-center pa-4">
                <span>Select shipping address</span>
                <v-spacer />
                <v-btn icon="mdi-close" variant="text" @click="close(false)" />
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-5">
                <v-radio-group v-model="selectedKey" hide-details>
                    <v-card
                        v-for="option in options"
                        :key="option.key"
                        class="mb-3"
                        variant="outlined"
                        @click="selectedKey = option.key"
                    >
                        <v-card-text class="d-flex align-start ga-3">
                            <v-radio :value="option.key" />
                            <div>
                                <div class="font-weight-medium">{{ option.label }}</div>
                                <div>
                                    {{ option.address.firstName }} {{ option.address.lastName }}
                                </div>
                                <div v-if="option.address.company">
                                    {{ option.address.company }}
                                </div>
                                <div>
                                    {{ option.address.address }}, {{ option.address.city }},
                                    {{ option.address.stateCode }} {{ option.address.postalCode }}
                                </div>
                                <div>{{ option.address.countryCode }}</div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-radio-group>
                <v-alert v-if="options.length === 0" type="warning" variant="tonal">
                    No shipping address is available for this customer.
                </v-alert>
            </v-card-text>
            <v-divider />
            <v-card-actions class="pa-4">
                <v-btn prepend-icon="mdi-map-marker-plus" variant="tonal" @click="manage">
                    Add or manage addresses
                </v-btn>
                <v-spacer />
                <v-btn variant="text" @click="close(false)">Cancel</v-btn>
                <v-btn color="primary" :disabled="!selectedOption" @click="select">
                    Use selected address
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Customer } from '~/services/api/wrappers/customer.api'
import type { CustomerOrderAddress } from '~/types/order.types'

interface ShippingOption {
    key: string
    id: number | null
    label: string
    address: CustomerOrderAddress
}

const props = defineProps<{
    modelValue: boolean
    customer: Customer
    selectedAddressId: number | null
}>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    select: [payload: { id: number | null; address: CustomerOrderAddress }]
    manage: []
}>()

const selectedKey = ref('primary')
const toOrderAddress = (address: {
    firstName: string | null
    lastName: string | null
    company: string | null
    address: string
    city: string
    stateCode: string
    postalCode: string
    countryCode: string
}): CustomerOrderAddress => ({
    firstName: address.firstName ?? props.customer.firstName,
    lastName: address.lastName ?? props.customer.lastName,
    company: address.company ?? '',
    address: address.address,
    city: address.city,
    stateCode: address.stateCode,
    postalCode: address.postalCode,
    countryCode: address.countryCode,
    phone: props.customer.phoneNumber,
    email: props.customer.email,
})

const options = computed<ShippingOption[]>(() => [
    {
        key: 'primary',
        id: null,
        label: 'Primary shipping address',
        address: toOrderAddress(props.customer.shipping),
    },
    ...(props.customer.shippingAddresses ?? [])
        .filter((address) => address.isActive)
        .map((address) => ({
            key: `saved-${address.id}`,
            id: address.id,
            label: `Saved shipping address ${address.type}`,
            address: toOrderAddress(address),
        })),
])
const selectedOption = computed(() =>
    options.value.find((option) => option.key === selectedKey.value)
)

function close(value: boolean): void {
    emit('update:modelValue', value)
}

function select(): void {
    if (!selectedOption.value) return
    emit('select', {
        id: selectedOption.value.id,
        address: { ...selectedOption.value.address },
    })
    close(false)
}

function manage(): void {
    close(false)
    emit('manage')
}

watch(
    () => [props.modelValue, props.selectedAddressId] as const,
    ([open, id]) => {
        if (open) selectedKey.value = id === null ? 'primary' : `saved-${id}`
    },
    { immediate: true }
)
</script>
