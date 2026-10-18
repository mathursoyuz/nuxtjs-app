<template>
    <v-row>
        <v-col cols="12" md="6">
            <v-card variant="outlined" height="100%">
                <v-card-title class="d-flex align-center">
                    Billing details
                    <v-spacer />
                </v-card-title>
                <v-card-text>
                    <div class="font-weight-medium">
                        {{ billing.firstName }} {{ billing.lastName }}
                    </div>
                    <div v-if="billing.company">{{ billing.company }}</div>
                    <div>{{ billing.address }}</div>
                    <div>{{ billing.city }}, {{ billing.stateCode }} {{ billing.postalCode }}</div>
                    <div>{{ billing.countryCode }}</div>
                    <div class="mt-2">{{ billing.email }}</div>
                    <div>{{ billing.phone }}</div>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="6">
            <v-card variant="outlined" height="100%">
                <v-card-title class="d-flex align-center">
                    Shipping details
                    <v-spacer />
                    <v-btn
                        size="small"
                        variant="tonal"
                        prepend-icon="mdi-map-marker"
                        @click="emit('select-shipping')"
                    >
                        Select or manage
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-row dense>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="shipping.firstName"
                                label="First name *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="shipping.lastName"
                                label="Last name *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="shipping.company"
                                label="Company"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="shipping.address"
                                label="Address *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="shipping.city"
                                label="City *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="shipping.stateCode"
                                label="State code *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="shipping.postalCode"
                                label="Postal code *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field
                                v-model="shipping.countryCode"
                                label="Country code *"
                                density="compact"
                                variant="outlined"
                            />
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script setup lang="ts">
import type { CustomerOrderAddress } from '~/types/order.types'

const billing = defineModel<CustomerOrderAddress>('billing', { required: true })
const shipping = defineModel<CustomerOrderAddress>('shipping', { required: true })
const emit = defineEmits<{
    'edit-billing': []
    'select-shipping': []
}>()
</script>
