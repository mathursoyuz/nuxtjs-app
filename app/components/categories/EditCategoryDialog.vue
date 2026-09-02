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
                <span class="text-h4">Edit Category</span>
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
                                :existing-image-url="existingImageUrl"
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
                    Update Category
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
import { updateCategorySchema } from '~/schemas/category.schema'
import type { UpdateCategoryFormData } from '~/schemas/category.schema'
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

const { updateCategory, uploadImage, categories, fetchCategories, fetchCategoryById } =
    useCategory()
const { successFromResponse, errorFromError } = useToast()
const loadingStore = useLoadingStore()

const formRef = ref()
const valid = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)
const imageFile = ref<File | null>(null)
const existingImageUrl = ref<string | null>(null)

const formData = ref<UpdateCategoryFormData>({
    parentId: 0,
    name: '',
    slug: '',
    description: null,
    image: null,
    isActive: true,
})

const parentCategoryOptions = computed(() => {
    const categoryId = props.category?.id
    return [
        { title: 'Root (No Parent)', value: 0 },
        ...categories.value
            .filter((c) => c.id !== categoryId)
            .map((c) => ({
                title: c.name,
                value: c.id,
            })),
    ]
})

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
}

// Watch for dialog open to load category data
watch(
    () => props.modelValue,
    async (isOpen, wasOpen) => {
        if (isOpen && !wasOpen && props.category) {
            isLoading.value = true
            try {
                await Promise.all([fetchCategories(), fetchCategoryById(props.category.id)])

                if (props.category) {
                    formData.value = {
                        parentId: props.category.parentId,
                        name: props.category.name,
                        slug: props.category.slug,
                        description: props.category.description,
                        image: props.category.image,
                        isActive: props.category.isActive,
                    }

                    if (props.category.image) {
                        existingImageUrl.value = `/uploads/categories/${props.category.image}`
                    } else {
                        existingImageUrl.value = null
                    }
                }
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
            existingImageUrl.value = null
            if (formRef.value) {
                formRef.value.reset()
            }
        }
    }
)

// Watch for category changes
watch(
    () => props.category,
    async (newCategory) => {
        if (props.modelValue && newCategory) {
            isLoading.value = true
            try {
                await fetchCategoryById(newCategory.id)
                if (newCategory) {
                    formData.value = {
                        parentId: newCategory.parentId,
                        name: newCategory.name,
                        slug: newCategory.slug,
                        description: newCategory.description,
                        image: newCategory.image,
                        isActive: newCategory.isActive,
                    }

                    if (newCategory.image) {
                        existingImageUrl.value = `/uploads/categories/${newCategory.image}`
                    } else {
                        existingImageUrl.value = null
                    }
                }
            } finally {
                isLoading.value = false
            }
        }
    },
    { deep: true }
)

const handleSubmit = async () => {
    if (!formRef.value?.validate() || !props.category) return

    isSubmitting.value = true
    const taskId = `update-category-${props.category.id}`
    loadingStore.startTask(taskId, 'Updating category...')

    try {
        updateCategorySchema.parse(formData.value)
        const response = await updateCategory(props.category.id, formData.value)

        if (imageFile.value) {
            await uploadImage(props.category.id, imageFile.value)
        }

        successFromResponse(response, CATEGORY_MESSAGES.UPDATE_SUCCESS)
        emit('submit')
        emit('update:modelValue', false)
    } catch (err) {
        console.error('Validation or update error:', err)
        errorFromError(err, CATEGORY_MESSAGES.UPDATE_ERROR)
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
