<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Edit Customer</h1>

                <v-card v-if="currentCustomer">
                    <v-card-text>
                        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                            <v-tabs v-model="tab" class="mb-4">
                                <v-tab value="basic">Basic Information</v-tab>
                                <v-tab value="billing">Billing Address</v-tab>
                                <v-tab value="shipping">Shipping Addresses</v-tab>
                            </v-tabs>

                            <v-window v-model="tab">
                                <v-window-item value="basic">
                                    <v-row>
                                        <FormField
                                            v-model="formData.firstName"
                                            label="First Name"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(3)]"
                                        />

                                        <FormField
                                            v-model="formData.lastName"
                                            label="Last Name"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(3)]"
                                        />

                                        <FormField
                                            v-model="formData.email"
                                            label="Email"
                                            type="email"
                                            :required="true"
                                            :rules="[rules.required, rules.email]"
                                        />

                                        <FormField
                                            v-model="formData.password"
                                            label="Password (leave blank to keep current)"
                                            type="password"
                                            :rules="formData.password ? [rules.minLength(8)] : []"
                                        />

                                        <FormField
                                            v-model="formData.phoneNumber"
                                            label="Phone Number"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(10)]"
                                        />

                                        <FormField
                                            v-model="formData.isActive"
                                            label="Active"
                                            type="switch"
                                        />
                                    </v-row>
                                </v-window-item>

                                <v-window-item value="billing">
                                    <v-row>
                                        <FormField
                                            v-model="formData.billingCompany"
                                            label="Company"
                                            type="text"
                                        />

                                        <FormField
                                            v-model="formData.billingAddress"
                                            label="Address"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(10)]"
                                        />

                                        <FormField
                                            v-model="formData.billingCity"
                                            label="City"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(3)]"
                                        />

                                        <v-col cols="12" md="4">
                                            <v-select
                                                v-model="formData.billingCountryCode"
                                                label="Country"
                                                :items="countryOptions"
                                                :rules="[rules.required]"
                                                @update:model-value="loadStates('billing')"
                                            />
                                        </v-col>

                                        <v-col cols="12" md="4">
                                            <v-select
                                                v-model="formData.billingStateCode"
                                                label="State"
                                                :items="billingStateOptions"
                                                :rules="[rules.required]"
                                            />
                                        </v-col>

                                        <FormField
                                            v-model="formData.billingPostalCode"
                                            label="Postal Code"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(5)]"
                                        />
                                    </v-row>
                                </v-window-item>

                                <v-window-item value="shipping">
                                    <v-row>
                                        <v-col cols="12">
                                            <div
                                                class="d-flex justify-space-between align-center mb-4"
                                            >
                                                <h3 class="text-h6">Shipping Addresses</h3>
                                                <v-btn
                                                    color="primary"
                                                    prepend-icon="mdi-plus"
                                                    @click="showAddAddressDialog = true"
                                                >
                                                    Add Address
                                                </v-btn>
                                            </div>

                                            <v-list
                                                v-if="currentCustomer.shippingAddresses?.length"
                                            >
                                                <v-list-item
                                                    v-for="address in currentCustomer.shippingAddresses"
                                                    :key="address.id"
                                                    class="mb-2"
                                                >
                                                    <v-list-item-title>
                                                        {{ address.firstName }}
                                                        {{ address.lastName }}
                                                    </v-list-item-title>
                                                    <v-list-item-subtitle>
                                                        {{ address.address }}, {{ address.city }},
                                                        {{ address.stateCode }}
                                                        {{ address.postalCode }}
                                                    </v-list-item-subtitle>
                                                    <template #append>
                                                        <v-btn
                                                            icon="mdi-pencil"
                                                            size="small"
                                                            @click="editAddress(address)"
                                                        />
                                                        <v-btn
                                                            icon="mdi-delete"
                                                            size="small"
                                                            color="error"
                                                            @click="deleteAddress(address.id)"
                                                        />
                                                    </template>
                                                </v-list-item>
                                            </v-list>
                                            <v-alert v-else type="info">
                                                No shipping addresses
                                            </v-alert>
                                        </v-col>
                                    </v-row>
                                </v-window-item>
                            </v-window>

                            <v-row class="mt-4">
                                <v-col cols="12" class="d-flex justify-end gap-2">
                                    <v-btn
                                        variant="outlined"
                                        @click="navigateTo(`/${organisationId}/customers`)"
                                    >
                                        Cancel
                                    </v-btn>
                                    <v-btn
                                        color="primary"
                                        type="submit"
                                        :loading="loading"
                                        :disabled="!valid"
                                    >
                                        Update Customer
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>

                <v-skeleton-loader v-else type="card" />

                <!-- Add/Edit Address Dialog -->
                <FormDialog
                    v-model="showAddAddressDialog"
                    :title="editingAddress ? 'Edit Shipping Address' : 'Add Shipping Address'"
                    @submit="saveAddress"
                >
                    <v-row>
                        <FormField
                            v-model="addressForm.type"
                            label="Type"
                            type="number"
                            :required="true"
                        />

                        <FormField
                            v-model="addressForm.firstName"
                            label="First Name"
                            type="text"
                            :required="true"
                            :rules="[rules.required, rules.minLength(3)]"
                        />

                        <FormField
                            v-model="addressForm.lastName"
                            label="Last Name"
                            type="text"
                            :required="true"
                            :rules="[rules.required, rules.minLength(3)]"
                        />

                        <FormField
                            v-model="addressForm.address"
                            label="Address"
                            type="text"
                            :required="true"
                            :rules="[rules.required, rules.minLength(10)]"
                        />

                        <FormField
                            v-model="addressForm.city"
                            label="City"
                            type="text"
                            :required="true"
                            :rules="[rules.required, rules.minLength(3)]"
                        />

                        <FormField
                            v-model="addressForm.stateCode"
                            label="State Code"
                            type="text"
                            :required="true"
                            :rules="[rules.required]"
                        />

                        <FormField
                            v-model="addressForm.postalCode"
                            label="Postal Code"
                            type="text"
                            :required="true"
                            :rules="[rules.required, rules.minLength(5)]"
                        />

                        <FormField
                            v-model="addressForm.countryCode"
                            label="Country Code"
                            type="text"
                            :required="true"
                            :rules="[rules.required]"
                        />

                        <FormField v-model="addressForm.isActive" label="Active" type="switch" />
                    </v-row>
                </FormDialog>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomer } from '~/composables/useCustomer'
import { useCountry } from '~/composables/useCountry'
import FormField from '~/components/forms/FormField.vue'
import FormDialog from '~/components/dialogs/FormDialog.vue'
import { updateCustomerSchema } from '~/schemas/customer.schema'
import type { UpdateCustomerFormData } from '~/schemas/customer.schema'
import type { CustomerShippingAddressFormData } from '~/schemas/customer.schema'
import type { CustomerShippingAddress } from '~/services/api/wrappers/customer.api'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_PERMISSIONS.UPDATE },
})

const route = useRoute()
const organisationId = computed(() => Number(route.params.organisationId))
const customerId = computed(() => Number(route.params.id))

const {
    currentCustomer,
    loading,
    fetchCustomerById,
    updateCustomer,
    addShippingAddress,
    updateShippingAddress,
} = useCustomer()
const { countries, fetchCountries, fetchStates, getStateOptions } = useCountry()

const formRef = ref()
const valid = ref(false)
const tab = ref('basic')
const billingStateOptions = ref<Array<{ title: string; value: string }>>([])
const showAddAddressDialog = ref(false)
const editingAddress = ref<CustomerShippingAddress | null>(null)

const formData = ref<UpdateCustomerFormData>({
    organisationId: organisationId.value,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    isActive: true,
    billingCompany: null,
    billingAddress: '',
    billingCity: '',
    billingStateCode: '',
    billingPostalCode: '',
    billingCountryCode: '',
})

const addressForm = ref<CustomerShippingAddressFormData>({
    type: 1,
    firstName: '',
    lastName: '',
    company: null,
    address: '',
    city: '',
    stateCode: '',
    postalCode: '',
    countryCode: '',
    isActive: true,
})

const countryOptions = computed(() => {
    return countries.value.map((c) => ({
        title: c.name,
        value: c.id,
    }))
})

const rules = {
    required: (v: unknown): true | 'This field is required' => !!v || 'This field is required',
    minLength:
        (min: number): ((v: unknown) => string | true) =>
        (v: unknown) =>
            String(v ?? '').length >= min || `Must be at least ${min} characters`,
    email: (v: unknown): true | 'Must be a valid email' =>
        /.+@.+\..+/.test(String(v ?? '')) || 'Must be a valid email',
}

const loadStates = async (type: 'billing'): Promise<void> => {
    const countryCode = formData.value.billingCountryCode
    if (!countryCode) return

    const country = countries.value.find((c) => c.id === countryCode)
    if (country) {
        await fetchStates(country.id)
        const stateOptions = getStateOptions(country.id)
        billingStateOptions.value = stateOptions.value
    }
}

const editAddress = (address: CustomerShippingAddress): void => {
    editingAddress.value = address
    addressForm.value = {
        type: address.type,
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address: address.address,
        city: address.city,
        stateCode: address.stateCode,
        postalCode: address.postalCode,
        countryCode: address.countryCode,
        isActive: address.isActive,
    }
    showAddAddressDialog.value = true
}

const deleteAddress = async (addressId: number): Promise<void> => {
    // Implement delete if backend supports it
    console.log('Delete address:', addressId)
}

const saveAddress = async (): Promise<void> => {
    try {
        if (editingAddress.value) {
            await updateShippingAddress(
                customerId.value,
                editingAddress.value.id,
                addressForm.value
            )
        } else {
            await addShippingAddress(customerId.value, addressForm.value)
        }
        showAddAddressDialog.value = false
        editingAddress.value = null
        addressForm.value = {
            type: 1,
            firstName: '',
            lastName: '',
            company: null,
            address: '',
            city: '',
            stateCode: '',
            postalCode: '',
            countryCode: '',
            isActive: true,
        }
        await fetchCustomerById(customerId.value)
    } catch (error) {
        console.error('Error saving address:', error)
    }
}

const handleSubmit = async (): Promise<void> => {
    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    try {
        const data = { ...formData.value }
        if (!data.password) {
            delete data.password
        }
        updateCustomerSchema.parse(data)
        await updateCustomer(customerId.value, { ...data, organisationId: organisationId.value })
        navigateTo(`/${organisationId.value}/customers`)
    } catch (error) {
        console.error('Validation or update error:', error)
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: customerEditPending } = await useLazyAsyncData(
    'customer-edit-initial',
    async () => {
        await Promise.all([fetchCountries(), fetchCustomerById(customerId.value)])

        if (currentCustomer.value) {
            formData.value = {
                organisationId: organisationId.value,
                firstName: currentCustomer.value.firstName,
                lastName: currentCustomer.value.lastName,
                email: currentCustomer.value.email,
                phoneNumber: currentCustomer.value.phoneNumber,
                isActive: currentCustomer.value.isActive,
                billingCompany: currentCustomer.value.billing.company,
                billingAddress: currentCustomer.value.billing.address,
                billingCity: currentCustomer.value.billing.city,
                billingStateCode: currentCustomer.value.billing.stateCode,
                billingPostalCode: currentCustomer.value.billing.postalCode,
                billingCountryCode: currentCustomer.value.billing.countryCode,
            }
            await loadStates('billing')
        }
    }
)
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
