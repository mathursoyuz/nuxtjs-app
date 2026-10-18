<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="1200"
        scrollable
        persistent
        transition="dialog-bottom-transition"
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between pa-4">
                <span class="text-h4">Add Customer</span>
                <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn @click="$emit('update:modelValue', false)" class="mr-2">Cancel</v-btn>
                <v-btn color="primary" :loading="isSubmitting" @click="handleSubmitForm">
                    Create Customer
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-6">
                <v-form ref="formRef">
                    <LazyGlobalsFormFieldErrors :errors="errors" />

                    <!-- Basic Info Section -->
                    <v-card class="mb-4" elevation="0" variant="outlined">
                        <v-card-title class="text-h6">Basic Information</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6" class="pa-0">
                                    <v-col cols="12">
                                        <v-select
                                            v-model="selectedOrganisationId"
                                            :items="organisationOptions"
                                            item-title="name"
                                            item-value="id"
                                            label="Select Organisation *"
                                            variant="outlined"
                                            density="compact"
                                            required
                                            :error="hasOrganisationError"
                                            :error-messages="
                                                hasOrganisationError ? 'Organisation is required' : ''
                                            "
                                            hide-details="auto"
                                        ></v-select>
                                    </v-col>
                                    <v-col cols="12">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="firstName"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                label="First Name *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @update:model-value="field.onChange"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="lastName"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                label="Last Name *"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                hide-details="auto"
                                                @update:model-value="field.onChange"
                                                @blur="field.onBlur"
                                            />
                                        </Field>
                                    </v-col>
                                    <v-col cols="12">
                                        <Field
                                            v-slot="{ field, errorMessage }"
                                            name="email"
                                            validate-on-blur
                                        >
                                            <v-text-field
                                                :model-value="field.value"
                                                label="Email *"
                                                type="email"
                                                variant="outlined"
                                                density="compact"
                                                :error-messages="errorMessage"
                                                :loading="checkingEmail"
                                                hide-details="auto"
                                                @update:model-value="field.onChange"
                                                @blur="handleEmailBlur(field)"
                                            />
                                        </Field>
                                    </v-col>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <div class="text-body-2 font-weight-medium mb-2">
                                        Avatar Image
                                    </div>
                                    <div
                                        v-if="!avatarPreview"
                                        class="upload-zone upload-zone-small d-flex flex-column align-center justify-center pa-4"
                                        @click="triggerAvatarInput"
                                        @dragover.prevent
                                        @drop.prevent="handleAvatarDrop"
                                    >
                                        <v-icon size="32" color="primary" class="mb-2">
                                            mdi-cloud-upload
                                        </v-icon>
                                        <div class="text-body-2 text-center">
                                            Drop Avatar here to upload
                                        </div>
                                        <input
                                            ref="avatarInput"
                                            type="file"
                                            accept="image/*"
                                            style="display: none"
                                            @change="handleAvatarChange"
                                        />
                                    </div>
                                    <div v-else class="avatar-preview-container">
                                        <v-img
                                            :src="avatarPreview"
                                            max-height="150"
                                            max-width="150"
                                            contain
                                            class="rounded mb-2"
                                        />
                                        <v-btn
                                            variant="text"
                                            color="error"
                                            size="small"
                                            @click="removeAvatar"
                                        >
                                            Remove
                                        </v-btn>
                                    </div>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="password"
                                        validate-on-blur
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Password *"
                                            type="password"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="phoneNumber"
                                        validate-on-blur
                                    >
                                        <div>
                                            <label
                                                class="text-body-2 font-weight-medium mb-2 d-block"
                                            >
                                                Phone Number *
                                            </label>
                                            <div class="d-flex gap-2 align-end">
                                                <v-select
                                                    v-model="selectedCountryCode"
                                                    :items="countryCodeOptions"
                                                    item-title="name"
                                                    item-value="id"
                                                    label="Code"
                                                    variant="outlined"
                                                    density="compact"
                                                    style="max-width: 180px"
                                                    hide-details="auto"
                                                    :error-messages="errorMessage ? ' ' : ''"
                                                    @update:model-value="handleCountryCodeChange"
                                                ></v-select>
                                                <v-text-field
                                                    :model-value="phoneNumberValue"
                                                    label="Phone Number"
                                                    variant="outlined"
                                                    density="compact"
                                                    :error-messages="errorMessage"
                                                    hide-details="auto"
                                                    style="flex: 1"
                                                    @update:model-value="handlePhoneNumberChange"
                                                    @blur="field.onBlur"
                                                />
                                            </div>
                                        </div>
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="pickupLocation"
                                        validate-on-blur
                                    >
                                        <v-select
                                            :model-value="field.value"
                                            :items="locationOptions"
                                            item-title="name"
                                            item-value="id"
                                            label="Pickup Location *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="signupLocation"
                                        validate-on-blur
                                    >
                                        <v-select
                                            :model-value="field.value"
                                            :items="locationOptions"
                                            item-title="name"
                                            item-value="id"
                                            label="Signup Location *"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="dob"
                                        validate-on-blur
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Date of Birth"
                                            type="date"
                                            variant="outlined"
                                            density="compact"
                                            :error-messages="errorMessage"
                                            hide-details="auto"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="deliveryMethod"
                                        validate-on-blur
                                    >
                                        <div>
                                            <label
                                                class="text-body-2 font-weight-medium mb-2 d-block"
                                            >
                                                Delivery Method *
                                            </label>
                                            <v-radio-group
                                                :model-value="field.value"
                                                inline
                                                hide-details
                                                @update:model-value="field.onChange"
                                                @blur="field.onBlur"
                                            >
                                                <v-radio label="PICKUP" :value="1"></v-radio>
                                                <v-radio
                                                    label="HOLD FOR SHIPPING"
                                                    :value="2"
                                                ></v-radio>
                                            </v-radio-group>
                                            <div
                                                v-if="errorMessage"
                                                class="text-error text-caption mt-1"
                                            >
                                                {{ errorMessage }}
                                            </div>
                                        </div>
                                    </Field>
                                </v-col>
                                <v-col cols="12">
                                    <Field v-slot="{ field }" name="isAppUser">
                                        <v-switch
                                            :model-value="field.value"
                                            label="Is App User"
                                            hide-details
                                            density="compact"
                                            color="primary"
                                            @update:model-value="field.onChange"
                                        />
                                    </Field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

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
                                                    handleBillingCountryChange(field.onChange, val)
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

                    <!-- Shipping Addresses Section -->
                    <v-card class="mb-4" elevation="0" variant="outlined">
                        <v-card-text>
                            <v-switch
                                v-model="copyBillingToShipping"
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
                                                        handleShippingCountryChange(
                                                            field.onChange,
                                                            val
                                                        )
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
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useForm, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { createCustomerSchema, type CreateCustomerFormData } from '~/schemas/customer.schema'
import { useCustomer } from '~/composables/useCustomer'
import { useCustomerCreditCards } from '~/composables/useCustomerCreditCards'
import { useLocation } from '~/composables/useLocation'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { DEFAULT_ORGANISATION_ID } from '~/constants/customer.constants'
import { useLoadingTask } from '~/composables/useLoadingTask'
import type { PhoneCountryCode } from '~/services/api/wrappers/country.api'

// Helper function to parse phone number
function parsePhoneNumber(
    phoneNumber: string,
    phoneCountryCodes: PhoneCountryCode[]
): { countryCode: PhoneCountryCode; phoneNumber: string } | null {
    if (!phoneNumber || !phoneCountryCodes || phoneCountryCodes.length === 0) return null

    // Remove all non-digit characters except +
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')

    if (!cleaned || cleaned.length < 4) return null // Too short to have a country code (min: +1 + 2 digits)

    // Try to match dial codes (longest first to avoid false matches)
    // Sort by dial code length descending to match longer codes first (e.g., +1 before +12, but +123 before +1)
    const sortedCodes = [...phoneCountryCodes].sort((a, b) => {
        const aCode = a.dialCode.replace('+', '')
        const bCode = b.dialCode.replace('+', '')
        return bCode.length - aCode.length
    })

    for (const country of sortedCodes) {
        const dialCode = country.dialCode.replace('+', '')
        const dialCodeWithPlus = `+${dialCode}`

        // Check if the cleaned number starts with the dial code (with or without +)
        if (cleaned.startsWith(dialCodeWithPlus)) {
            // Extract the remaining number after the dial code with +
            const remaining = cleaned.substring(dialCodeWithPlus.length).trim()

            // Only return if there's a remaining number (at least 1 digit)
            if (remaining.length > 0) {
                return { countryCode: country, phoneNumber: remaining }
            }
        } else if (cleaned.startsWith(dialCode)) {
            // Check if it starts with just the digits (for numbers like "11234567890" where 1 is the code)
            // But only if the dial code is not just "1" (to avoid false matches)
            // For single-digit codes like "1", require at least 10 total digits to avoid false positives
            const remaining = cleaned.substring(dialCode.length).trim()

            if (remaining.length > 0) {
                // For single-digit codes like "1", make sure we have enough digits total
                // to distinguish from a local number (e.g., "11234567890" vs "1234567890")
                if (dialCode.length === 1 && cleaned.length < 10) {
                    continue // Skip single-digit codes if total length is too short
                }
                return { countryCode: country, phoneNumber: remaining }
            }
        }
    }

    return null
}

interface Props {
    modelValue: boolean
    organisationId: number
    organisations: Array<{ id: number; name: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { createCustomer, uploadImage, checkEmailExists } = useCustomer()
const { locations, fetchLocations } = useLocation()
const {
    countries,
    phoneCountryCodes,
    phoneCountryCodeOptions,
    countryOptions,
    fetchCountries,
    fetchPhoneCountryCodes,
    fetchStates,
} = useCountry()
const { successFromResponse, errorFromError, warning, error, success } = useToast()
const createdCustomerId = ref<number | null>(null)
const { addCard } = useCustomerCreditCards(() => createdCustomerId.value)

const formRef = ref()
const copyBillingToShipping = ref(false)
const checkingEmail = ref(false)

// Month options (1-12)
const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    return {
        title: month.toString().padStart(2, '0'),
        value: month.toString().padStart(2, '0'),
    }
})

// Year options (current year to next 15 years)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 16 }, (_, i) => {
    const year = currentYear + i
    return {
        title: year.toString(),
        value: year.toString(),
    }
})
const selectedOrganisationId = ref<number>(
    props.organisationId && props.organisationId > 0 ? props.organisationId : DEFAULT_ORGANISATION_ID
)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)

// Phone number state
const selectedCountryCode = ref<string>('+1') // Default to US
const phoneNumberValue = ref<string>('')

const organisationOptions = computed(() => {
    return props.organisations
})

const hasOrganisationError = computed(() => {
    return (
        selectedOrganisationId.value === null ||
        selectedOrganisationId.value === undefined ||
        selectedOrganisationId.value === 0
    )
})

const countryCodeOptions = computed(() => {
    return phoneCountryCodeOptions.value.map((c) => {
        return { id: c.dialCode, name: c.label }
    })
})

const getInitialValues = (): CreateCustomerFormData => {
    // Determine initial organisationId - prefer selectedOrganisationId, then props.organisationId, then first organisation, then DEFAULT_ORGANISATION_ID
    const initialOrganisationId = DEFAULT_ORGANISATION_ID

    return {
        organisationId: initialOrganisationId,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        avatar: '',
        phoneNumber: '',
        pickupLocation: 1,
        signupLocation: 1,
        deliveryMethod: 1, // Default to PICKUP
        cpi: '',
        dob: '',
        isAppUser: false,
        isActive: true,
        billingCompany: null,
        billingAddress: '',
        billingCity: '',
        billingStateCode: '',
        billingPostalCode: '',
        billingCountryCode: '',
        shippingFirstName: '',
        shippingLastName: '',
        shippingCompany: null,
        shippingAddress: '',
        shippingCity: '',
        shippingStateCode: '',
        shippingPostalCode: '',
        shippingCountryCode: '',
        creditCard: {
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvc: '',
            isActive: true,
        },
        wineClub: null,
    }
}

const initialValues = getInitialValues()

const {
    handleSubmit,
    isSubmitting,
    setFieldValue,
    values,
    errors,
    resetForm,
    setErrors,
    validate,
    setTouched,
} = useForm<CreateCustomerFormData>({
    validationSchema: toTypedSchema(createCustomerSchema),
    initialValues,
    validateOnMount: false,
})

const locationOptions = computed(() => {
    return locations.value.map((loc) => ({
        id: loc.id,
        name: loc.name,
    }))
})

// Country and state options
const billingCountryCode = ref<string>('')
const shippingCountryCode = ref<string>('')
const billingStateOptions = ref<Array<{ title: string; value: string | number }>>([])
const shippingStateOptions = ref<Array<{ title: string; value: string | number }>>([])

const handleBillingCountryChange = async (onChange: (value: any) => void, countryId: string) => {
    billingCountryCode.value = countryId
    onChange(countryId)
    if (countryId) {
        const states = await fetchStates(countryId)
        billingStateOptions.value = states.map((s) => ({
            title: s.name,
            value: s.id,
        }))
    } else {
        billingStateOptions.value = []
    }
}

const handleShippingCountryChange = async (onChange: (value: any) => void, countryId: string) => {
    shippingCountryCode.value = countryId
    onChange(countryId)
    if (countryId) {
        const states = await fetchStates(countryId)
        shippingStateOptions.value = states.map((s) => ({
            title: s.name,
            value: s.id,
        }))
    } else {
        shippingStateOptions.value = []
    }
}

const handleCopyBillingToShipping = (copy: boolean | null) => {
    if (copy) {
        setFieldValue('shippingFirstName', values.firstName || '')
        setFieldValue('shippingLastName', values.lastName || '')
        setFieldValue('shippingCompany', values.billingCompany || null)
        setFieldValue('shippingAddress', values.billingAddress || '')
        setFieldValue('shippingCity', values.billingCity || '')
        setFieldValue('shippingStateCode', values.billingStateCode || '')
        setFieldValue('shippingPostalCode', values.billingPostalCode || '')
        setFieldValue('shippingCountryCode', values.billingCountryCode || '')
    }
}

// Phone number handlers
const handleCountryCodeChange = (dialCode: string) => {
    selectedCountryCode.value = dialCode
    updatePhoneNumberField()
}

const handlePhoneNumberChange = (value: string) => {
    // Always try to auto-detect country code if phone country codes are loaded
    if (value && value.trim().length > 0 && phoneCountryCodes.value.length > 0) {
        // Try to parse and detect country code
        const parsed = parsePhoneNumber(value, phoneCountryCodes.value)
        if (parsed && parsed.countryCode && parsed.phoneNumber) {
            // Country code detected - update both fields
            selectedCountryCode.value = parsed.countryCode.dialCode
            phoneNumberValue.value = parsed.phoneNumber
            updatePhoneNumberField()
            return
        }
    }

    // No country code detected or empty value - just update the phone number
    phoneNumberValue.value = value || ''
    updatePhoneNumberField()
}

const updatePhoneNumberField = () => {
    const fullPhoneNumber = phoneNumberValue.value
        ? `${selectedCountryCode.value}${phoneNumberValue.value.replace(/^\+/, '')}`
        : ''
    setFieldValue('phoneNumber', fullPhoneNumber)
}

// Email validation on blur
const handleEmailBlur = async (field: { value?: string; onBlur: (e: Event) => void }) => {
    // Create a synthetic event or call onBlur with the actual event
    const syntheticEvent = new Event('blur') as Event
    field.onBlur(syntheticEvent)

    const email = field.value?.trim()
    if (!email || !selectedOrganisationId.value || selectedOrganisationId.value === 0) {
        return
    }

    // Wait for Zod validation to complete (triggered by onBlur)
    await nextTick()

    // Only check uniqueness if email format is valid (no Zod errors)
    if (errors.value.email) {
        return // Zod validation error exists, don't check uniqueness
    }

    checkingEmail.value = true
    try {
        const available = await checkEmailExists(email)
        if (!available) {
            setErrors({ email: 'Email already exists. Please use a different email.' })
        }
    } catch (err) {
        console.error('Error checking email:', err)
    } finally {
        checkingEmail.value = false
    }
}

// Check if any credit card field has a value
const hasAnyCreditCardField = computed(() => {
    const cc = values.creditCard
    return !!(
        cc?.cardNumber?.trim() ||
        cc?.expMonth?.trim() ||
        cc?.expYear?.trim() ||
        cc?.cvc?.trim()
    )
})

const submitForm = handleSubmit(async (formValues) => {
    try {
        const loadingTask = useLoadingTask('create-customer')
        await loadingTask.execute(async () => {
            // Remove credit card from customer data - it will be added separately if provided
            const { creditCard, ...customerDataWithoutCc } = formValues
            const customerData: CreateCustomerFormData = {
                ...customerDataWithoutCc,
                creditCard: null, // Don't send credit card in customer creation
            }
            const createdCustomer = await createCustomer(customerData)
            createdCustomerId.value = createdCustomer.id

            // Upload avatar image if one was selected
            if (avatarFile.value && createdCustomer.id) {
                try {
                    await uploadImage(createdCustomer.id, avatarFile.value)
                } catch (uploadError) {
                    console.error('Error uploading avatar:', uploadError)
                    // Don't fail the entire operation if image upload fails
                    warning(CUSTOMER_MESSAGES.AVATAR_UPLOAD_FAILED)
                }
            }

            // Optionally add credit card if provided
            if (hasAnyCreditCardField.value && creditCard && createdCustomer.id) {
                try {
                    const ccData = {
                        firstName: formValues.firstName,
                        lastName: formValues.lastName,
                        company: formValues.billingCompany || undefined,
                        address: formValues.billingAddress,
                        city: formValues.billingCity,
                        stateCode: formValues.billingStateCode,
                        postalCode: formValues.billingPostalCode,
                        countryCode: formValues.billingCountryCode,
                        phoneNumber: formValues.phoneNumber || undefined,
                        cardNumber: creditCard.cardNumber,
                        expMonth: creditCard.expMonth,
                        expYear: creditCard.expYear,
                        cvc: creditCard.cvc,
                        isActive: creditCard.isActive ?? true,
                    }
                    await addCard(ccData)
                } catch (ccError) {
                    console.error('Error adding credit card:', ccError)
                    // Don't fail the entire operation if credit card addition fails
                    warning('Customer created successfully, but credit card could not be added.')
                }
            }

            success(CUSTOMER_MESSAGES.CREATE_SUCCESS)
            emit('update:modelValue', false)
            emit('submit')
            resetForm({ values: initialValues, errors: {}, touched: {} })
            copyBillingToShipping.value = false
            avatarFile.value = null
            avatarPreview.value = null
            // Reset phone number fields
            selectedCountryCode.value = '+1'
            phoneNumberValue.value = ''
            createdCustomerId.value = null
        })
    } catch (error) {
        console.error('Error creating customer:', error)
        errorFromError(error, CUSTOMER_MESSAGES.CREATE_ERROR)
    }
})

const handleSubmitForm = async () => {
    // Mark all fields as touched to ensure errors are shown
    const allFields = Object.keys(initialValues)
    const touchedFields = allFields.reduce(
        (acc, key) => {
            acc[key] = true
            return acc
        },
        {} as Record<string, boolean>
    )
    setTouched(touchedFields)

    // Call the submit handler which will validate
    await submitForm()
}

// Use useLazyAsyncData for initial data fetching
const { pending: addCustomerDataPending } = await useLazyAsyncData(
    'add-customer-form-data',
    async () => {
        // Fetch countries and phone country codes
        await Promise.all([fetchCountries(), fetchPhoneCountryCodes()])
        selectedOrganisationId.value = DEFAULT_ORGANISATION_ID
        setFieldValue('organisationId', DEFAULT_ORGANISATION_ID)
        await fetchLocations(DEFAULT_ORGANISATION_ID)
    }
)

watch(
    () => selectedOrganisationId.value,
    async (newOrganisationId) => {
        if (newOrganisationId && newOrganisationId > 0) {
            // Update form organisationId when selectedOrganisationId changes
            setFieldValue('organisationId', newOrganisationId)
            const loadingTask = useLoadingTask('fetch-locations')
            await loadingTask.execute(async () => {
                await fetchLocations(newOrganisationId)
            })
        }
    }
)

// Avatar upload handlers
const triggerAvatarInput = () => {
    avatarInput.value?.click()
}

const handleAvatarChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        error(CUSTOMER_MESSAGES.FILE_SIZE_ERROR)
        return
    }

    if (!file.type.startsWith('image/')) {
        error(CUSTOMER_MESSAGES.FILE_TYPE_ERROR)
        return
    }

    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
        avatarPreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    target.value = ''
}

const handleAvatarDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0]
    if (!file) return

    const fakeEvent = {
        target: {
            files: [file],
        },
    } as unknown as Event
    handleAvatarChange(fakeEvent)
}

const removeAvatar = () => {
    avatarFile.value = null
    avatarPreview.value = null
    if (avatarInput.value) {
        avatarInput.value.value = ''
    }
}
</script>

<style scoped>
.upload-zone {
    border: 2px dashed rgba(155, 35, 53, 0.4);
    border-radius: 8px;
    background-color: rgba(155, 35, 53, 0.02);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: 150px;
}

.upload-zone:hover {
    border-color: rgba(155, 35, 53, 0.8);
    background-color: rgba(155, 35, 53, 0.05);
}

.upload-zone-small {
    min-height: 150px;
}

.avatar-preview-container {
    text-align: center;
}

.gap-2 {
    gap: 8px;
}
</style>
