<template>
    <v-dialog
        :model-value="modelValue"
        :max-width="maxWidth"
        :persistent="persistent"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                :title="title"
                :organisation-name="organisationName"
                :entity-label="entityLabel"
                :entity-name="entityName"
                :scope="scope"
                @close="$emit('close')"
            />

            <v-divider />

            <v-card-text class="pt-4">
                <slot />
            </v-card-text>

            <v-divider />

            <v-card-actions>
                <v-spacer />
                <v-btn variant="text" @click="$emit('cancel')">
                    {{ cancelText }}
                </v-btn>
                <v-btn :color="submitColor" :loading="loading" @click="$emit('submit')">
                    {{ submitText }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
interface Props {
    modelValue: boolean
    title: string
    submitText?: string
    cancelText?: string
    submitColor?: string
    loading?: boolean
    persistent?: boolean
    maxWidth?: number | string
    organisationName?: string
    entityLabel?: string
    entityName?: string
    scope?: string
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'submit'): void
    (e: 'cancel'): void
    (e: 'close'): void
}

withDefaults(defineProps<Props>(), {
    submitText: 'Save',
    cancelText: 'Cancel',
    submitColor: 'primary',
    loading: false,
    persistent: false,
    maxWidth: 600,
    organisationName: undefined,
    entityLabel: undefined,
    entityName: undefined,
    scope: undefined,
})

defineEmits<Emits>()
</script>
