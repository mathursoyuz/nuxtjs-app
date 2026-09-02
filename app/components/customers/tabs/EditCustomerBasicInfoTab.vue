<template>
    <v-form ref="formRef">
        <LazyGlobalsFormFieldErrors :errors="errors" />
        <v-card class="mb-4" elevation="0" variant="outlined">
            <v-card-title class="text-h6">Basic Information</v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-select
                            v-model="selectedClientId"
                            :items="clientOptions"
                            item-title="name"
                            item-value="id"
                            label="Select Client *"
                            variant="outlined"
                            density="compact"
                            required
                            :error="hasClientError"
                            :error-messages="hasClientError ? 'Client is required' : ''"
                            hide-details="auto"
                            @update:model-value="handleClientChange"
                        ></v-select>
                    </v-col>
                    <v-col cols="12" md="6">
                        <Field v-slot="{ field, errorMessage }" name="firstName" validate-on-blur>
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
                    <v-col cols="12" md="6">
                        <Field v-slot="{ field, errorMessage }" name="lastName" validate-on-blur>
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
                    <v-col cols="12" md="6">
                        <Field v-slot="{ field, errorMessage }" name="email" validate-on-blur>
                            <v-text-field
                                :model-value="field.value"
                                label="Email *"
                                type="email"
                                variant="outlined"
                                density="compact"
                                :error-messages="errorMessage"
                                hide-details="auto"
                                :loading="checkingEmail"
                                @update:model-value="field.onChange"
                                @blur="handleEmailBlur(field)"
                            />
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
                        <div class="text-body-2 font-weight-medium mb-2">Avatar Image</div>
                        <div
                            v-if="!avatarPreview"
                            class="upload-zone upload-zone-small d-flex flex-column align-center justify-center pa-4"
                            @click="triggerAvatarInput"
                            @dragover.prevent
                            @drop.prevent="handleAvatarDrop"
                        >
                            <v-icon size="32" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
                            <div class="text-body-2 text-center">Drop Avatar here to upload</div>
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
                            <v-btn variant="text" color="error" size="small" @click="removeAvatar">
                                Remove
                            </v-btn>
                        </div>
                    </v-col>
                    <v-col cols="12" md="6">
                        <Field v-slot="{ field, errorMessage }" name="phoneNumber" validate-on-blur>
                            <div>
                                <label class="text-body-2 font-weight-medium mb-2 d-block">
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
                        <Field v-slot="{ field, errorMessage }" name="dob" validate-on-blur>
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
                                <label class="text-body-2 font-weight-medium mb-2 d-block">
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
                                    <v-radio label="HOLD FOR SHIPPING" :value="2"></v-radio>
                                </v-radio-group>
                                <div v-if="errorMessage" class="text-error text-caption mt-1">
                                    {{ errorMessage }}
                                </div>
                            </div>
                        </Field>
                    </v-col>
                    <v-col cols="12" md="6">
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
                    <v-col cols="12" md="6">
                        <Field v-slot="{ field }" name="isActive">
                            <v-switch
                                :model-value="field.value"
                                label="Is Active"
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
        <div class="d-flex justify-end mt-4">
            <v-btn @click="$emit('cancel')" class="mr-2">Cancel</v-btn>
            <v-btn color="primary" :loading="isSubmitting" @click="handleFormSubmit">
                Update Basic Info
            </v-btn>
        </div>
    </v-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useForm, Field } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { updateCustomerSchema, type UpdateCustomerFormData } from '~/schemas/customer.schema'
import { useCustomer } from '~/composables/useCustomer'
import { useLocation } from '~/composables/useLocation'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { DEFAULT_CLIENT_ID } from '~/constants/customer.constants'
import { getFullImageUrl } from '~/utils/image.util'
import type { Customer } from '~/services/api/wrappers/customer.api'
import type { PhoneCountryCode } from '~/services/api/wrappers/country.api'

// Helper function to parse phone number
function parsePhoneNumber(
    phoneNumber: string,
    phoneCountryCodes: PhoneCountryCode[]
): { countryCode: PhoneCountryCode; phoneNumber: string } | null {
    if (!phoneNumber || !phoneCountryCodes || phoneCountryCodes.length === 0) return null
    const cleaned = phoneNumber.replace(/[^\d+]/g, '')
    if (!cleaned || cleaned.length < 4) return null
    const sortedCodes = [...phoneCountryCodes].sort((a, b) => {
        const aCode = a.dialCode.replace('+', '')
        const bCode = b.dialCode.replace('+', '')
        return bCode.length - aCode.length
    })
    for (const country of sortedCodes) {
        const dialCode = country.dialCode.replace('+', '')
        const dialCodeWithPlus = `+${dialCode}`
        if (cleaned.startsWith(dialCodeWithPlus)) {
            const remaining = cleaned.substring(dialCodeWithPlus.length).trim()
            if (remaining.length > 0) {
                return { countryCode: country, phoneNumber: remaining }
            }
        } else if (cleaned.startsWith(dialCode)) {
            const remaining = cleaned.substring(dialCode.length).trim()
            if (remaining.length > 0) {
                if (dialCode.length === 1 && cleaned.length < 10) {
                    continue
                }
                return { countryCode: country, phoneNumber: remaining }
            }
        }
    }
    return null
}

interface Props {
    customer: Customer | null
    fullCustomerData: Customer | null
    clientId?: number
    clients?: Array<{ id: number; name: string }>
    initialData?: Partial<UpdateCustomerFormData>
}

const props = defineProps<Props>()
const emit = defineEmits<{
    submit: []
    cancel: []
    update: [data: Partial<UpdateCustomerFormData>]
}>()

const { updateCustomer, uploadImage, checkEmailExists } = useCustomer()
const { locations, fetchLocations } = useLocation()
const { phoneCountryCodes, phoneCountryCodeOptions, fetchPhoneCountryCodes } = useCountry()
const { success, error, errorFromError } = useToast()

const formRef = ref()
const isSubmitting = ref(false)
const checkingEmail = ref(false)
const selectedClientId = ref<number | null>(null)
const avatarInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const selectedCountryCode = ref<string>('+1')
const phoneNumberValue = ref<string>('')

const clientOptions = computed(() => {
    if (props.clients && props.clients.length > 0) {
        return props.clients
    }
    return []
})

const hasClientError = computed(() => {
    return (
        selectedClientId.value === null ||
        selectedClientId.value === undefined ||
        selectedClientId.value === 0
    )
})

const countryCodeOptions = computed(() => {
    return phoneCountryCodeOptions.value.map((c) => ({
        id: c.dialCode,
        name: c.label,
        flag: c.flag,
        dialCode: c.dialCode,
    }))
})

const locationOptions = computed(() => {
    return locations.value.map((loc) => ({
        id: loc.id,
        name: loc.name,
    }))
})

// Get empty initial values
const getInitialValues = (): UpdateCustomerFormData => {
    return {
        clientId: DEFAULT_CLIENT_ID,
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        pickupLocation: 0,
        signupLocation: 0,
        deliveryMethod: 1,
        dob: null,
        isAppUser: false,
        isActive: true,
        billingCompany: null,
        billingAddress: '',
        billingCity: '',
        billingStateCode: '',
        billingPostalCode: '',
        billingCountryCode: '',
        creditCard: null,
    }
}

const initialValues = getInitialValues()

const { handleSubmit, setFieldValue, values, errors, resetForm, setErrors } =
    useForm<UpdateCustomerFormData>({
        validationSchema: toTypedSchema(updateCustomerSchema),
        initialValues,
        validateOnMount: false,
    })

// Phone number handlers
const handleCountryCodeChange = (dialCode: string) => {
    selectedCountryCode.value = dialCode
    updatePhoneNumberField()
}

const handlePhoneNumberChange = (value: string) => {
    if (value && value.trim().length > 0 && phoneCountryCodes.value.length > 0) {
        const parsed = parsePhoneNumber(value, phoneCountryCodes.value)
        if (parsed && parsed.countryCode && parsed.phoneNumber) {
            selectedCountryCode.value = parsed.countryCode.dialCode
            phoneNumberValue.value = parsed.phoneNumber
            updatePhoneNumberField()
            return
        }
    }
    phoneNumberValue.value = value
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
    const syntheticEvent = new Event('blur') as Event
    field.onBlur(syntheticEvent)

    const email = field.value?.trim()
    if (!email || !props.customer?.id) {
        return
    }

    await nextTick()

    if (errors.value.email) {
        return
    }

    checkingEmail.value = true
    try {
        const available = await checkEmailExists(email, props.customer.id)
        if (!available) {
            setErrors({ email: 'Email already exists. Please use a different email.' })
        }
    } catch (err) {
        console.error('Error checking email:', err)
    } finally {
        checkingEmail.value = false
    }
}

// Avatar handlers
const triggerAvatarInput = () => {
    avatarInput.value?.click()
}

const handleAvatarChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
        error('File size must be less than 2MB')
        return
    }

    if (!file.type.startsWith('image/')) {
        error('Please select an image file')
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

const handleClientChange = async (newClientId: number | null) => {
    if (newClientId) {
        const loadingTask = useLoadingTask('fetch-locations')
        await loadingTask.execute(async () => {
            await fetchLocations(newClientId)
        })
    }
}

// Load customer data from prop
const loadData = async () => {
    if (!props.fullCustomerData) return

    setErrors({})
    await nextTick()

    const fullCustomer = props.fullCustomerData

    selectedClientId.value = fullCustomer.clientId || DEFAULT_CLIENT_ID
    await fetchLocations(fullCustomer.clientId)

    if (fullCustomer.avatar) {
        avatarPreview.value = getFullImageUrl(fullCustomer.avatar, 'customers')
    } else {
        avatarPreview.value = null
    }
    avatarFile.value = null

    if (fullCustomer.phoneNumber) {
        const parsed = parsePhoneNumber(fullCustomer.phoneNumber, phoneCountryCodes.value)
        if (parsed) {
            selectedCountryCode.value = parsed.countryCode.dialCode
            phoneNumberValue.value = parsed.phoneNumber
        } else {
            selectedCountryCode.value = '+1'
            phoneNumberValue.value = fullCustomer.phoneNumber.replace(/^\+?1/, '')
        }
    } else {
        selectedCountryCode.value = '+1'
        phoneNumberValue.value = ''
    }

    const customerData: UpdateCustomerFormData = {
        clientId: fullCustomer.clientId || DEFAULT_CLIENT_ID,
        firstName: fullCustomer.firstName || '',
        lastName: fullCustomer.lastName || '',
        email: fullCustomer.email || '',
        phoneNumber: fullCustomer.phoneNumber || '',
        pickupLocation: fullCustomer.pickupLocation || 0,
        signupLocation: fullCustomer.signupLocation || 0,
        deliveryMethod: fullCustomer.deliveryMethod || 1,
        dob: fullCustomer.dob || null,
        isAppUser: fullCustomer.isAppUser ?? false,
        isActive: fullCustomer.isActive ?? true,
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

    resetForm({ values: customerData, errors: {}, touched: {} })
    await nextTick()

    setFieldValue('clientId', customerData.clientId)
    setFieldValue('firstName', customerData.firstName)
    setFieldValue('lastName', customerData.lastName)
    setFieldValue('email', customerData.email)
    setFieldValue('phoneNumber', customerData.phoneNumber)
    setFieldValue('pickupLocation', customerData.pickupLocation)
    setFieldValue('signupLocation', customerData.signupLocation)
    setFieldValue('deliveryMethod', customerData.deliveryMethod)
    setFieldValue('dob', customerData.dob)
    setFieldValue('isAppUser', customerData.isAppUser)
    setFieldValue('isActive', customerData.isActive)
    setFieldValue('billingCompany', customerData.billingCompany)
    setFieldValue('billingAddress', customerData.billingAddress)
    setFieldValue('billingCity', customerData.billingCity)
    setFieldValue('billingStateCode', customerData.billingStateCode)
    setFieldValue('billingPostalCode', customerData.billingPostalCode)
    setFieldValue('billingCountryCode', customerData.billingCountryCode)

    updatePhoneNumberField()
    await nextTick()
}

// Form submission
const submitForm = handleSubmit(async (formValues) => {
    if (!props.customer) return

    if (hasClientError.value) {
        error('Please select a client')
        return
    }

    isSubmitting.value = true
    try {
        const loadingTask = useLoadingTask('update-customer-basic')
        await loadingTask.execute(async () => {
            const updateData: Partial<UpdateCustomerFormData> = {
                clientId: selectedClientId.value || formValues.clientId,
                firstName: formValues.firstName,
                lastName: formValues.lastName,
                email: formValues.email,
                phoneNumber: formValues.phoneNumber,
                pickupLocation: formValues.pickupLocation,
                signupLocation: formValues.signupLocation,
                deliveryMethod: formValues.deliveryMethod,
                dob: formValues.dob,
                isAppUser: formValues.isAppUser,
                isActive: formValues.isActive,
            }

            await updateCustomer(props.customer!.id, updateData)

            if (avatarFile.value && props.customer && props.customer.id) {
                try {
                    await uploadImage(props.customer.id, avatarFile.value)
                } catch (uploadError) {
                    console.error('Error uploading avatar:', uploadError)
                    error(CUSTOMER_MESSAGES.AVATAR_UPDATE_FAILED)
                }
            }

            success(CUSTOMER_MESSAGES.UPDATE_SUCCESS)
            emit('submit')
        })
    } catch (err) {
        console.error('Error updating customer:', err)
        errorFromError(err, CUSTOMER_MESSAGES.UPDATE_ERROR)
    } finally {
        isSubmitting.value = false
    }
})

const handleFormSubmit = () => {
    submitForm()
}

await fetchPhoneCountryCodes()

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
    min-height: 100px;
}

.avatar-preview-container {
    text-align: center;
}

.gap-2 {
    gap: 8px;
}
</style>
