<template>
    <div>
        <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6">Shipping Addresses</h3>
            <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                :disabled="shippingAddresses.length >= MAX_SHIPPING_ADDRESSES"
                @click="addNewShippingAddress"
            >
                Add Address
            </v-btn>
        </div>
        <p class="text-body-2 text-medium-emphasis mb-4">
            You can save up to {{ MAX_SHIPPING_ADDRESSES }} shipping addresses.
            {{ shippingAddresses.length }} of {{ MAX_SHIPPING_ADDRESSES }} used.
        </p>

        <!-- Shipping Address Tiles -->
        <div
            v-for="(address, index) in shippingAddresses"
            :key="address.id || `new-${index}`"
            class="mb-4"
        >
            <v-card variant="outlined" :class="{ 'border-primary': editingAddressIndex === index }">
                <v-card-title class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                        <span class="text-subtitle-1">Shipping Address {{ index + 1 }}</span>
                        <v-chip v-if="address.isActive" color="success" size="small" class="ml-2">
                            Active
                        </v-chip>
                    </div>
                    <div class="d-flex gap-2">
                        <v-btn
                            v-if="address.id && editingAddressIndex !== index"
                            icon
                            size="small"
                            variant="text"
                            color="primary"
                            @click="editAddress(index)"
                        >
                            <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn
                            v-if="editingAddressIndex !== index"
                            icon
                            size="small"
                            variant="text"
                            color="error"
                            @click="removeShippingAddress(index)"
                        >
                            <v-icon>mdi-delete</v-icon>
                        </v-btn>
                    </div>
                </v-card-title>

                <!-- Display Mode -->
                <v-card-text v-if="editingAddressIndex !== index">
                    <div class="text-body-1 font-weight-medium">
                        {{ address.firstName }} {{ address.lastName }}
                    </div>
                    <div v-if="address.company" class="text-body-2 text-medium-emphasis">
                        {{ address.company }}
                    </div>
                    <div class="text-body-2">{{ address.address }}</div>
                    <div class="text-body-2">
                        {{ address.city }},
                        {{ getStateName(address.stateCode, address.countryCode) }}
                        {{ address.postalCode }}
                    </div>
                    <div class="text-body-2">{{ getCountryName(address.countryCode) }}</div>
                </v-card-text>

                <!-- Edit Form -->
                <v-card-text v-else>
                    <v-form>
                        <LazyGlobalsFormFieldErrors :errors="getShippingErrors(index)" />
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="address.firstName"
                                    label="First Name *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'firstName')"
                                    hide-details="auto"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="address.lastName"
                                    label="Last Name *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'lastName')"
                                    hide-details="auto"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-text-field
                                    v-model="address.company"
                                    label="Company"
                                    variant="outlined"
                                    density="compact"
                                />
                            </v-col>
                            <v-col cols="12">
                                <v-text-field
                                    v-model="address.address"
                                    label="Address *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'address')"
                                    hide-details="auto"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="address.city"
                                    label="City *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'city')"
                                    hide-details="auto"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-select
                                    v-model="address.stateCode"
                                    :items="getStateOptions(address.countryCode)"
                                    item-title="title"
                                    item-value="value"
                                    label="State *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'stateCode')"
                                    hide-details="auto"
                                />
                            </v-col>
                            <v-col cols="12" md="4">
                                <v-text-field
                                    v-model="address.postalCode"
                                    label="Postal Code *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'postalCode')"
                                    hide-details="auto"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-select
                                    v-model="address.countryCode"
                                    :items="countryOptions"
                                    item-title="title"
                                    item-value="value"
                                    label="Country *"
                                    variant="outlined"
                                    density="compact"
                                    :error-messages="getAddressError(index, 'countryCode')"
                                    hide-details="auto"
                                    @update:model-value="handleShippingCountryChange(index, $event)"
                                />
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-switch
                                    v-model="address.isActive"
                                    label="Is Active"
                                    hide-details
                                    density="compact"
                                    color="primary"
                                />
                            </v-col>
                            <v-col cols="12">
                                <div class="d-flex gap-2">
                                    <v-btn
                                        color="primary"
                                        :loading="savingAddressIndex === index"
                                        @click="saveShippingAddress(index)"
                                    >
                                        {{ address.id ? 'Save' : 'Add' }}
                                    </v-btn>
                                    <v-btn variant="text" @click="cancelEditAddress(index)">
                                        Cancel
                                    </v-btn>
                                </div>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { customerShippingAddressSchema } from '~/schemas/customer.schema'
import { useCustomer } from '~/composables/useCustomer'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { CUSTOMER_MESSAGES } from '~/constants/messages.constants'
import { CUSTOMER_LIMITS } from '~/constants/customer.constants'
import type { Customer, CustomerShippingAddress } from '~/services/api/wrappers/customer.api'

const MAX_SHIPPING_ADDRESSES = CUSTOMER_LIMITS.SHIPPING_ADDRESSES

// Shipping addresses schema
const shippingAddressesSchema = z.object({
    shippingAddresses: z.array(customerShippingAddressSchema),
})

interface Props {
    customer: Customer | null
    fullCustomerData: Customer | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
    submit: []
}>()

const { addShippingAddress, updateShippingAddress, deleteShippingAddress } = useCustomer()
const { countryOptions, fetchCountries, fetchStates } = useCountry()
const { success, errorFromError } = useToast()

const shippingAddresses = ref<
    Array<CustomerShippingAddress & { isNew?: boolean; isEditing?: boolean }>
>([])
const editingAddressIndex = ref<number | null>(null)
const savingAddressIndex = ref<number | null>(null)
const stateOptionsCache = ref<Record<string, Array<{ title: string; value: string }>>>({})

const { errors: shippingErrors } = useForm({
    validationSchema: toTypedSchema(shippingAddressesSchema),
    initialValues: {
        shippingAddresses: [],
    },
    validateOnMount: false,
})

const getStateOptions = (countryCode: string) => {
    return stateOptionsCache.value[countryCode] || []
}

const getStateName = (stateCode: string, countryCode: string) => {
    const states = getStateOptions(countryCode)
    const state = states.find((s) => s.value === stateCode)
    return state?.title || stateCode
}

const getCountryName = (countryCode: string) => {
    const country = countryOptions.value.find((c) => c.value === countryCode)
    return country?.title || countryCode
}

const getShippingErrors = (index: number) => {
    const errors = shippingErrors.value as any
    if (errors && errors.shippingAddresses && errors.shippingAddresses[index]) {
        return errors.shippingAddresses[index]
    }
    return {}
}

const getAddressError = (index: number, field: string) => {
    const errors = getShippingErrors(index)
    return errors[field] || ''
}

const handleShippingCountryChange = async (index: number, countryCode: string) => {
    const address = shippingAddresses.value[index]
    if (address) {
        address.countryCode = countryCode
    }

    if (countryCode && !stateOptionsCache.value[countryCode]) {
        const states = await fetchStates(countryCode)
        stateOptionsCache.value[countryCode] = states.map((s) => ({
            title: s.name,
            value: String(s.id),
        }))
    }

    if (address) {
        address.stateCode = ''
    }
}

// Load customer data from prop
const loadData = async () => {
    if (!props.fullCustomerData) return

    const fullCustomer = props.fullCustomerData

    // Load shipping addresses
    shippingAddresses.value = (fullCustomer.shippingAddresses || []).map((addr) => ({
        ...addr,
        isNew: false,
        isEditing: false,
    }))

    // Preload state options for shipping addresses
    const countryCodes = [
        ...new Set(shippingAddresses.value.map((a) => a.countryCode).filter(Boolean)),
    ]
    for (const countryCode of countryCodes) {
        if (countryCode && !stateOptionsCache.value[countryCode]) {
            const states = await fetchStates(countryCode)
            stateOptionsCache.value[countryCode] = states.map((s) => ({
                title: s.name,
                value: String(s.id),
            }))
        }
    }
}

// Shipping address handlers
const addNewShippingAddress = () => {
    if (shippingAddresses.value.length >= MAX_SHIPPING_ADDRESSES) return
    const newAddress: CustomerShippingAddress & { isNew: boolean; isEditing: boolean } = {
        id: 0,
        customerId: props.customer?.id || 0,
        type: shippingAddresses.value.length + 1,
        firstName: '',
        lastName: '',
        company: null,
        address: '',
        city: '',
        stateCode: '',
        postalCode: '',
        countryCode: '',
        isActive: true,
        createdAt: '',
        updatedAt: null,
        isNew: true,
        isEditing: true,
    }
    shippingAddresses.value.push(newAddress)
    editingAddressIndex.value = shippingAddresses.value.length - 1
}

const editAddress = (index: number) => {
    editingAddressIndex.value = index
    if (shippingAddresses.value[index]) {
        shippingAddresses.value[index].isEditing = true
    }
}

const cancelEditAddress = async (index: number) => {
    if (shippingAddresses.value[index]?.isNew) {
        shippingAddresses.value.splice(index, 1)
    } else {
        if (shippingAddresses.value[index]) {
            shippingAddresses.value[index].isEditing = false
        }
    }
    editingAddressIndex.value = null
    await loadData()
}

const saveShippingAddress = async (index: number) => {
    if (!props.customer) return

    const address = shippingAddresses.value[index]
    if (!address) return

    // Validate address
    try {
        customerShippingAddressSchema.parse(address)
    } catch (err: any) {
        if (err.errors) {
            const fieldErrors: Record<string, string> = {}
            err.errors.forEach((error: any) => {
                if (error.path && error.path.length > 0) {
                    fieldErrors[error.path[0]] = error.message
                }
            })
            // Show validation errors
            return
        }
    }

    savingAddressIndex.value = index

    try {
        const addressData = {
            type: address.type,
            firstName: address.firstName,
            lastName: address.lastName,
            company: address.company?.trim() || null,
            address: address.address,
            city: address.city,
            stateCode: address.stateCode,
            postalCode: address.postalCode,
            countryCode: address.countryCode,
            isActive: address.isActive,
        }

        const loadingTask = useLoadingTask('save-shipping-address')
        await loadingTask.execute(async () => {
            if (address.isNew) {
                await addShippingAddress(props.customer!.id, addressData)
                success(CUSTOMER_MESSAGES.SHIPPING_ADD_SUCCESS)
            } else if (address.id) {
                await updateShippingAddress(props.customer!.id, address.id, addressData)
                success(CUSTOMER_MESSAGES.SHIPPING_UPDATE_SUCCESS)
            }

            editingAddressIndex.value = null
            if (shippingAddresses.value[index]) {
                shippingAddresses.value[index].isEditing = false
                shippingAddresses.value[index].isNew = false
            }
            emit('submit')
            await loadData()
        })
    } catch (err) {
        console.error('Error saving shipping address:', err)
        errorFromError(err, CUSTOMER_MESSAGES.SHIPPING_SAVE_ERROR)
    } finally {
        savingAddressIndex.value = null
    }
}

const removeShippingAddress = async (index: number) => {
    const address = shippingAddresses.value[index]
    if (!address) return

    if (address.isNew) {
        shippingAddresses.value.splice(index, 1)
        return
    }

    if (confirm(`Are you sure you want to remove this shipping address?`)) {
        try {
            const loadingTask = useLoadingTask('remove-shipping-address')
            await loadingTask.execute(async () => {
                if (address.id && props.customer) {
                    await deleteShippingAddress(props.customer.id, address.id)
                    success(CUSTOMER_MESSAGES.SHIPPING_REMOVE_SUCCESS)
                    await loadData()
                }
            })
        } catch (err) {
            console.error('Error removing shipping address:', err)
            errorFromError(err, CUSTOMER_MESSAGES.SHIPPING_REMOVE_ERROR)
        }
    }
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

<style scoped>
.border-primary {
    border: 2px solid rgb(var(--v-theme-primary));
}

.gap-2 {
    gap: 8px;
}
</style>
