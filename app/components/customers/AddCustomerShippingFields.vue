<template>
                    <!-- Shipping Addresses Section -->
                    <v-card class="mb-4" elevation="0" variant="outlined">
                        <v-card-text>
                            <v-switch
                                :model-value="copyBillingToShipping"
                                label="Same as billing address"
                                hide-details
                                density="compact"
                                color="primary"
                                class="mb-4"
                                @update:model-value="handleCopyBillingToShipping"
                            />

                            <!-- First Shipping Address (bound to form fields) -->
                            <v-card variant="outlined" class="pa-4 mb-4">
                                <div class="text-subtitle-1 mb-4">Shipping Address 1</div>
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingFirstName"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                label="First Name *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingLastName"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                label="Last Name *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingCompany"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                label="Company"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingAddress"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                label="Address *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingCity"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                label="City *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingStateCode"
                                            validate-on-blur
                                        >
                                            <v-select
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                :items="shippingStateOptions"
                                                item-title="title"
                                                item-value="value"
                                                label="State *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingPostalCode"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                @update:model-value="field.onChange"
                                                label="Postal Code *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="shippingCountryCode"
                                            validate-on-blur
                                        >
                                            <v-select
                                                :model-value="field.value"
                                                @update:model-value="
                                                    (val) =>
                                                        handleCountryChange(field.onChange, val)
                                                "
                                                :items="countryOptions"
                                                item-title="title"
                                                item-value="value"
                                                label="Country *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                </v-row>
                            </v-card>
                        </v-card-text>
                    </v-card>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate'

defineProps<{
    countryOptions: Array<{ title: string; value: string | number }>
    shippingStateOptions: Array<{ title: string; value: string | number }>
    copyBillingToShipping: boolean
}>()
const emit = defineEmits<{
    countryChange: [countryId: string]
    'update:copyBillingToShipping': [copy: boolean | null]
}>()
const handleCountryChange = (onChange: (value: unknown) => void, countryId: string): void => {
    onChange(countryId)
    emit('countryChange', countryId)
}
const handleCopyBillingToShipping = (copy: boolean | null): void => {
    emit('update:copyBillingToShipping', copy)
}
</script>
