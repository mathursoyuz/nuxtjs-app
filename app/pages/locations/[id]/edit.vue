<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Edit Location</h1>

                <v-card v-if="currentLocation">
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
                                        Update Location
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>

                <v-skeleton-loader v-else type="card" />
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { LOCATION_PERMISSIONS } from '~/components/locations/location.permissions'

import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useLocation } from '~/composables/useLocation';
import { useOrganisation } from '~/composables/useOrganisation';
import FormField from '~/components/forms/FormField.vue';
import { updateLocationSchema } from '~/schemas/location.schema';
import type { UpdateLocationFormData } from '~/schemas/location.schema';

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: LOCATION_PERMISSIONS.WRITE },
});

const route = useRoute();
const locationId = computed(() => Number(route.params.id));

const { currentLocation, loading, fetchLocationById, updateLocation } = useLocation();
const { organisations, fetchOrganisations } = useOrganisation();

const formRef = ref();
const valid = ref(false);

const formData = ref<UpdateLocationFormData>({
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
        updateLocationSchema.parse(submitData);
        await updateLocation(locationId.value, submitData);
        navigateTo('/locations');
    } catch (error) {
        console.error('Validation or update error:', error);
    }
};

onMounted(async () => {
    await Promise.all([
        fetchOrganisations(),
        fetchLocationById(locationId.value),
    ]);
    
    if (currentLocation.value) {
        formData.value = {
            organisationId: currentLocation.value.organisationId,
            name: currentLocation.value.name,
            address: currentLocation.value.address || undefined,
            city: currentLocation.value.city || undefined,
            state: currentLocation.value.state || undefined,
            country: currentLocation.value.country || undefined,
            phoneNumber: currentLocation.value.phoneNumber || undefined,
            lat: currentLocation.value.lat || undefined,
            long: currentLocation.value.long || undefined,
            squareLocationId: currentLocation.value.squareLocationId || undefined,
            isActive: currentLocation.value.isActive,
        };
    }
});
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
