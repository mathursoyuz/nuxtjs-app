<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Edit Category</h1>

                <v-card v-if="currentCategory">
                    <v-card-text>
                        <v-form ref="formRef" v-model="valid" @submit.prevent="handleSubmit">
                            <v-row>
                                <FormField
                                    v-model="formData.name"
                                    label="Category Name"
                                    type="text"
                                    :required="true"
                                    :rules="[rules.required]"
                                />

                                <FormField
                                    v-model="formData.slug"
                                    label="Slug"
                                    type="text"
                                    :required="true"
                                    :rules="[rules.required]"
                                />

                                <v-col cols="12" md="6">
                                    <v-select
                                        v-model="formData.parentId"
                                        label="Parent Category"
                                        :items="parentCategoryOptions"
                                        :rules="[rules.required]"
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

                                <FormField
                                    v-model="formData.isActive"
                                    label="Active"
                                    type="switch"
                                />

                                <v-col cols="12">
                                    <label class="text-body-2 font-weight-medium mb-2 d-block">
                                        Category Image
                                    </label>
                                    <ImageUpload
                                        v-model="imageFile"
                                        title="Drop category image here to upload"
                                        hint="Recommended size: 300x300px. Max size: 2MB"
                                        :existing-image-url="
                                            currentCategory?.image
                                                ? `/uploads/categories/${currentCategory.image}`
                                                : null
                                        "
                                    />
                                </v-col>
                            </v-row>

                            <v-row class="mt-4">
                                <v-col cols="12" class="d-flex justify-end gap-2">
                                    <v-btn variant="outlined" @click="navigateTo('/categories')">
                                        Cancel
                                    </v-btn>
                                    <v-btn
                                        color="primary"
                                        type="submit"
                                        :loading="loading"
                                        :disabled="!valid"
                                    >
                                        Update Category
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
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLoadingStore } from '~/stores/loading.store'
import { useCategory } from '~/composables/useCategory'
import { useToast } from '~/composables/useToast'
import { CATEGORY_MESSAGES } from '~/constants/messages.constants'
import FormField from '~/components/forms/FormField.vue'

import ImageUpload from '~/components/forms/ImageUpload.vue'
import { updateCategorySchema } from '~/schemas/category.schema'
import type { UpdateCategoryFormData } from '~/schemas/category.schema'

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
})

const route = useRoute()
const categoryId = computed(() => Number(route.params.id))

const {
    currentCategory,
    loading,
    fetchCategoryById,
    updateCategory,
    uploadImage,
    categories,
    fetchCategories,
} = useCategory()
const { successFromResponse, errorFromError } = useToast()
const loadingStore = useLoadingStore()

const formRef = ref()
const valid = ref(false)
const imageFile = ref<File | null>(null)

const formData = ref<UpdateCategoryFormData>({
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
        ...categories.value
            .filter((c) => c.id !== categoryId.value)
            .map((c) => ({
                title: c.name,
                value: c.id,
            })),
    ]
})

const rules = {
    required: (v: unknown) => !!v || 'This field is required',
}

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return

    const taskId = `update-category-${categoryId.value}`
    loadingStore.startTask(taskId, 'Updating category...')

    try {
        updateCategorySchema.parse(formData.value)
        await updateCategory(categoryId.value, formData.value)

        if (imageFile.value) {
            await uploadImage(categoryId.value, imageFile.value)
        }

        successFromResponse(
            { success: true, message: '', data: null },
            CATEGORY_MESSAGES.UPDATE_SUCCESS
        )
        navigateTo('/categories')
    } catch (err) {
        console.error('Validation or update error:', err)
        errorFromError(err, CATEGORY_MESSAGES.UPDATE_ERROR)
    } finally {
        loadingStore.stopTask(taskId)
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: categoryEditPending } = await useLazyAsyncData(
    'category-edit-initial',
    async () => {
        await Promise.all([fetchCategories(), fetchCategoryById(categoryId.value)])

        if (currentCategory.value) {
            formData.value = {
                parentId: currentCategory.value.parentId,
                name: currentCategory.value.name,
                slug: currentCategory.value.slug,
                description: currentCategory.value.description,
                image: currentCategory.value.image,
                isActive: currentCategory.value.isActive,
            }
        }
    }
)
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
