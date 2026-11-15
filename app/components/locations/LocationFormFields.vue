<template>
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
                @update:model-value="emit('countryChange', $event)"
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
</template>

<script setup lang="ts">
import type { CreateLocationFormData } from '~/schemas/location.schema'

interface LocationFieldRules {
    required: (value: unknown) => true | string
    latitude: (value: unknown) => true | string
    longitude: (value: unknown) => true | string
}

const formData = defineModel<CreateLocationFormData>({ required: true })
defineProps<{
    organisationOptions: Array<{ title: string; value: number }>
    countryOptions: Array<{ title: string; value: string }>
    stateOptions: Array<{ title: string; value: string }>
    rules: LocationFieldRules
}>()
const emit = defineEmits<{ countryChange: [countryId: string | null] }>()
</script>
