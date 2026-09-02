<template>
    <v-form ref="formRef">
        <LazyGlobalsFormFieldErrors :errors="errors" />

        <!-- Existing Credit Cards -->
        <div v-if="existingCreditCards.length > 0" class="mb-6">
            <h3 class="text-h6 mb-4">Existing Credit Cards</h3>
            <v-card
                v-for="card in existingCreditCards"
                :key="card.id"
                class="mb-3"
                variant="outlined"
            >
                <v-card-text class="d-flex align-center justify-space-between">
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
                        :disabled="card.isActive"
                        :loading="togglingCardId === card.id"
                        @update:model-value="toggleCreditCardActive(card.id, !!$event)"
                    />
                </v-card-text>
            </v-card>
        </div>

        <!-- Billing Details -->
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
                                label="Company"
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
                            name="billingAddress"
                            validate-on-blur
                        >
                            <v-text-field
                                :model-value="field.value"
                                label="Address *"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                @update:model-value="field.onChange"
                                @blur="field.onBlur"
                            />
                        </Field>
                    </v-col>
                    <v-col cols="12" md="4">
                        <Field v-slot="{ field, errorMessage }" name="billingCity" validate-on-blur>
                            <v-text-field
                                :model-value="field.value"
                                label="City *"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                @update:model-value="field.onChange"
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
                                :items="billingStateOptions"
                                item-title="title"
                                item-value="value"
                                label="State *"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                @update:model-value="field.onChange"
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
                                label="Postal Code *"
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
                            name="billingCountryCode"
                            validate-on-blur
                        >
                            <v-select
                                :model-value="field.value"
                                :items="countryOptions"
                                item-title="title"
                                item-value="value"
                                label="Country *"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                @update:model-value="
                                    (val) => handleBillingCountryChange(field.onChange, val)
                                "
                                @blur="field.onBlur"
                            />
                        </Field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>

        <!-- Credit Card Details -->
        <v-card class="mb-4" elevation="0" variant="outlined">
            <v-card-title class="text-h6">Credit Card Details</v-card-title>
            <v-card-text>
                <v-alert
                    v-if="existingCreditCards.length >= MAX_CREDIT_CARDS"
                    type="warning"
                    variant="tonal"
                    class="mb-4"
                >
                    A customer can have at most {{ MAX_CREDIT_CARDS }} credit cards.
                </v-alert>
                <v-alert type="info" class="mb-4" variant="tonal">
                    Credit card details are not displayed for security reasons. Enter new details to
                    update the card.
                </v-alert>
                <v-row>
                    <v-col cols="12" md="6">
                        <Field
                            v-slot="{ field, errorMessage }"
                            name="creditCard.cardNumber"
                            validate-on-blur
                        >
                            <v-text-field
                                :model-value="field.value"
                                label="Card Number"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                placeholder="Enter new card number"
                                @update:model-value="field.onChange"
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
                                label="CVC"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                placeholder="CVC"
                                @update:model-value="field.onChange"
                                @blur="field.onBlur"
                            />
                        </Field>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
        <div class="d-flex justify-end mt-4">
            <v-btn @click="$emit('cancel')" class="mr-2">Cancel</v-btn>
            <v-btn color="primary" :loading="isSubmitting" @click="handleBillingFormSubmit">
                Update Billing & Credit Card
            </v-btn>
        </div>
    </v-form>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useForm, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useCustomer } from '~/composables/useCustomer'
import { useCustomerCreditCards } from '~/composables/useCustomerCreditCards'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { CUSTOMER_LIMITS } from '~/constants/customer.constants'
import type { Customer } from '~/services/api/wrappers/customer.api'

const MAX_CREDIT_CARDS = CUSTOMER_LIMITS.CREDIT_CARDS

// Billing + Credit Card schema
const billingSchema = z.object({
    billingCompany: z.preprocess(
        (value) => (value === '' ? null : value),
        z.string().min(2).max(100).nullable().optional()
    ),
    billingAddress: z.string().min(10).max(100),
    billingCity: z.string().min(3).max(50),
    billingStateCode: z.string().min(2).max(10),
    billingPostalCode: z.string().min(5).max(10),
    billingCountryCode: z.string().min(2).max(5),
    creditCard: z
        .object({
            cardNumber: z.string().max(18),
            expMonth: z.string().max(2),
            expYear: z.string().max(4),
            isActive: z.boolean(),
            cvc: z.string().max(4),
        })
        .refine(
            (data) => {
                const hasAny = !!(
                    data.cardNumber?.trim() ||
                    data.expMonth?.trim() ||
                    data.expYear?.trim() ||
                    data.cvc?.trim()
                )
                if (hasAny) {
                    return !!(
                        data.cardNumber?.trim() &&
                        data.expMonth?.trim() &&
                        data.expYear?.trim() &&
                        data.cvc?.trim()
                    )
                }
                return true
            },
            {
                message: 'If any credit card field is entered, all fields are required',
                path: ['cardNumber'],
            }
        )
        .optional()
        .nullable(),
})

interface Props {
    customer: Customer | null
    fullCustomerData: Customer | null
    basicValues?: {
        firstName?: string
        lastName?: string
        phoneNumber?: string
    }
    initialData?: {
        billingCompany?: string | null
        billingAddress?: string
        billingCity?: string
        billingStateCode?: string
        billingPostalCode?: string
        billingCountryCode?: string
    }
}

const props = defineProps<Props>()
const emit = defineEmits<{
    submit: []
    cancel: []
}>()

const { updateCustomer } = useCustomer()
const {
    cards: existingCreditCards,
    fetchCards,
    addCard,
    activateCard,
} = useCustomerCreditCards(() => props.customer?.id ?? null)
const { countryOptions, fetchCountries, fetchStates } = useCountry()
const { success, errorFromError } = useToast()

const formRef = ref()
const isSubmitting = ref(false)
const selectedBillingCountryId = ref<string | null>(null)
const billingStateOptions = ref<Array<{ title: string; value: string }>>([])
const togglingCardId = ref<number | null>(null)

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

const { handleSubmit, setFieldValue, errors, resetForm } = useForm({
    validationSchema: toTypedSchema(billingSchema),
    initialValues: {
        billingCompany: null,
        billingAddress: '',
        billingCity: '',
        billingStateCode: '',
        billingPostalCode: '',
        billingCountryCode: '',
        creditCard: {
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvc: '',
            isActive: true,
        },
    },
    validateOnMount: false,
})

const handleBillingCountryChange = async (onChange: (value: any) => void, countryId: string) => {
    selectedBillingCountryId.value = countryId
    onChange(countryId)
    if (countryId) {
        const states = await fetchStates(countryId)
        billingStateOptions.value = states.map((s) => ({
            title: s.name,
            value: String(s.id),
        }))
    } else {
        billingStateOptions.value = []
    }
    setFieldValue('billingStateCode', '')
}

// Fetch credit cards
const fetchCreditCards = async () => {
    if (!props.customer) return
    try {
        await fetchCards()
    } catch (err) {
        console.error('Error fetching credit cards:', err)
    }
}

// Toggle credit card active status
const toggleCreditCardActive = async (cardId: number, isActive: boolean) => {
    if (!props.customer) return

    togglingCardId.value = cardId
    try {
        if (!isActive) return
        await activateCard(cardId)
        success(CUSTOMER_MESSAGES.CREDIT_CARD_ACTIVATE_SUCCESS)
    } catch (error) {
        console.error('Error toggling credit card:', error)
        errorFromError(error, CUSTOMER_MESSAGES.CREDIT_CARD_UPDATE_ERROR)
    } finally {
        togglingCardId.value = null
    }
}

// Load customer data from prop
const loadData = async () => {
    if (!props.fullCustomerData) return

    const fullCustomer = props.fullCustomerData

    // Load billing state options
    if (fullCustomer.billing?.countryCode) {
        selectedBillingCountryId.value = fullCustomer.billing.countryCode
        await handleBillingCountryChange(() => {}, fullCustomer.billing.countryCode)
        await nextTick()
        setFieldValue('billingStateCode', fullCustomer.billing.stateCode || '')
    }

    // Set billing form values
    const billingData = {
        billingCompany: fullCustomer.billing?.company || null,
        billingAddress: fullCustomer.billing?.address || '',
        billingCity: fullCustomer.billing?.city || '',
        billingStateCode: fullCustomer.billing?.stateCode || '',
        billingPostalCode: fullCustomer.billing?.postalCode || '',
        billingCountryCode: fullCustomer.billing?.countryCode || '',
        creditCard: {
            cardNumber: '',
            expMonth: '',
            expYear: '',
            cvc: '',
            isActive: true,
        },
    }

    resetForm({
        values: billingData,
        errors: {},
        touched: {},
    })

    await nextTick()

    // Explicitly set billing field values
    setFieldValue('billingCompany', billingData.billingCompany)
    setFieldValue('billingAddress', billingData.billingAddress)
    setFieldValue('billingCity', billingData.billingCity)
    setFieldValue('billingStateCode', billingData.billingStateCode)
    setFieldValue('billingPostalCode', billingData.billingPostalCode)
    setFieldValue('billingCountryCode', billingData.billingCountryCode)
    setFieldValue('creditCard', billingData.creditCard)

    // Load credit cards
    await fetchCreditCards()
}

// Form submission
const submitForm = handleSubmit(async (formValues) => {
    if (!props.customer) return

    isSubmitting.value = true
    try {
        const loadingTask = useLoadingTask('update-billing-address')
        await loadingTask.execute(async () => {
            if (!props.customer) return

            await updateCustomer(props.customer.id, {
                billingCompany: formValues.billingCompany ?? null,
                billingAddress: formValues.billingAddress,
                billingCity: formValues.billingCity,
                billingStateCode: formValues.billingStateCode,
                billingPostalCode: formValues.billingPostalCode,
                billingCountryCode: formValues.billingCountryCode,
            })

            const creditCard = formValues.creditCard
            const hasCardDetails = !!creditCard?.cardNumber?.trim()
            if (hasCardDetails && existingCreditCards.value.length < MAX_CREDIT_CARDS) {
                const ccData = {
                    firstName: props.basicValues?.firstName || props.customer.firstName,
                    lastName: props.basicValues?.lastName || props.customer.lastName,
                    company: formValues.billingCompany || undefined,
                    address: formValues.billingAddress,
                    city: formValues.billingCity,
                    stateCode: formValues.billingStateCode,
                    postalCode: formValues.billingPostalCode,
                    countryCode: formValues.billingCountryCode,
                    phoneNumber:
                        props.basicValues?.phoneNumber || props.customer.phoneNumber || undefined,
                    cardNumber: creditCard.cardNumber,
                    expMonth: creditCard.expMonth,
                    expYear: creditCard.expYear,
                    cvc: creditCard.cvc,
                }
                await addCard(ccData)
                await fetchCreditCards()
                setFieldValue('creditCard', null)
            }

            success(CUSTOMER_MESSAGES.BILLING_UPDATE_SUCCESS)
            emit('submit')
        })
    } catch (err) {
        console.error('Error updating billing address:', err)
        errorFromError(err, CUSTOMER_MESSAGES.BILLING_UPDATE_ERROR)
    } finally {
        isSubmitting.value = false
    }
})

const handleBillingFormSubmit = () => {
    submitForm()
}

// Watch for full customer data changes
watch(
    () => props.fullCustomerData,
    async (newCustomerData) => {
        if (newCustomerData) {
            await loadData()
        }
    },
    { immediate: true }
)

// Initialize countries
await fetchCountries()
</script>
