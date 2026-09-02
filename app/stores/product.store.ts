import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Product } from '~/types/product.types'

export const useProductStore = defineStore('product', () => {
    const products = ref<Product[]>([])
    const currentProduct = ref<Product | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeProducts = computed(() =>
        products.value.filter((product) => product.isActive && !product.isDeleted)
    )
    const featuredProducts = computed(() =>
        products.value.filter(
            (product) => product.isFeatured && product.isActive && !product.isDeleted
        )
    )
    const productById = computed(
        () => (id: number) => products.value.find((product) => product.id === id)
    )

    function setProducts(value: Product[]): void {
        products.value = value
    }

    function setCurrentProduct(value: Product | null): void {
        currentProduct.value = value
    }

    function addProduct(product: Product): void {
        products.value.push(product)
    }

    function updateProduct(product: Product): void {
        const index = products.value.findIndex((item) => item.id === product.id)
        if (index >= 0) products.value[index] = product
        if (currentProduct.value?.id === product.id) currentProduct.value = product
    }

    function removeProduct(id: number): void {
        products.value = products.value.filter((product) => product.id !== id)
        if (currentProduct.value?.id === id) currentProduct.value = null
    }

    function setProductActive(id: number, isActive: boolean): void {
        const product = products.value.find((item) => item.id === id)
        if (product) product.isActive = isActive
        if (currentProduct.value?.id === id) currentProduct.value.isActive = isActive
    }

    function setLoading(value: boolean): void {
        loading.value = value
    }

    function setError(value: string | null): void {
        error.value = value
    }

    function clearError(): void {
        error.value = null
    }

    return {
        products,
        currentProduct,
        loading,
        error,
        activeProducts,
        featuredProducts,
        productById,
        setProducts,
        setCurrentProduct,
        addProduct,
        updateProduct,
        removeProduct,
        setProductActive,
        setLoading,
        setError,
        clearError,
    }
})
