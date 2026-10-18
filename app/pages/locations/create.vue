<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Create Location</h1>

                <v-card>
                    <v-card-text>
                        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select
                                        v-model="formData.organisationId"
                                        label="Organisation"
                                        :items="organisationOptions"
                                        :rules="[rules.required]"
                                    />
                                </v-col>

                                <FormField
                                    v-model="formData.name"
                                    label="Location Name"
                                    type="text"
                                    :required="true"
                                    :rules="[rules.required]"
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
                                    v-model="formData.country"
                                    label="Country"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.phoneNumber"
                                    label="Phone Number"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.lat"
                                    label="Latitude"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.long"
                                    label="Longitude"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.squareLocationId"
                                    label="Square Location ID"
                                    type="text"
                                />

                                <FormField
                                    v-model="formData.isActive"
                                    label="Active"
                                    type="switch"
                                />
                            </v-row>

                            <v-row class="mt-4">
                                <v-col cols="12" class="d-flex justify-end gap-2">
                                    <v-btn variant="outlined" @click="navigateTo('/locations')">
                                        Cancel
                                    </v-btn>
                                    <v-btn color="primary" type="submit" :loading="loading" :disabled="!valid">
                                        Create Location
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
import { LOCATION_PERMISSIONS } from '~/components/locations/location.permissions'

import { ref, onMounted, computed } from 'vue';
import { useLocation } from '~/composables/useLocation';
import { useOrganisation } from '~/composables/useOrganisation';
import FormField from '~/components/forms/FormField.vue';
import { createLocationSchema } from '~/schemas/location.schema';
import type { CreateLocationFormData } from '~/schemas/location.schema';

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: LOCATION_PERMISSIONS.WRITE },
});

const { createLocation, loading } = useLocation();
const { organisations, fetchOrganisations } = useOrganisation();

const formRef = ref();
const valid = ref(false);

const formData = ref<CreateLocationFormData>({
    organisationId: 0,
    name: '',
    address: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    phoneNumber: undefined,
    lat: undefined,
    long: undefined,
    squareLocationId: undefined,
    isActive: true,
});

const organisationOptions = computed(() => {
    return organisations.value.map((c) => ({
        title: c.name,
        value: c.id,
    }));
});

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
};

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return;

    try {
        const submitData = {
            ...formData.value,
            organisationId: Number(formData.value.organisationId),
        };
        createLocationSchema.parse(submitData);
        await createLocation(submitData);
        navigateTo('/locations');
    } catch (error) {
        console.error('Validation or creation error:', error);
    }
};

onMounted(async () => {
    await fetchOrganisations();
});
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
