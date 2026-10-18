<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">Create Category</h1>

                <v-card>
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
                                        Create Category
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { CATEGORY_PERMISSIONS } from '~/components/categories/category.permissions'

import { ref, computed } from 'vue'
import { useLoadingStore } from '~/stores/loading.store'
import { useCategory } from '~/composables/useCategory'
import { useToast } from '~/composables/useToast'
import { CATEGORY_MESSAGES } from '~/constants/messages.constants'
import FormField from '~/components/forms/FormField.vue'

import ImageUpload from '~/components/forms/ImageUpload.vue'
import { createCategorySchema } from '~/schemas/category.schema'
import type { CreateCategoryFormData } from '~/schemas/category.schema'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CATEGORY_PERMISSIONS.WRITE },
})

const { createCategory, loading, fetchCategories, uploadImage, categories } = useCategory()
const { successFromResponse, errorFromError } = useToast()
const loadingStore = useLoadingStore()

const formRef = ref()
const valid = ref(false)
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

const handleSubmit = async () => {
    if (!formRef.value?.validate()) return

    const taskId = 'create-category'
    loadingStore.startTask(taskId, 'Creating category...')

    try {
        createCategorySchema.parse(formData.value)
        const category = await createCategory(formData.value)

        if (imageFile.value) {
            await uploadImage(category.id, imageFile.value)
        }

        successFromResponse(
            { success: true, message: '', data: category },
            CATEGORY_MESSAGES.CREATE_SUCCESS
        )
        navigateTo('/categories')
    } catch (err) {
        console.error('Validation or creation error:', err)
        errorFromError(err, CATEGORY_MESSAGES.CREATE_ERROR)
    } finally {
        loadingStore.stopTask(taskId)
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: categoryCreatePending } = await useLazyAsyncData(
    'category-create-initial',
    async () => {
        await fetchCategories()
    }
)
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
