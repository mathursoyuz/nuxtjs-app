import { computed } from 'vue';
import { useNuxtApp } from '#app';
import { useCategoryStore } from '~/stores/category.store';
import { useToast } from '~/composables/useToast';
import { CATEGORY_MESSAGES } from '~/constants/messages.constants';
import type { Category, CreateCategoryDTO, UpdateCategoryDTO } from '~/types/category.types';

export function useCategory() {
    const nuxtApp = useNuxtApp();
    const categoryStore = useCategoryStore();
    const categoryApi = nuxtApp.$categoryApi as import('~/services/api/wrappers/category.api').CategoryApiService;
    const { successFromResponse, errorFromError } = useToast();

    if (!categoryApi) {
        throw new Error('CategoryApiService not available');
    }

    const fetchCategories = async (): Promise<Category[]> => {
        categoryStore.setLoading(true);
        categoryStore.clearError();

        try {
            const response = await categoryApi.getAllCategories();
            if (response.success && response.data) {
                categoryStore.setCategories(response.data);
                successFromResponse(response, CATEGORY_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch categories');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch categories';
            categoryStore.setError(errorMessage);
            errorFromError(error, CATEGORY_MESSAGES.FETCH_ERROR);
            throw error;
        } finally {
            categoryStore.setLoading(false);
        }
    };

    const fetchCategoryById = async (id: number): Promise<Category> => {
        categoryStore.setLoading(true);
        categoryStore.clearError();

        try {
            const response = await categoryApi.getCategoryById(id);
            if (response.success && response.data) {
                categoryStore.setCurrentCategory(response.data);
                successFromResponse(response, CATEGORY_MESSAGES.FETCH_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to fetch category');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch category';
            categoryStore.setError(errorMessage);
            errorFromError(error, CATEGORY_MESSAGES.FETCH_ERROR);
            throw error;
        } finally {
            categoryStore.setLoading(false);
        }
    };

    const createCategory = async (data: CreateCategoryDTO): Promise<Category> => {
        categoryStore.setLoading(true);
        categoryStore.clearError();

        try {
            const response = await categoryApi.createCategory(data);
            if (response.success && response.data) {
                categoryStore.addCategory(response.data);
                successFromResponse(response, CATEGORY_MESSAGES.CREATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to create category');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
            categoryStore.setError(errorMessage);
            errorFromError(error, CATEGORY_MESSAGES.CREATE_ERROR);
            throw error;
        } finally {
            categoryStore.setLoading(false);
        }
    };

    const updateCategory = async (id: number, data: UpdateCategoryDTO): Promise<Category> => {
        categoryStore.setLoading(true);
        categoryStore.clearError();

        try {
            const response = await categoryApi.updateCategory(id, data);
            if (response.success && response.data) {
                categoryStore.updateCategory(response.data);
                successFromResponse(response, CATEGORY_MESSAGES.UPDATE_SUCCESS);
                return response.data;
            }
            throw new Error(response.message || 'Failed to update category');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update category';
            categoryStore.setError(errorMessage);
            errorFromError(error, CATEGORY_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            categoryStore.setLoading(false);
        }
    };

    const uploadImage = async (id: number, file: File): Promise<Category> => {
        categoryStore.setLoading(true);
        categoryStore.clearError();

        try {
            const response = await categoryApi.uploadCategoryImage(id, file);
            if (response.success && response.data) {
                categoryStore.updateCategory(response.data);
                successFromResponse(response, 'Category image uploaded successfully');
                return response.data;
            }
            throw new Error(response.message || 'Failed to upload image');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
            categoryStore.setError(errorMessage);
            errorFromError(error, CATEGORY_MESSAGES.UPDATE_ERROR);
            throw error;
        } finally {
            categoryStore.setLoading(false);
        }
    };

    const deleteCategory = async (id: number): Promise<void> => {
        categoryStore.setLoading(true);
        categoryStore.clearError();

        try {
            const response = await categoryApi.deleteCategory(id);
            if (response.success) {
                categoryStore.removeCategory(id);
                successFromResponse(response, CATEGORY_MESSAGES.DELETE_SUCCESS);
            } else {
                throw new Error(response.message || 'Failed to delete category');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
            categoryStore.setError(errorMessage);
            errorFromError(error, CATEGORY_MESSAGES.DELETE_ERROR);
            throw error;
        } finally {
            categoryStore.setLoading(false);
        }
    };

    return {
        categories: computed(() => categoryStore.categories),
        currentCategory: computed(() => categoryStore.currentCategory),
        loading: computed(() => categoryStore.loading),
        error: computed(() => categoryStore.error),
        activeCategories: computed(() => categoryStore.activeCategories),
        rootCategories: computed(() => categoryStore.rootCategories),
        subCategories: (parentId: number) => computed(() => categoryStore.subCategories(parentId)),
        fetchCategories,
        fetchCategoryById,
        createCategory,
        updateCategory,
        uploadImage,
        deleteCategory,
    };
}
