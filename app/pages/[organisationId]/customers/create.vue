<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Create Customer</h1>

                <v-card>
                    <v-card-text>
                        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                            <v-tabs v-model="tab" class="mb-4">
                                <v-tab value="basic">Basic Information</v-tab>
                                <v-tab value="billing">Billing Address</v-tab>
                                <v-tab value="shipping">Shipping Address</v-tab>
                                <v-tab value="additional">Additional</v-tab>
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
                                            label="Password"
                                            type="password"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(8)]"
                                        />

                                        <FormField
                                            v-model="formData.phoneNumber"
                                            label="Phone Number"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(10)]"
                                        />

                                        <v-col cols="12" md="6">
                                            <v-select
                                                v-model="formData.pickupLocation"
                                                label="Pickup Location"
                                                :items="locationOptions"
                                                :rules="[rules.required]"
                                            />
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-select
                                                v-model="formData.signupLocation"
                                                label="Signup Location"
                                                :items="locationOptions"
                                                :rules="[rules.required]"
                                            />
                                        </v-col>

                                        <v-col cols="12" md="6">
                                            <v-select
                                                v-model="formData.deliveryMethod"
                                                label="Delivery Method"
                                                :items="deliveryMethods"
                                                :rules="[rules.required]"
                                            />
                                        </v-col>

                                        <FormField
                                            v-model="formData.dob"
                                            label="Date of Birth"
                                            type="text"
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
                                        <FormField
                                            v-model="formData.shippingFirstName"
                                            label="First Name"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(3)]"
                                        />

                                        <FormField
                                            v-model="formData.shippingLastName"
                                            label="Last Name"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(3)]"
                                        />

                                        <FormField
                                            v-model="formData.shippingCompany"
                                            label="Company"
                                            type="text"
                                        />

                                        <FormField
                                            v-model="formData.shippingAddress"
                                            label="Address"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(10)]"
                                        />

                                        <FormField
                                            v-model="formData.shippingCity"
                                            label="City"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(3)]"
                                        />

                                        <v-col cols="12" md="4">
                                            <v-select
                                                v-model="formData.shippingCountryCode"
                                                label="Country"
                                                :items="countryOptions"
                                                :rules="[rules.required]"
                                                @update:model-value="loadStates('shipping')"
                                            />
                                        </v-col>

                                        <v-col cols="12" md="4">
                                            <v-select
                                                v-model="formData.shippingStateCode"
                                                label="State"
                                                :items="shippingStateOptions"
                                                :rules="[rules.required]"
                                            />
                                        </v-col>

                                        <FormField
                                            v-model="formData.shippingPostalCode"
                                            label="Postal Code"
                                            type="text"
                                            :required="true"
                                            :rules="[rules.required, rules.minLength(5)]"
                                        />
                                    </v-row>
                                </v-window-item>

                                <v-window-item value="additional">
                                    <v-row>
                                        <FormField
                                            v-model="formData.cpi"
                                            label="CPI"
                                            type="text"
                                        />

                                        <FormField
                                            v-model="formData.isAppUser"
                                            label="App User"
                                            type="switch"
                                        />
                                    </v-row>
                                </v-window-item>
                            </v-window>

                            <v-row class="mt-4">
                                <v-col cols="12" class="d-flex justify-end gap-2">
                                    <v-btn variant="outlined" @click="navigateTo(`/${organisationId}/customers`)">
                                        Cancel
                                    </v-btn>
                                    <v-btn color="primary" type="submit" :loading="loading" :disabled="!valid">
                                        Create Customer
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'

import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCustomer } from '~/composables/useCustomer';
import { useLocation } from '~/composables/useLocation';
import { useCountry } from '~/composables/useCountry';
import FormField from '~/components/forms/FormField.vue';
import { createCustomerSchema } from '~/schemas/customer.schema';
import type { CreateCustomerFormData } from '~/schemas/customer.schema';

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_PERMISSIONS.WRITE },
});

const route = useRoute();
const organisationId = computed(() => Number(route.params.organisationId));

const { createCustomer, loading } = useCustomer();
const { locations, fetchLocations } = useLocation();
const { countries, fetchCountries, fetchStates, getStateOptions } = useCountry();

const formRef = ref();
const valid = ref(false);
const tab = ref('basic');
const billingStateOptions = ref<Array<{ title: string; value: string }>>([]);
const shippingStateOptions = ref<Array<{ title: string; value: string }>>([]);

const formData = ref<CreateCustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    pickupLocation: 0,
    signupLocation: 0,
    deliveryMethod: 0,
    dob: null,
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
    cpi: undefined,
});

const locationOptions = computed(() => {
    return locations.value.map((l) => ({
        title: l.name,
        value: l.id,
    }));
});

const countryOptions = computed(() => {
    return countries.value.map((c) => ({
        title: c.name,
        value: c.code,
    }));
});

const deliveryMethods = [
    { title: 'Standard', value: 1 },
    { title: 'Express', value: 2 },
    { title: 'Pickup', value: 3 },
];

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
    minLength: (min: number) => (v: string) => (v?.length || 0) >= min || `Must be at least ${min} characters`,
    email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
};

const loadStates = async (type: 'billing' | 'shipping') => {
    const countryCode = type === 'billing' ? formData.value.billingCountryCode : formData.value.shippingCountryCode;
    if (!countryCode) return;

    const country = countries.value.find((c) => c.code === countryCode);
    if (country) {
        await fetchStates(country.id);
        const stateOptions = getStateOptions(country.id);
        if (type === 'billing') {
            billingStateOptions.value = stateOptions.value;
        } else {
            shippingStateOptions.value = stateOptions.value;
        }
    }
};

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return;

    try {
        createCustomerSchema.parse(formData.value);
        await createCustomer({ ...formData.value, organisationId: organisationId.value });
        navigateTo(`/${organisationId.value}/customers`);
    } catch (error) {
        console.error('Validation or creation error:', error);
    }
};

// Use useLazyAsyncData for initial data fetching
const { pending: customerCreatePending } = await useLazyAsyncData(
    'customer-create-initial',
    async () => {
        await Promise.all([
            fetchLocations(organisationId.value),
            fetchCountries(),
        ]);
    }
);
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
