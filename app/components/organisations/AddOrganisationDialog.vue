<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="900"
        scrollable
        persistent
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between">
                <span class="text-h5">Create Organisation</span>
                <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-form ref="formRef" v-model="valid">
                    <v-tabs v-model="tab" class="px-4 pt-4">
                        <v-tab value="basic">Basic Information</v-tab>
                        <v-tab value="billing" :disabled="!organisationCreated">
                            Billing & Credit Cards
                        </v-tab>
                    </v-tabs>

                    <v-window v-model="tab" class="pa-4">
                        <!-- Basic Info Tab -->
                        <v-window-item value="basic">
                            <v-form ref="basicFormRef" v-model="basicFormValid">
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.name"
                                            label="Organisation Name"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.email"
                                            label="Email"
                                            type="email"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[
                                                rules.required,
                                                rules.email,
                                                rules.emailUnique,
                                            ]"
                                            required
                                            :loading="checkingEmail"
                                            @blur="handleEmailBlur"
                                            @input="emailUniqueError = null"
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.websiteUrl"
                                            label="Website URL"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model.number="formData.shippingCost"
                                            label="Shipping Cost"
                                            type="number"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required, rules.min(1)]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.referralCode"
                                            label="Referral Code"
                                            variant="outlined"
                                            density="compact"
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-switch
                                            v-model="formData.isActive"
                                            label="Active"
                                            color="primary"
                                            hide-details
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-select
                                            v-model="formData.qbRealmId"
                                            label="QuickBooks Company"
                                            :items="quickbooksCompanies"
                                            variant="outlined"
                                            density="compact"
                                            item-title="name"
                                            item-value="realmId"
                                            clearable
                                            :loading="loadingCompanies"
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.squareAccessToken"
                                            label="Square Access Token"
                                            type="password"
                                            variant="outlined"
                                            density="compact"
                                            hint="Enter Square access token for payment processing"
                                            persistent-hint
                                        />
                                    </v-col>

                                    <v-col cols="12">
                                        <label class="text-body-2 font-weight-medium mb-2 d-block">
                                            Description
                                        </label>
                                        <FormsRichTextEditor
                                            :model-value="formData.description || ''"
                                            @update:model-value="formData.description = $event"
                                        />
                                    </v-col>

                                    <v-col cols="12">
                                        <label class="text-body-2 font-weight-medium mb-2 d-block">
                                            Logo
                                        </label>
                                        <ImageUpload
                                            v-model="logoFile"
                                            title="Drop logo here to upload"
                                            hint="Recommended size: 300x300px. Max size: 2MB"
                                        />
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-window-item>

                        <!-- Billing & Credit Cards Tab -->
                        <v-window-item value="billing">
                            <v-form ref="billingFormRef" v-model="billingFormValid">
                                <h3 class="text-h6 mb-4">Billing Information</h3>
                                <v-row>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.billingFirstName"
                                            label="First Name"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.billingLastName"
                                            label="Last Name"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.billingCompany"
                                            label="Company"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.billingCompany]"
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.billingPhone"
                                            label="Phone"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="formData.billingAddress"
                                            label="Address"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.billingCity"
                                            label="City"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-select
                                            v-model="billingCountryCode"
                                            label="Country"
                                            :items="countryOptions"
                                            variant="outlined"
                                            density="compact"
                                            item-title="title"
                                            item-value="value"
                                            :rules="[rules.required]"
                                            required
                                            @update:model-value="handleBillingCountryChange"
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-select
                                            v-model="formData.billingStateCode"
                                            label="State"
                                            :items="billingStateOptions"
                                            variant="outlined"
                                            density="compact"
                                            item-title="title"
                                            item-value="value"
                                            :disabled="!billingCountryCode"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            v-model="formData.billingPostalCode"
                                            label="Postal Code"
                                            variant="outlined"
                                            density="compact"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>
                                </v-row>

                                <v-divider class="my-6" />

                                <h3 class="text-h6 mb-4">Credit Card Information</h3>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field
                                            v-model="creditCardData.cardNumber"
                                            label="Card Number"
                                            variant="outlined"
                                            density="compact"
                                            placeholder="1234 5678 9012 3456"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <v-select
                                            v-model="creditCardData.expMonth"
                                            label="Expiry Month"
                                            :items="monthOptions"
                                            variant="outlined"
                                            density="compact"
                                            item-title="title"
                                            item-value="value"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <v-select
                                            v-model="creditCardData.expYear"
                                            label="Expiry Year"
                                            :items="yearOptions"
                                            variant="outlined"
                                            density="compact"
                                            item-title="title"
                                            item-value="value"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12" md="4">
                                        <v-text-field
                                            v-model="creditCardData.cvc"
                                            label="CVC"
                                            variant="outlined"
                                            density="compact"
                                            placeholder="123"
                                            maxlength="4"
                                            :rules="[rules.required]"
                                            required
                                        />
                                    </v-col>

                                    <v-col cols="12">
                                        <v-switch
                                            v-model="creditCardData.isActive"
                                            label="Set as Active Card"
                                            color="primary"
                                            hide-details
                                        />
                                    </v-col>
                                </v-row>
                            </v-form>
                        </v-window-item>
                    </v-window>
                </v-form>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
                <v-spacer />
                <v-btn
                    v-if="tab === 'basic'"
                    color="primary"
                    :loading="loading"
                    :disabled="!basicFormValid"
                    prepend-icon="mdi-check"
                    @click="handleSubmitBasic"
                >
                    Create Organisation
                </v-btn>
                <v-btn
                    v-else
                    color="primary"
                    :loading="loading"
                    :disabled="!billingFormValid"
                    prepend-icon="mdi-check"
                    @click="handleSubmitBilling"
                >
                    Add Billing & Credit Card
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNuxtApp } from '#app'

import ImageUpload from '~/components/forms/ImageUpload.vue'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { useOrganisation } from '~/composables/useOrganisation'
import { ORGANISATION_MESSAGES } from '~/constants/messages.constants'

interface Props {
    modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const nuxtApp = useNuxtApp()
const organisationApi =
    nuxtApp.$organisationApi as import('~/services/api/wrappers/organisation.api').OrganisationApiService
const creditCardApi =
    nuxtApp.$organisationCreditCardApi as import('~/services/api/wrappers/organisation-credit-card.api').OrganisationCreditCardApiService
const quickbooksApi =
    nuxtApp.$quickbooksApi as import('~/services/api/wrappers/quickbooks.api').QuickBooksApiService
const { countryOptions, fetchCountries, fetchStates } = useCountry()
const { successFromResponse, errorFromError, warning } = useToast()
const { uploadLogo } = useOrganisation()

const formRef = ref()
const basicFormRef = ref()
const billingFormRef = ref()
const valid = ref(false)
const basicFormValid = ref(false)
const billingFormValid = ref(false)
const tab = ref('basic')
const loading = ref(false)
const organisationCreated = ref(false)
const createdOrganisationId = ref<number | null>(null)
const logoFile = ref<File | null>(null)
const checkingEmail = ref(false)
const emailUniqueError = ref<string | null>(null)
const billingCountryCode = ref<string | null>(null)
const billingStateOptions = ref<Array<{ title: string; value: string }>>([])
const quickbooksCompanies = ref<Array<{ id: number; name: string; realmId: string; slug: string }>>(
    []
)
const loadingCompanies = ref(false)

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

const formData = ref({
    name: '',
    email: '',
    websiteUrl: '',
    password: 'admin',
    logo: '',
    shippingCost: 0,
    referralCode: null as string | null,
    description: null as string | null,
    isActive: true,
    billingFirstName: '',
    billingLastName: '',
    billingCompany: '',
    billingAddress: '',
    billingCity: '',
    billingStateCode: '',
    billingPostalCode: '',
    billingCountryCode: '',
    billingPhone: '',
    squareAccessToken: null as string | null,
    qbRealmId: null as string | null,
})

const creditCardData = ref({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    isActive: true,
})

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
    email: (v: string) => {
        if (!v) return 'Email is required'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(v) || 'Must be a valid email address'
    },
    emailUnique: () =>
        emailUniqueError.value === null ||
        emailUniqueError.value === '' ||
        'This email is already in use',
    min: (min: number) => (v: number) => v >= min || `Value must be at least ${min}`,
    // Billing company: optional, but if entered, min 5 chars
    billingCompany: (v: string) => {
        if (!v || !v.trim()) return true // Optional
        return v.trim().length >= 5 || 'Company name must be at least 5 characters if provided'
    },
}

const handleEmailBlur = async () => {
    if (!formData.value.email || !rules.email(formData.value.email)) {
        emailUniqueError.value = null
        return
    }

    checkingEmail.value = true
    emailUniqueError.value = null

    try {
        const response = await organisationApi.checkEmailExists(formData.value.email)
        if (response.success && response.data) {
            if (!response.data.available) {
                emailUniqueError.value = 'This email is already in use'
            } else {
                emailUniqueError.value = ''
            }
        }
    } catch (error) {
        console.error('Error checking email:', error)
        emailUniqueError.value = ORGANISATION_MESSAGES.EMAIL_CHECK_ERROR
    } finally {
        checkingEmail.value = false
        if (basicFormRef.value) {
            basicFormRef.value.validate()
        }
    }
}

const handleBillingCountryChange = async (countryId: string) => {
    billingCountryCode.value = countryId
    formData.value.billingCountryCode = countryId
    if (countryId) {
        const states = await fetchStates(countryId)
        billingStateOptions.value = states.map((s) => ({
            title: s.name,
            value: s.id,
        }))
    } else {
        billingStateOptions.value = []
    }
    formData.value.billingStateCode = ''
}

const resetForm = () => {
    formData.value = {
        name: '',
        email: '',
        websiteUrl: '',
        password: 'admin',
        logo: '',
        shippingCost: 0,
        referralCode: null,
        description: null,
        isActive: true,
        billingFirstName: '',
        billingLastName: '',
        billingCompany: '',
        billingAddress: '',
        billingCity: '',
        billingStateCode: '',
        billingPostalCode: '',
        billingCountryCode: '',
        billingPhone: '',
        squareAccessToken: null,
        qbRealmId: null,
    }
    creditCardData.value = {
        cardNumber: '',
        expMonth: '',
        expYear: '',
        cvc: '',
        isActive: true,
    }
    logoFile.value = null
    emailUniqueError.value = null
    checkingEmail.value = false
    billingCountryCode.value = null
    billingStateOptions.value = []
    tab.value = 'basic'
    organisationCreated.value = false
    createdOrganisationId.value = null
    if (basicFormRef.value) {
        basicFormRef.value.resetValidation()
    }
    if (billingFormRef.value) {
        billingFormRef.value.resetValidation()
    }
}

const handleSubmitBasic = async () => {
    if (!basicFormRef.value?.validate()) {
        return
    }

    loading.value = true
    try {
        const createData = { ...formData.value }
        // Ensure shippingCost is a number
        createData.shippingCost =
            typeof createData.shippingCost === 'string'
                ? parseFloat(createData.shippingCost)
                : Number(createData.shippingCost) || 0

        const response = await organisationApi.createOrganisation(createData)

        if (response.success && response.data) {
            createdOrganisationId.value = response.data.id
            organisationCreated.value = true
            successFromResponse(response, ORGANISATION_MESSAGES.CREATE_SUCCESS)

            // Upload logo if provided
            if (logoFile.value) {
                try {
                    await uploadLogo(response.data.id, logoFile.value)
                } catch (error) {
                    console.error('Error uploading logo:', error)
                    warning(ORGANISATION_MESSAGES.LOGO_UPLOAD_FAILED)
                }
            }

            // Switch to billing tab
            tab.value = 'billing'
        }
    } catch (error) {
        console.error('Error creating organisation:', error)
        errorFromError(error, ORGANISATION_MESSAGES.CREATE_ERROR)
    } finally {
        loading.value = false
    }
}

const handleSubmitBilling = async () => {
    if (!billingFormRef.value?.validate() || !createdOrganisationId.value) {
        return
    }

    loading.value = true
    try {
        const creditCardResponse = await creditCardApi.createOrganisationCreditCard(
            createdOrganisationId.value,
            {
                cardNumber: creditCardData.value.cardNumber,
                expMonth: creditCardData.value.expMonth,
                expYear: creditCardData.value.expYear,
                cvc: creditCardData.value.cvc,
                isActive: creditCardData.value.isActive,
                billingFirstName: formData.value.billingFirstName,
                billingLastName: formData.value.billingLastName,
                billingCompany: formData.value.billingCompany,
                billingAddress: formData.value.billingAddress,
                billingCity: formData.value.billingCity,
                billingStateCode: formData.value.billingStateCode,
                billingPostalCode: formData.value.billingPostalCode,
                billingCountryCode: formData.value.billingCountryCode,
                billingPhone: formData.value.billingPhone,
            }
        )

        if (creditCardResponse.success) {
            successFromResponse(creditCardResponse, ORGANISATION_MESSAGES.CREDIT_CARD_ADD_SUCCESS)
            resetForm()
            emit('submit')
            emit('update:modelValue', false)
        }
    } catch (error) {
        console.error('Error adding billing and credit card:', error)
        errorFromError(error, ORGANISATION_MESSAGES.CREDIT_CARD_ADD_ERROR)
    } finally {
        loading.value = false
    }
}

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen) {
            resetForm()
        }
    }
)

const loadQuickbooksCompanies = async () => {
    loadingCompanies.value = true
    try {
        const response = await quickbooksApi.getCompanies()
        if (response.success && response.data) {
            quickbooksCompanies.value = response.data
        }
    } catch (error) {
        console.error('Error loading QuickBooks companies:', error)
    } finally {
        loadingCompanies.value = false
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: addOrganisationDataPending } = await useLazyAsyncData(
    'add-organisation-form-data',
    async () => {
        await fetchCountries()
        await loadQuickbooksCompanies()
    }
)
</script>
