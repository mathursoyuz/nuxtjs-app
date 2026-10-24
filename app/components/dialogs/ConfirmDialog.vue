<template>
    <v-dialog
        :model-value="modelValue"
        :max-width="maxWidth"
        persistent
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                :title="title"
                :organisation-name="organisationName"
                :entity-label="entityLabel"
                :entity-name="entityName"
                :scope="scope"
                :closeable="false"
            />

            <v-card-text>
                <p class="text-body-1">{{ message }}</p>
                <p v-if="details" class="text-body-2 text-grey mt-2">{{ details }}</p>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" :disabled="loading" @click="$emit('cancel')">
                    {{ cancelText }}
                </v-btn>
                <v-btn :color="confirmColor" :loading="loading" @click="$emit('confirm')">
                    {{ confirmText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
interface Props {
    modelValue: boolean
    title: string
    message: string
    details?: string
    confirmText?: string
    cancelText?: string
    confirmColor?: string
    icon?: string
    iconColor?: string
    maxWidth?: number | string
    loading?: boolean
    organisationName?: string
    entityLabel?: string
    entityName?: string
    scope?: string
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'confirm'): void
    (e: 'cancel'): void
}

withDefaults(defineProps<Props>(), {
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'primary',
    icon: 'mdi-alert-circle',
    iconColor: 'warning',
    maxWidth: 500,
    loading: false,
    organisationName: undefined,
    entityLabel: undefined,
    entityName: undefined,
    scope: undefined,
})

defineEmits<Emits>()
</script>
