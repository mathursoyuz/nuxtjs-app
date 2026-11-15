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
            <DialogsDialogHeader
                title="Add customer"
                :organisation-name="organisations.find((item) => item.id === organisationId)?.name"
                entity-label="Customer"
                entity-name="New customer"
                @close="$emit('update:modelValue', false)"
            >
                <template #actions>
                    <v-btn
                        color="on-primary"
                        variant="outlined"
                        :loading="isSubmitting"
                        @click="handleSubmitForm"
                    >
                        Create customer
                    </v-btn>
                </template>
            </DialogsDialogHeader>

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
                                                hasOrganisationError
                                                    ? 'Organisation is required'
                                                    : ''
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
                                    <CustomersCustomerAvatarPicker v-model="avatarFile" />
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

                    <CustomersAddCustomerBillingFields
                        :country-options="countryOptions"
                        :billing-state-options="billingStateOptions"
                        @country-change="handleBillingCountryChange"
                    />
                    <CustomersAddCustomerShippingFields
                        :country-options="countryOptions"
                        :shipping-state-options="shippingStateOptions"
                        :copy-billing-to-shipping="copyBillingToShipping"
                        @country-change="handleShippingCountryChange"
                        @update:copy-billing-to-shipping="handleCopyBillingToShipping"
                    />
                    <CustomersAddCustomerCreditCardFields />
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
import {
    buildInternationalPhoneNumber,
    parseInternationalPhoneNumber,
} from '~/utils/phone-number.util'

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

const { createCustomer, stageCreateAvatar, getCreateFormData, checkCreateEmailExists } =
    useCustomer()
const {
    countries,
    phoneCountryCodes,
    phoneCountryCodeOptions,
    countryOptions,
    fetchCountries,
    fetchPhoneCountryCodes,
    fetchStates,
} = useCountry()
const { errorFromError, success } = useToast()

const formRef = ref()
const copyBillingToShipping = ref(false)
const checkingEmail = ref(false)

const selectedOrganisationId = ref<number>(
    props.organisationId && props.organisationId > 0
        ? props.organisationId
        : DEFAULT_ORGANISATION_ID
)
const avatarFile = ref<File | null>(null)
let locationRequestId = 0
const formLocations = ref<Array<{ id: number; name: string }>>([])

// Phone number state
const selectedCountryCode = ref<string>('US')
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
        return { id: c.code, name: c.label }
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
    return formLocations.value.map((loc) => ({
        id: loc.id,
        name: loc.name,
    }))
})

// Country and state options
const billingStateOptions = ref<Array<{ title: string; value: string | number }>>([])
const shippingStateOptions = ref<Array<{ title: string; value: string | number }>>([])

const handleBillingCountryChange = async (countryId: string): Promise<void> => {
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

const handleShippingCountryChange = async (countryId: string): Promise<void> => {
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

const handleCopyBillingToShipping = (copy: boolean | null): void => {
    copyBillingToShipping.value = Boolean(copy)
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
const handleCountryCodeChange = (countryCode: string): void => {
    selectedCountryCode.value = countryCode
    updatePhoneNumberField()
}

const handlePhoneNumberChange = (value: string): void => {
    // Always try to auto-detect country code if phone country codes are loaded
    if (value && value.trim().length > 0 && phoneCountryCodes.value.length > 0) {
        // Try to parse and detect country code
        const parsed = parseInternationalPhoneNumber(value, phoneCountryCodes.value)
        if (parsed) {
            // Country code detected - update both fields
            selectedCountryCode.value = parsed.country.code
            phoneNumberValue.value = parsed.nationalNumber
            updatePhoneNumberField()
            return
        }
    }

    // No country code detected or empty value - just update the phone number
    phoneNumberValue.value = value || ''
    updatePhoneNumberField()
}

const updatePhoneNumberField = (): void => {
    const fullPhoneNumber = buildInternationalPhoneNumber(
        selectedCountryCode.value,
        phoneNumberValue.value,
        phoneCountryCodes.value
    )
    setFieldValue('phoneNumber', fullPhoneNumber)
}

// Email validation on blur
const handleEmailBlur = async (field: {
    value?: string
    onBlur: (e: Event) => void
}): Promise<void> => {
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
        const available = await checkCreateEmailExists(selectedOrganisationId.value, email)
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
            const stagedAvatar = avatarFile.value
                ? await stageCreateAvatar(selectedOrganisationId.value, avatarFile.value)
                : null
            const customerData: CreateCustomerFormData = {
                ...formValues,
                avatar: stagedAvatar,
                creditCard: hasAnyCreditCardField.value ? formValues.creditCard : null,
            }
            await createCustomer(customerData)

            success(CUSTOMER_MESSAGES.CREATE_SUCCESS)
            emit('update:modelValue', false)
            emit('submit')
            resetForm({ values: initialValues, errors: {}, touched: {} })
            copyBillingToShipping.value = false
            avatarFile.value = null
            // Reset phone number fields
            selectedCountryCode.value = 'US'
            phoneNumberValue.value = ''
        })
    } catch (error) {
        console.error('Error creating customer:', error)
        errorFromError(error, CUSTOMER_MESSAGES.CREATE_ERROR)
    }
})

const handleSubmitForm = async (): Promise<void> => {
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
        const initialOrganisationId = selectedOrganisationId.value || DEFAULT_ORGANISATION_ID
        selectedOrganisationId.value = initialOrganisationId
        setFieldValue('organisationId', initialOrganisationId)
        const { locations: availableLocations } = await getCreateFormData(initialOrganisationId)
        formLocations.value = availableLocations
        const firstLocationId = availableLocations[0]?.id
        if (firstLocationId) {
            setFieldValue('pickupLocation', firstLocationId)
            setFieldValue('signupLocation', firstLocationId)
        }
    }
)

watch(
    () => selectedOrganisationId.value,
    async (newOrganisationId) => {
        if (newOrganisationId && newOrganisationId > 0) {
            // Update form organisationId when selectedOrganisationId changes
            setFieldValue('organisationId', newOrganisationId)
            const requestId = ++locationRequestId
            const loadingTask = useLoadingTask('fetch-locations')
            await loadingTask.execute(async () => {
                const { locations: availableLocations } = await getCreateFormData(newOrganisationId)
                if (requestId !== locationRequestId) return
                formLocations.value = availableLocations
                const firstLocationId = availableLocations[0]?.id ?? 0
                setFieldValue('pickupLocation', firstLocationId)
                setFieldValue('signupLocation', firstLocationId)
            })
        }
    }
)

</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
