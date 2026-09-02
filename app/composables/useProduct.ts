import { computed } from 'vue'
import { useNuxtApp } from '#app'
import { useProductStore } from '~/stores/product.store'
import { useToast } from '~/composables/useToast'
import { PRODUCT_MESSAGES } from '~/constants/messages.constants'
import type { Product, CreateProductDTO, UpdateProductDTO } from '~/types/product.types'

export function useProduct() {
    const nuxtApp = useNuxtApp()
    const productStore = useProductStore()
    const productApi =
        nuxtApp.$productApi as import('~/services/api/wrappers/product.api').ProductApiService
    const { successFromResponse, errorFromError } = useToast()

    if (!productApi) {
        throw new Error('ProductApiService not available. Make sure it is injected in the plugin.')
    }

    const fetchProducts = async (): Promise<Product[]> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.getAllProducts()
            if (response.success && response.data) {
                productStore.setProducts(response.data)
                successFromResponse(response, PRODUCT_MESSAGES.FETCH_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to fetch products')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.FETCH_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const fetchProductById = async (id: number): Promise<Product> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.getProductById(id)
            if (response.success && response.data) {
                productStore.setCurrentProduct(response.data)
                successFromResponse(response, PRODUCT_MESSAGES.FETCH_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to fetch product')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.FETCH_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const checkSku = async (sku: string, variantId?: number): Promise<boolean> => {
        try {
            const response = await productApi.checkSku(sku, variantId)
            if (response.success && response.data) {
                return response.data.available
            }
            return false
        } catch (error) {
            console.error('Error checking SKU:', error)
            return false
        }
    }

    const createProduct = async (data: CreateProductDTO): Promise<Product> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.createProduct(data)
            if (response.success && response.data) {
                productStore.addProduct(response.data)
                successFromResponse(response, PRODUCT_MESSAGES.CREATE_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to create product')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create product'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.CREATE_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const updateProduct = async (id: number, data: UpdateProductDTO): Promise<Product> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.updateProduct(id, data)
            if (response.success && response.data) {
                productStore.updateProduct(response.data)
                successFromResponse(response, PRODUCT_MESSAGES.UPDATE_SUCCESS)
                return response.data
            }
            throw new Error(response.message || 'Failed to update product')
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update product'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.UPDATE_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const deleteProduct = async (id: number): Promise<void> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.deleteProduct(id)
            if (response.success) {
                productStore.removeProduct(id)
                successFromResponse(response, PRODUCT_MESSAGES.DELETE_SUCCESS)
            } else {
                throw new Error(response.message || 'Failed to delete product')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete product'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.DELETE_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const toggleActive = async (id: number, isActive: boolean): Promise<void> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.toggleActive(id, isActive)
            if (response.success && response.data) {
                productStore.setProductActive(response.data.id, response.data.isActive)
                const fallbackMessage = isActive
                    ? 'Product activated successfully'
                    : 'Product deactivated successfully'
                successFromResponse(response, fallbackMessage)
                return
            }
            throw new Error(response.message || 'Failed to toggle product status')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to toggle product status'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.UPDATE_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const syncProductToQB = async (
        productId: number
    ): Promise<{ created: boolean; qbId: string }> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.syncProductToQB(productId)
            if (response.success && response.data) {
                successFromResponse(response, PRODUCT_MESSAGES.SYNC_QB_SUCCESS)
                // Refresh products to get updated sync status
                await fetchProducts()
                return response.data
            }
            throw new Error(response.message || 'Failed to sync product to QuickBooks')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to sync product to QuickBooks'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.SYNC_QB_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    const importAllProductsFromSquare = async (): Promise<{
        created: number
        updated: number
        skipped: number
        errors: Array<{ item: string; error: string }>
    }> => {
        productStore.setLoading(true)
        productStore.clearError()

        try {
            const response = await productApi.importAllProductsFromSquare()
            if (response.success && response.data) {
                successFromResponse(response, PRODUCT_MESSAGES.IMPORT_SQUARE_SUCCESS)
                // Refresh products to get newly imported products
                await fetchProducts()
                return response.data
            }
            throw new Error(response.message || 'Failed to import products from Square')
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to import products from Square'
            productStore.setError(errorMessage)
            errorFromError(error, PRODUCT_MESSAGES.IMPORT_SQUARE_ERROR)
            throw error
        } finally {
            productStore.setLoading(false)
        }
    }

    return {
        products: computed(() => productStore.products),
        currentProduct: computed(() => productStore.currentProduct),
        loading: computed(() => productStore.loading),
        error: computed(() => productStore.error),
        activeProducts: computed(() => productStore.activeProducts),
        featuredProducts: computed(() => productStore.featuredProducts),
        fetchProducts,
        fetchProductById,
        checkSku,
        createProduct,
        updateProduct,
        deleteProduct,
        toggleActive,
        syncProductToQB,
        importAllProductsFromSquare,
    }
}
