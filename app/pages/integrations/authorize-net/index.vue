<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Authorize.net Integration</h1>

                <v-card>
                    <v-card-text>
                        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                            <v-row>
                                <FormField
                                    v-model="formData.email"
                                    label="Email"
                                    type="email"
                                    :required="true"
                                    :rules="[rules.required, rules.email]"
                                />

                                <FormField
                                    v-model="formData.firstName"
                                    label="First Name"
                                    type="text"
                                    :required="true"
                                    :rules="[rules.required]"
                                />

                                <FormField
                                    v-model="formData.lastName"
                                    label="Last Name"
                                    type="text"
                                    :required="true"
                                    :rules="[rules.required]"
                                />

                                <FormField
                                    v-model="formData.phoneNumber"
                                    label="Phone Number"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.address"
                                    label="Address"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.city"
                                    label="City"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.state"
                                    label="State"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.zip"
                                    label="Zip Code"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.country"
                                    label="Country"
                                    type="text"
                                />
                            </v-row>

                            <v-row class="mt-4">
                                <v-col cols="12" class="d-flex justify-end">
                                    <v-btn color="primary" type="submit" :loading="loading" :disabled="!valid">
                                        Create Customer Profile
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
import { ref } from 'vue';
import { useNuxtApp } from '#app';
import FormField from '~/components/forms/FormField.vue';
import type { CreateCustomerProfileInputDTO } from '~/types/integration.types';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
});

const nuxtApp = useNuxtApp();
const authorizeNetApi = nuxtApp.$authorizeNetApi as import('~/services/api/wrappers/authorize-net.api').AuthorizeNetApiService;

const formRef = ref();
const valid = ref(false);
const loading = ref(false);

const formData = ref<CreateCustomerProfileInputDTO>({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
});

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
    email: (v: string) => /.+@.+\..+/.test(v) || 'Must be a valid email',
};

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return;

    loading.value = true;
    try {
        const response = await authorizeNetApi.createCustomerProfile(formData.value);
        if (response.success) {
            alert('Customer profile created successfully!');
            formData.value = {
                email: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                address: '',
                city: '',
                state: '',
                zip: '',
                country: '',
            };
        }
    } catch (error) {
        console.error('Error creating profile:', error);
        alert('Failed to create customer profile');
    } finally {
        loading.value = false;
    }
};
</script>
