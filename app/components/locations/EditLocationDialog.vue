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
                title="Edit location"
                entity-label="Location"
                :entity-name="formData.name"
                @close="$emit('update:modelValue', false)"
            />

            <v-divider></v-divider>

            <v-card-text class="pa-6">
                <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                    <LocationFormFields
                        v-model="formData"
                        :organisation-options="organisationOptions"
                        :country-options="countryOptions"
                        :state-options="stateOptions"
                        :rules="rules"
                        @country-change="handleCountryChange"
                    />
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
                    Update Location
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useLocation } from '~/composables/useLocation'
import { updateLocationSchema } from '~/schemas/location.schema'
import type { Location } from '~/types/location.types'
import { useLocationDialogFields } from './useLocationDialogFields'

const props = defineProps<{ modelValue: boolean; location: Location }>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { updateLocation } = useLocation()
const {
    formData,
    organisationOptions,
    countryOptions,
    stateOptions,
    rules,
    loadOptions,
    loadLocation,
    handleCountryChange,
    reset,
    toPayload,
} = useLocationDialogFields()

const formRef = ref<{ validate: () => Promise<{ valid: boolean }>; reset: () => void } | null>(null)
const valid = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)

watch(
    (): boolean => props.modelValue,
    async (isOpen: boolean, wasOpen: boolean | undefined): Promise<void> => {
        if (isOpen && !wasOpen) {
            isLoading.value = true
            try {
                await loadOptions()
                await loadLocation(props.location)
            } finally {
                isLoading.value = false
            }
        } else if (!isOpen && wasOpen) {
            reset()
            formRef.value?.reset()
        }
    },
    { immediate: true }
)

const handleSubmit = async (): Promise<void> => {
    const validation = await formRef.value?.validate()
    if (!validation?.valid) return

    isSubmitting.value = true
    try {
        await updateLocation(props.location.id, updateLocationSchema.parse(toPayload()))
        emit('submit')
        emit('update:modelValue', false)
    } catch (error: unknown) {
        console.error('Validation or save error:', error)
    } finally {
        isSubmitting.value = false
    }
}
</script>
