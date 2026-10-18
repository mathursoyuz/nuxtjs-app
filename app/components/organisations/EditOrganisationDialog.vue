<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        scrollable
        persistent
    >
        <v-card>
            <v-card-title class="d-flex align-center justify-space-between bg-primary">
                <span class="text-h5">Edit Organisation</span>
                <v-btn icon variant="text" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider />

            <v-card-text class="pa-0">
                <v-tabs color="primary" v-model="tab" class="px-5">
                    <v-tab value="basic">Basic Information</v-tab>
                    <v-tab value="billing">Billing & Credit Cards</v-tab>
                </v-tabs>

                <v-divider></v-divider>

                <v-window v-model="tab">
                    <!-- Basic Info Tab -->
                    <v-window-item value="basic">
                        <v-form ref="basicFormRef" v-model="basicFormValid">
                            <v-sheet class="pa-10">
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
                                            :existing-image-url="
                                                props.organisation?.logo
                                                    ? `${runtimeConfig.public.apiBaseUrl}/uploads/uploads/organisations/${props.organisation.logo}`
                                                    : null
                                            "
                                        />
                                    </v-col>
                                </v-row>
                            </v-sheet>
                        </v-form>
                    </v-window-item>

                    <!-- Billing & Credit Cards Tab -->
                    <v-window-item value="billing">
                        <v-form ref="billingFormRef" v-model="billingFormValid">
                            <v-sheet class="pa-10">
                                <!-- Existing Credit Cards -->
                                <div v-if="existingCreditCards.length > 0" class="mb-6">
                                    <h3 class="text-h6 mb-4">Existing Credit Cards</h3>
                                    <v-card
                                        v-for="card in existingCreditCards"
                                        :key="card.id"
                                        class="mb-3"
                                        variant="outlined"
                                    >
                                        <v-card-text
                                            class="d-flex align-center justify-space-between"
                                        >
                                            <div>
                                                <div class="text-body-1 font-weight-medium">
                                                    **** **** **** {{ card.lastFour }}
                                                </div>
                                                <div class="text-caption text-medium-emphasis">
                                                    Expires: {{ card.expMonth }}/{{ card.expYear }}
                                                </div>
                                            </div>
                                            <v-switch
                                                :model-value="card.isActive"
                                                label="Active"
                                                color="primary"
                                                hide-details
                                                :loading="togglingCardId === card.id"
                                                @update:model-value="
                                                    toggleCreditCardActive(card.id, !!$event)
                                                "
                                            />
                                        </v-card-text>
                                    </v-card>
                                </div>

                                <!-- Billing Information -->
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

                                <!-- New Credit Card -->
                                <v-divider class="my-6" />
                                <h3 class="text-h6 mb-4">Add New Credit Card</h3>
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
                                </v-row>
                            </v-sheet>
                        </v-form>
                    </v-window-item>
                </v-window>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :loading="loading"
                    :disabled="tab === 'basic' ? !basicFormValid : !billingFormValid"
                    @click="handleSubmit"
                >
                    Update
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useNuxtApp } from '#app'

import ImageUpload from '~/components/forms/ImageUpload.vue'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { useOrganisation } from '~/composables/useOrganisation'
import { ORGANISATION_MESSAGES } from '~/constants/messages.constants'
import type { Organisation } from '~/types/organisation.types'
import type { OrganisationCreditCard } from '~/services/api/wrappers/organisation-credit-card.api'

interface Props {
    modelValue: boolean
    organisation: Organisation | null
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
const runtimeConfig = useRuntimeConfig()

const basicFormRef = ref()
const billingFormRef = ref()
const basicFormValid = ref(false)
const billingFormValid = ref(false)
const loading = ref(false)
const tab = ref('basic')
const logoFile = ref<File | null>(null)
const checkingEmail = ref(false)
const emailUniqueError = ref<string | null>(null)
const billingCountryCode = ref<string | null>(null)
const billingStateOptions = ref<Array<{ title: string; value: string }>>([])
const existingCreditCards = ref<OrganisationCreditCard[]>([])
const togglingCardId = ref<number | null>(null)
const quickbooksCompanies = ref<Array<{ id: number; name: string; realmId: string; slug: string }>>(
    []
)
const loadingCompanies = ref(false)

const formData = ref({
    name: '',
    email: '',
    websiteUrl: '',
    shippingCost: 0,
    logo: '',
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

// Check if any credit card field is filled
const hasAnyCreditCardData = computed(() => {
    return !!(
        creditCardData.value.cardNumber?.trim() ||
        creditCardData.value.expMonth?.trim() ||
        creditCardData.value.expYear?.trim() ||
        creditCardData.value.cvc?.trim()
    )
})

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
    // Conditional required: required only if credit card data exists
    requiredIfCard: (v: unknown) => {
        if (!hasAnyCreditCardData.value) return true
        return !!v || 'This field is required when adding a credit card'
    },
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

    // Don't check if email hasn't changed
    if (props.organisation && formData.value.email.toLowerCase() === props.organisation.email.toLowerCase()) {
        emailUniqueError.value = ''
        return
    }

    checkingEmail.value = true
    emailUniqueError.value = null

    try {
        const organisationId = props.organisation?.id
        const response = await organisationApi.checkEmailExists(formData.value.email, organisationId)
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
        // Trigger validation update
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

const loadCreditCards = async () => {
    if (!props.organisation) return
    try {
        const response = await creditCardApi.getAllOrganisationCreditCards(props.organisation.id)
        if (response.success && response.data) {
            existingCreditCards.value = response.data
        }
    } catch (error) {
        console.error('Error loading credit cards:', error)
    }
}

const toggleCreditCardActive = async (cardId: number, isActive: boolean) => {
    if (!props.organisation) return

    togglingCardId.value = cardId
    try {
        // If activating, deactivate all other cards first
        if (isActive) {
            for (const card of existingCreditCards.value) {
                if (card.id !== cardId && card.isActive) {
                    await creditCardApi.toggleActive(props.organisation.id, card.id, false)
                }
            }
        }

        const response = await creditCardApi.toggleActive(props.organisation.id, cardId, isActive)
        if (response.success) {
            successFromResponse(
                response,
                isActive
                    ? ORGANISATION_MESSAGES.CREDIT_CARD_ACTIVATE_SUCCESS
                    : ORGANISATION_MESSAGES.CREDIT_CARD_DEACTIVATE_SUCCESS
            )
            await loadCreditCards()
        }
    } catch (error) {
        console.error('Error toggling credit card:', error)
        errorFromError(error, ORGANISATION_MESSAGES.CREDIT_CARD_UPDATE_ERROR)
    } finally {
        togglingCardId.value = null
    }
}

const loadOrganisationData = async () => {
    if (!props.organisation) {
        return
    }

    formData.value = {
        name: props.organisation.name || '',
        email: props.organisation.email || '',
        websiteUrl: props.organisation.websiteUrl || '',
        logo: '',
        shippingCost:
            typeof props.organisation.shippingCost === 'string'
                ? parseFloat(props.organisation.shippingCost) || 0
                : props.organisation.shippingCost || 0,
        referralCode: props.organisation.referralCode || null,
        description: props.organisation.description || null,
        isActive: props.organisation.isActive ?? true,
        billingFirstName: props.organisation.billingFirstName || '',
        billingLastName: props.organisation.billingLastName || '',
        billingCompany: props.organisation.billingCompany || '',
        billingAddress: props.organisation.billingAddress || '',
        billingCity: props.organisation.billingCity || '',
        billingStateCode: props.organisation.billingStateCode || '',
        billingPostalCode: props.organisation.billingPostalCode || '',
        billingCountryCode: props.organisation.billingCountryCode || '',
        billingPhone: props.organisation.billingPhone || '',
        squareAccessToken: props.organisation.squareAccessToken || null,
        qbRealmId: props.organisation.qbRealmId || null,
    }

    billingCountryCode.value = props.organisation.billingCountryCode || null
    if (props.organisation.billingCountryCode) {
        await handleBillingCountryChange(props.organisation.billingCountryCode)
        // Set state after states are loaded
        if (props.organisation.billingStateCode) {
            formData.value.billingStateCode = props.organisation.billingStateCode
        }
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
    await loadCreditCards()
}

const handleSubmit = async () => {
    if (!props.organisation) return

    // Validate the current tab's form
    let isValid = false
    if (tab.value === 'basic') {
        isValid = basicFormRef.value?.validate() ?? false
        if (!isValid) {
            return // Don't proceed if basic form has errors
        }
    } else if (tab.value === 'billing') {
        isValid = billingFormRef.value?.validate() ?? false
        if (!isValid) {
            return // Don't proceed if billing form has errors
        }
    }

    if (!isValid) {
        return // Safety check
    }

    loading.value = true
    try {
        const updateData = { ...formData.value }
        delete (updateData as any).password
        // Ensure shippingCost is a number
        updateData.shippingCost =
            typeof updateData.shippingCost === 'string'
                ? parseFloat(updateData.shippingCost)
                : Number(updateData.shippingCost) || 0

        // Update organisation basic info if on basic tab, or billing info if on billing tab
        if (tab.value === 'basic') {
            // Only update basic organisation information
            const response = await organisationApi.updateOrganisation(props.organisation.id, updateData)
            if (response.success) {
                successFromResponse(response, ORGANISATION_MESSAGES.UPDATE_SUCCESS)

                // Upload logo if provided
                if (logoFile.value) {
                    try {
                        await uploadLogo(props.organisation.id, logoFile.value)
                    } catch (error) {
                        console.error('Error uploading logo:', error)
                        warning(ORGANISATION_MESSAGES.LOGO_UPDATE_FAILED)
                    }
                }

                emit('submit')
                emit('update:modelValue', false)
            }
        } else if (tab.value === 'billing') {
            const creditCardResponse = await creditCardApi.createOrganisationCreditCard(props.organisation.id, {
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
            })
            successFromResponse(creditCardResponse, ORGANISATION_MESSAGES.CREDIT_CARD_ADD_SUCCESS)

            emit('submit')
            emit('update:modelValue', false)
        }
    } catch (error) {
        console.error('Error updating organisation:', error)
        errorFromError(error, ORGANISATION_MESSAGES.UPDATE_ERROR)
    } finally {
        loading.value = false
    }
}

watch(
    () => props.modelValue,
    async (isOpen) => {
        if (isOpen) {
            await loadOrganisationData()
        }
    }
)

watch(
    () => props.organisation,
    async () => {
        if (props.modelValue) {
            await loadOrganisationData()
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
const { pending: editOrganisationDataPending } = await useLazyAsyncData(
    'edit-organisation-form-data',
    async () => {
        await fetchCountries()
        await loadQuickbooksCompanies()
        if (props.modelValue) {
            loadOrganisationData()
        }
    }
)
</script>
