<template>
                    <!-- Credit Card Details Section -->
                    <v-card class="mb-4" elevation="0" variant="outlined">
                        <v-card-title class="text-h6">Credit Card Details</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="creditCard.cardNumber"
                                        validate-on-blur
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            @update:model-value="field.onChange"
                                            label="Card Number"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="creditCard.expMonth"
                                        validate-on-blur
                                    >
                                        <v-select
                                            :model-value="field.value"
                                            @update:model-value="field.onChange"
                                            label="Exp Month"
                                            :items="monthOptions"
                                            variant="outlined"
                                            density="compact"
                                            item-title="title"
                                            item-value="value"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="creditCard.expYear"
                                        validate-on-blur
                                    >
                                        <v-select
                                            :model-value="field.value"
                                            @update:model-value="field.onChange"
                                            label="Exp Year"
                                            :items="yearOptions"
                                            variant="outlined"
                                            density="compact"
                                            item-title="title"
                                            item-value="value"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="creditCard.cvc"
                                        validate-on-blur
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            @update:model-value="field.onChange"
                                            label="CVC"
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

const monthOptions = Array.from({ length: 12 }, (_, index: number) => {
    const value = String(index + 1).padStart(2, '0')
    return { title: value, value }
})
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 16 }, (_, index: number) => {
    const value = String(currentYear + index)
    return { title: value, value }
})
</script>
