import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Category } from '~/types/category.types'

export const useCategoryStore = defineStore('category', () => {
    const categories = ref<Category[]>([])
    const currentCategory = ref<Category | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeCategories = computed(() =>
        categories.value.filter((category) => category.isActive)
    )
    const categoryById = computed(
        () => (id: number) => categories.value.find((category) => category.id === id)
    )
    const rootCategories = computed(() =>
        categories.value.filter((category) => category.parentId === null)
    )
    const subCategories = computed(
        () => (parentId: number) =>
            categories.value.filter((category) => category.parentId === parentId)
    )

    const setCategories = (value: Category[]): void => {
        categories.value = value
    }

    const setCurrentCategory = (value: Category | null): void => {
        currentCategory.value = value
    }

    const addCategory = (category: Category): void => {
        categories.value.push(category)
    }

    const updateCategory = (category: Category): void => {
        const index = categories.value.findIndex((item) => item.id === category.id)
        if (index >= 0) categories.value[index] = category
        if (currentCategory.value?.id === category.id) currentCategory.value = category
    }

    const removeCategory = (id: number): void => {
        categories.value = categories.value.filter((category) => category.id !== id)
        if (currentCategory.value?.id === id) currentCategory.value = null
    }

    const setLoading = (value: boolean): void => {
        loading.value = value
    }

    const setError = (value: string | null): void => {
        error.value = value
    }

    const clearError = (): void => {
        error.value = null
    }

    return {
        categories,
        currentCategory,
        loading,
        error,
        activeCategories,
        categoryById,
        rootCategories,
        subCategories,
        setCategories,
        setCurrentCategory,
        addCategory,
        updateCategory,
        removeCategory,
        setLoading,
        setError,
        clearError,
    }
})
