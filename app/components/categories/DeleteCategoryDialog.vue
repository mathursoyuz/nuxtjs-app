<template>
    <v-dialog
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        max-width="500"
        persistent
    >
        <v-overlay :model-value="isDeleting" class="align-center justify-center">
            <v-progress-circular indeterminate color="error" size="64"></v-progress-circular>
        </v-overlay>

        <v-card>
            <DialogsDialogHeader
                title="Delete category"
                entity-label="Category"
                :entity-name="category?.name"
                @close="$emit('update:modelValue', false)"
            />

            <v-divider></v-divider>

            <v-card-text class="pa-6">
                <v-alert type="warning" variant="tonal" class="mb-4">
                    <strong>Warning:</strong>
                    This action cannot be undone.
                </v-alert>
                <p class="text-body-1">
                    Are you sure you want to delete the category
                    <strong>"{{ category?.name }}"</strong>
                    ?
                </p>
                <p v-if="category?.parentId === 0" class="text-caption text-medium-emphasis mt-2">
                    This is a root category. Deleting it may affect child categories.
                </p>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4">
                <v-spacer></v-spacer>
                <v-btn
                    variant="text"
                    @click="$emit('update:modelValue', false)"
                    :disabled="isDeleting"
                >
                    Cancel
                </v-btn>
                <v-btn color="error" :loading="isDeleting" @click="handleDelete">
                    Delete Category
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLoadingStore } from '~/stores/loading.store'
import { useCategory } from '~/composables/useCategory'
import { useToast } from '~/composables/useToast'
import { CATEGORY_MESSAGES } from '~/constants/messages.constants'
import type { Category } from '~/types/category.types'

interface Props {
    modelValue: boolean
    category?: Category | null
}

const props = withDefaults(defineProps<Props>(), {
    category: null,
})

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { deleteCategory } = useCategory()
const { successFromResponse, errorFromError } = useToast()
const loadingStore = useLoadingStore()

const isDeleting = ref(false)

const handleDelete = async () => {
    if (!props.category) return

    isDeleting.value = true
    const taskId = `delete-category-${props.category.id}`
    loadingStore.startTask(taskId, 'Deleting category...')

    try {
        const response = await deleteCategory(props.category.id)
        successFromResponse(response, CATEGORY_MESSAGES.DELETE_SUCCESS)
        emit('submit')
        emit('update:modelValue', false)
    } catch (err) {
        console.error('Error deleting category:', err)
        errorFromError(err, CATEGORY_MESSAGES.DELETE_ERROR)
    } finally {
        isDeleting.value = false
        loadingStore.stopTask(taskId)
    }
}
</script>
