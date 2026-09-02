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
            <v-card-title class="d-flex align-center justify-space-between pa-4">
                <span class="text-h4">Create Category</span>
                <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <v-divider></v-divider>

            <v-card-text class="pa-6">
                <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                    <v-row>
                        <v-col cols="12">
                            <label class="text-body-2 font-weight-medium mb-2 d-block">
                                Category Name
                                <span class="text-error">*</span>
                            </label>
                            <v-text-field
                                v-model="formData.name"
                                placeholder="Category Name"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12">
                            <label class="text-body-2 font-weight-medium mb-2 d-block">
                                Slug
                                <span class="text-error">*</span>
                            </label>
                            <v-text-field
                                v-model="formData.slug"
                                placeholder="category-slug"
                                variant="outlined"
                                density="compact"
                                :rules="[rules.required]"
                                hide-details="auto"
                            />
                        </v-col>

                        <v-col cols="12">
                            <label class="text-body-2 font-weight-medium mb-2 d-block">
                                Parent Category
                            </label>
                            <v-select
                                v-model="formData.parentId"
                                :items="parentCategoryOptions"
                                item-title="title"
                                item-value="value"
                                variant="outlined"
                                density="compact"
                            />
                        </v-col>

                        <v-col cols="12">
                            <label class="text-body-2 font-weight-medium mb-2 d-block">
                                Description
                            </label>
                            <FormsRichTextEditor
                                :model-value="formData.description"
                                @update:model-value="formData.description = $event"
                            />
                        </v-col>

                        <v-col cols="12">
                            <label class="text-body-2 font-weight-medium mb-2 d-block">
                                Category Image
                            </label>
                            <ImageUpload
                                v-model="imageFile"
                                title="Drop category image here to upload"
                                hint="Recommended size: 300x300px. Max size: 2MB"
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
                    Create Category
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useLoadingStore } from '~/stores/loading.store'
import { useCategory } from '~/composables/useCategory'
import { useToast } from '~/composables/useToast'
import ImageUpload from '~/components/forms/ImageUpload.vue'
import { createCategorySchema } from '~/schemas/category.schema'
import type { CreateCategoryFormData } from '~/schemas/category.schema'

interface Props {
    modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    submit: []
}>()

const { createCategory, uploadImage, categories, fetchCategories } = useCategory()
const { successFromResponse, errorFromError } = useToast()
const loadingStore = useLoadingStore()

const formRef = ref()
const valid = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)
const imageFile = ref<File | null>(null)

const formData = ref<CreateCategoryFormData>({
    parentId: 0,
    name: '',
    slug: '',
    description: null,
    image: null,
    isActive: true,
})

const parentCategoryOptions = computed(() => {
    return [
        { title: 'Root (No Parent)', value: 0 },
        ...categories.value.map((c) => ({
            title: c.name,
            value: c.id,
        })),
    ]
})

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
}

// Watch for dialog open to show loading
watch(
    () => props.modelValue,
    async (isOpen, wasOpen) => {
        if (isOpen && !wasOpen) {
            isLoading.value = true
            try {
                await fetchCategories()
            } finally {
                isLoading.value = false
            }
        } else if (!isOpen && wasOpen) {
            // Reset form when dialog closes
            formData.value = {
                parentId: 0,
                name: '',
                slug: '',
                description: null,
                image: null,
                isActive: true,
            }
            imageFile.value = null
            if (formRef.value) {
                formRef.value.reset()
            }
        }
    }
)

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return

    isSubmitting.value = true
    const taskId = 'create-category'
    loadingStore.startTask(taskId, 'Creating category...')

    try {
        createCategorySchema.parse(formData.value)
        const response = await createCategory(formData.value)

        if (imageFile.value && response?.id) {
            await uploadImage(response.id, imageFile.value)
        }

        successFromResponse(response, CATEGORY_MESSAGES.CREATE_SUCCESS)
        emit('submit')
        emit('update:modelValue', false)
    } catch (err) {
        console.error('Validation or creation error:', err)
        errorFromError(err, CATEGORY_MESSAGES.CREATE_ERROR)
    } finally {
        isSubmitting.value = false
        loadingStore.stopTask(taskId)
    }
}
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
