<template>
    <v-container fluid>
        <h1 class="text-h4 mb-4">Authorize.net Integration</h1>
        <v-card>
            <v-card-text>
                <v-form @submit.prevent="submitProfile">
                    <v-card variant="outlined" class="mb-4">
                        <v-card-title class="text-subtitle-1">Profile Owner</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="entityType">
                                        <v-select
                                            :model-value="field.value"
                                            :items="entityTypeOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="Profile Type *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="id">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Customer or Organisation ID *"
                                            type="number"
                                            min="1"
                                            step="1"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <v-card variant="outlined" class="mb-4">
                        <v-card-title class="text-subtitle-1">Billing Address</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="billing.email">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Email *"
                                            type="email"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="billing.firstName"
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="First Name *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="billing.lastName"
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Last Name *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field v-slot="{ field, errorMessage }" name="billing.company">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Company"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="billing.phoneNumber"
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Phone Number"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12">
                                    <Field v-slot="{ field, errorMessage }" name="billing.address">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Address *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field v-slot="{ field, errorMessage }" name="billing.city">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="City *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field v-slot="{ field, errorMessage }" name="billing.stateCode">
                                        <v-select
                                            :model-value="field.value"
                                            :items="stateOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="State *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="billing.postalCode"
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Postal Code *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <Field v-slot="{ field, errorMessage }" name="billing.countryCode">
                                        <v-select
                                            :model-value="field.value"
                                            :items="countryOptions"
                                            item-title="title"
                                            item-value="value"
                                            label="Country *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="changeCountry(field.onChange, $event)"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <v-card variant="outlined">
                        <v-card-title class="text-subtitle-1">Credit Card</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <Field
                                        v-slot="{ field, errorMessage }"
                                        name="card.cardNumber"
                                    >
                                        <v-text-field
                                            :model-value="field.value"
                                            label="Card Number *"
                                            inputmode="numeric"
                                            autocomplete="cc-number"
                                            maxlength="19"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field v-slot="{ field, errorMessage }" name="card.expMonth">
                                        <v-select
                                            :model-value="field.value"
                                            :items="monthOptions"
                                            label="Month *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field v-slot="{ field, errorMessage }" name="card.expYear">
                                        <v-select
                                            :model-value="field.value"
                                            :items="yearOptions"
                                            label="Year *"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                                <v-col cols="12" md="2">
                                    <Field v-slot="{ field, errorMessage }" name="card.cvc">
                                        <v-text-field
                                            :model-value="field.value"
                                            label="CVC *"
                                            inputmode="numeric"
                                            autocomplete="cc-csc"
                                            maxlength="4"
                                            variant="outlined"
                                            :error-messages="errorMessage"
                                            @update:model-value="field.onChange"
                                            @blur="field.onBlur"
                                        />
                                    </Field>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>

                    <div class="d-flex justify-end mt-4">
                        <v-btn color="primary" type="submit" :loading="loading" :disabled="!canCreateCard">
                            Create Customer Profile
                        </v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Field, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { AUTHORIZE_NET_PERMISSIONS } from '~/constants/integration-permissions.constants'
import { CUSTOMER_CREDIT_CARD_PERMISSIONS } from '~/components/customers/customer-credit-card.permissions'
import { ORGANISATION_CREDIT_CARD_PERMISSIONS } from '~/components/organisations/organisation-credit-card.permissions'
import { useToast } from '~/composables/useToast'
import {
    authorizeNetProfileFormSchema,
    type AuthorizeNetProfileForm,
} from '~/schemas/authorize-net.schema'
import type { CreateAuthorizeNetProfileInput } from '~/types/authorize-net.types'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: AUTHORIZE_NET_PERMISSIONS.WRITE },
})

const authorizeNet = useAuthorizeNet()
const access = useAccessStore()
const { countryOptions, fetchCountries, fetchStates } = useCountry()
const loading = ref(false)
const stateOptions = ref<Array<{ title: string; value: string }>>([])
const { successFromResponse, errorFromError } = useToast()

const entityTypeOptions = [
    { title: 'Organisation', value: 'organisation' },
    { title: 'Customer', value: 'customer' },
]
const monthOptions = Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, '0')
)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 16 }, (_, index) => String(currentYear + index))

const initialValues: AuthorizeNetProfileForm = {
    id: 1,
    entityType: 'organisation',
    billing: {
        email: '',
        firstName: '',
        lastName: '',
        company: '',
        address: '',
        city: '',
        stateCode: '',
        postalCode: '',
        countryCode: '',
        phoneNumber: '',
    },
    card: { cardNumber: '', expMonth: '', expYear: '', cvc: '' },
}

const { handleSubmit, resetForm, setFieldValue, values } = useForm<AuthorizeNetProfileForm>({
    validationSchema: toTypedSchema(authorizeNetProfileFormSchema),
    initialValues,
})

const canCreateCard = computed((): boolean => {
    if (values.entityType === 'customer') {
        return access.can(CUSTOMER_CREDIT_CARD_PERMISSIONS.CREATE)
    }
    return access.can(ORGANISATION_CREDIT_CARD_PERMISSIONS.CREATE, Number(values.id))
})

onMounted(async (): Promise<void> => {
    await fetchCountries()
})

const changeCountry = async (
    onChange: (value: string) => void,
    countryCode: string
): Promise<void> => {
    onChange(countryCode)
    setFieldValue('billing.stateCode', '')
    if (!countryCode) {
        stateOptions.value = []
        return
    }
    const states = await fetchStates(countryCode)
    stateOptions.value = states.map((state) => ({ title: state.name, value: String(state.id) }))
}

const submitProfile = handleSubmit(async (values): Promise<void> => {
    loading.value = true
    try {
        const request: CreateAuthorizeNetProfileInput = {
            id: values.id,
            entityType: values.entityType,
            billing: values.billing,
            card: values.card,
        }
        const response = await authorizeNet.createCustomerProfile(request)
        if (response.success) {
            successFromResponse(response, 'Customer profile created successfully!')
            resetForm({ values: initialValues })
        }
    } catch (error) {
        console.error('Error creating profile:', error)
        errorFromError(error, 'Failed to create customer profile')
    } finally {
        loading.value = false
    }
})
</script>
