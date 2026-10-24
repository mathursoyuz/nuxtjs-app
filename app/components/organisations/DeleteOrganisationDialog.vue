<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="500"
        persistent
    >
        <v-card>
            <DialogsDialogHeader
                title="Delete organisation"
                :organisation-name="organisation?.name"
                entity-label="Organisation"
                :entity-name="organisation?.name"
                @close="$emit('update:modelValue', false)"
            />

            <v-divider />

            <v-card-text class="pa-4">
                <div v-if="organisation" class="text-body-1">
                    <p class="mb-4">
                        Are you sure you want to delete
                        <strong>{{ organisation.name }}</strong>
                        ?
                    </p>
                    <v-alert type="warning" variant="tonal" density="compact" class="mb-4">
                        This action will soft delete the organisation. This action cannot be undone.
                    </v-alert>
                    <div class="text-caption text-medium-emphasis">
                        <div>
                            <strong>Email:</strong>
                            {{ organisation.email }}
                        </div>
                        <div>
                            <strong>Website:</strong>
                            {{ organisation.websiteUrl }}
                        </div>
                    </div>
                </div>
            </v-card-text>

            <v-divider />

            <v-card-actions class="pa-4">
                <v-spacer />
                <v-btn
                    variant="outlined"
                    :disabled="loading"
                    @click="$emit('update:modelValue', false)"
                >
                    Cancel
                </v-btn>
                <v-btn color="error" :loading="loading" @click="handleDelete">Delete</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'
import { ORGANISATION_MESSAGES } from '~/constants/messages.constants'
import type { Organisation } from '~/types/organisation.types'

interface Props {
    modelValue: boolean
    organisation: Organisation | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const nuxtApp = useNuxtApp()
const organisationApi =
    nuxtApp.$organisationApi as import('~/services/api/wrappers/organisation.api').OrganisationApiService
const { successFromResponse, errorFromError, show: showToast } = useToast()

const loading = ref(false)

const handleDelete = async () => {
    if (!props.organisation) return

    loading.value = true
    try {
        const response = await organisationApi.deleteOrganisation(props.organisation.id)
        if (response.success) {
            successFromResponse(
                response,
                ORGANISATION_MESSAGES.DELETE_SUCCESS || 'Organisation deleted successfully'
            )
            emit('submit')
            emit('update:modelValue', false)
        }
    } catch (error) {
        console.error('Error deleting organisation:', error)
        errorFromError(error, ORGANISATION_MESSAGES.DELETE_ERROR)
    } finally {
        loading.value = false
    }
}
</script>
