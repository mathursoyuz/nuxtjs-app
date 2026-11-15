<template>
                    <!-- Billing Details Section -->
                    <v-card class="mb-4" elevation="0" variant="outlined">
                        <v-card-title class="text-h6">Billing Details</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="billingCompany"
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
                                        name="billingAddress"
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
                                        name="billingCity"
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
                                        name="billingStateCode"
                                        validate-on-blur
                                    >
                                        <v-select
                                            :model-value="field.value"
                                            @update:model-value="field.onChange"
                                            :items="billingStateOptions"
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
                                        name="billingPostalCode"
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
                                        name="billingCountryCode"
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
                        </v-card-text>
                    </v-card>
</template>

<script setup lang="ts">
import { Field } from 'vee-validate'

defineProps<{
    countryOptions: Array<{ title: string; value: string | number }>
    billingStateOptions: Array<{ title: string; value: string | number }>
}>()
const emit = defineEmits<{ countryChange: [countryId: string] }>()
const handleCountryChange = (onChange: (value: unknown) => void, countryId: string): void => {
    onChange(countryId)
    emit('countryChange', countryId)
}
</script>
