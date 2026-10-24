<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="800"
        scrollable
        persistent
    >
        <v-overlay :model-value="isLoading" class="align-center justify-center">
            <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </v-overlay>

        <v-card>
            <DialogsDialogHeader
                :title="isEditMode ? 'Edit location' : 'Create location'"
                entity-label="Location"
                :entity-name="isEditMode ? formData.name : 'New location'"
                @close="$emit('update:modelValue', false)"
            />

            <v-divider></v-divider>

            <v-card-text class="pa-6">
                <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-select
                                v-model="formData.organisationId"
                                label="Organisation"
                                :items="organisationOptions"
                                :rules="[rules.required]"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.name"
                                label="Location Name"
                                :rules="[rules.required]"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-text-field
                                v-model="formData.address"
                                label="Address"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.city"
                                label="City"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="formData.country"
                                label="Country"
                                :items="countryOptions"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                clearable
                                hide-details="auto"
                                @update:model-value="handleCountryChange"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-select
                                v-model="formData.state"
                                label="State"
                                :items="stateOptions"
                                :disabled="!formData.country"
                                variant="outlined"
                                density="compact"
                                item-title="title"
                                item-value="value"
                                clearable
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.phoneNumber"
                                label="Phone Number"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.lat"
                                label="Latitude"
                                type="number"
                                step="any"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.latitude]"
                                hint="Range: -90 to 90"
                                persistent-hint
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12" md="6">
                            <v-text-field
                                v-model="formData.long"
                                label="Longitude"
                                type="number"
                                step="any"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.longitude]"
                                hint="Range: -180 to 180"
                                persistent-hint
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-switch
                                v-model="formData.isActive"
                                label="Active"
                                color="primary"
                                density="compact"
                                hide-details
                            />
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn variant="text" @click="$emit('update:modelValue', false)">Cancel</v-btn>
                <v-btn
                    color="primary"
                    :loading="isSubmitting"
                    :disabled="!valid"
                    @click="handleSubmit"
                >
                    {{ isEditMode ? 'Update Location' : 'Create Location' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useLocation } from '~/composables/useLocation'
import { useOrganisation } from '~/composables/useOrganisation'
import { useCountry } from '~/composables/useCountry'
import { useToast } from '~/composables/useToast'
import { LOCATION_MESSAGES } from '~/constants/messages.constants'
import { createLocationSchema, updateLocationSchema } from '~/schemas/location.schema'
import type { CreateLocationFormData, UpdateLocationFormData } from '~/schemas/location.schema'
import type { Location } from '~/types/location.types'

interface Props {
    modelValue: boolean
    location?: Location | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { createLocation, updateLocation, fetchLocationById } = useLocation()
const { organisations, fetchOrganisations } = useOrganisation()
const { countries, countryOptions, fetchCountries, fetchStates, getStateOptions } = useCountry()
const { successFromResponse, errorFromError } = useToast()

const formRef = ref()
const valid = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)

const isEditMode = computed(() => !!props.location)

const formData = ref<CreateLocationFormData | UpdateLocationFormData>({
    organisationId: 0,
    name: '',
    address: undefined,
    city: undefined,
    state: undefined,
    country: undefined,
    phoneNumber: undefined,
    lat: undefined,
    long: undefined,
    isActive: true,
})

const organisationOptions = computed(() => {
    return organisations.value.map((c) => ({
        title: c.name,
        value: c.id,
    }))
})

const stateOptions = computed(() => {
    if (!formData.value.country) {
        return []
    }
    const options = getStateOptions(formData.value.country)
    return options.value
})

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
    latitude: (v: unknown) => {
        if (v === null || v === undefined || v === '') return true // Optional field
        const num = typeof v === 'string' ? parseFloat(v) : Number(v)
        if (isNaN(num)) return 'Latitude must be a valid number'
        if (num < -90 || num > 90) return 'Latitude must be between -90 and 90'
        return true
    },
    longitude: (v: unknown) => {
        if (v === null || v === undefined || v === '') return true // Optional field
        const num = typeof v === 'string' ? parseFloat(v) : Number(v)
        if (isNaN(num)) return 'Longitude must be a valid number'
        if (num < -180 || num > 180) return 'Longitude must be between -180 and 180'
        return true
    },
}

const handleCountryChange = async (countryId: string | null) => {
    // Clear state when country changes
    formData.value.state = undefined

    if (countryId) {
        await fetchStates(countryId)
    }
}

// Watch for dialog open to load data
watch(
    () => props.modelValue,
    async (isOpen, wasOpen) => {
        if (isOpen && !wasOpen) {
            isLoading.value = true
            try {
                await Promise.all([fetchOrganisations(), fetchCountries()])

                if (isEditMode.value && props.location) {
                    // Load location data for editing
                    formData.value = {
                        organisationId: props.location.organisationId,
                        name: props.location.name,
                        address: props.location.address || undefined,
                        city: props.location.city || undefined,
                        state: props.location.state || undefined,
                        country: props.location.country || undefined,
                        phoneNumber: props.location.phoneNumber || undefined,
                        lat: props.location.lat || undefined,
                        long: props.location.long || undefined,
                        isActive: props.location.isActive,
                    }

                    // Load states if country is set
                    if (formData.value.country) {
                        await fetchStates(formData.value.country)
                    }
                } else {
                    // Reset form for new location
                    formData.value = {
                        organisationId: 0,
                        name: '',
                        address: undefined,
                        city: undefined,
                        state: undefined,
                        country: undefined,
                        phoneNumber: undefined,
                        lat: undefined,
                        long: undefined,
                        isActive: true,
                    }
                }
            } finally {
                isLoading.value = false
            }
        } else if (!isOpen && wasOpen) {
            // Reset form when dialog closes
            formData.value = {
                organisationId: 0,
                name: '',
                address: undefined,
                city: undefined,
                state: undefined,
                country: undefined,
                phoneNumber: undefined,
                lat: undefined,
                long: undefined,
                isActive: true,
            }
            if (formRef.value) {
                formRef.value.reset()
            }
        }
    }
)

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return

    isSubmitting.value = true

    try {
        // Clean and format the data before submission
        const submitData = {
            ...formData.value,
            organisationId: Number(formData.value.organisationId),
            // Convert lat/long to strings and ensure they're properly formatted
            // Round to 8 decimal places to match database scale
            lat: formData.value.lat
                ? Number(parseFloat(String(formData.value.lat)).toFixed(8)).toString()
                : undefined,
            long: formData.value.long
                ? Number(parseFloat(String(formData.value.long)).toFixed(8)).toString()
                : undefined,
        }

        // Remove empty strings
        if (submitData.lat === '' || submitData.lat === 'NaN') submitData.lat = undefined
        if (submitData.long === '' || submitData.long === 'NaN') submitData.long = undefined

        if (isEditMode.value && props.location) {
            updateLocationSchema.parse(submitData)
            const response = await updateLocation(props.location.id, submitData)
            successFromResponse(response, LOCATION_MESSAGES.UPDATE_SUCCESS)
        } else {
            createLocationSchema.parse(submitData)
            const response = await createLocation(submitData as CreateLocationFormData)
            successFromResponse(response, LOCATION_MESSAGES.CREATE_SUCCESS)
        }

        emit('submit')
        emit('update:modelValue', false)
    } catch (err) {
        console.error('Validation or save error:', err)
        errorFromError(
            err,
            isEditMode.value ? LOCATION_MESSAGES.UPDATE_ERROR : LOCATION_MESSAGES.CREATE_ERROR
        )
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
