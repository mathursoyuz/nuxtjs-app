import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useProductStore } from '~/stores/product.store'
import { ProductFormService, type ImageFiles } from '~/services/product/ProductFormService'
import { VALIDATION_MESSAGES } from '~/constants/product.constants'
import type { CreateProductDTO, Product } from '~/types/product.types'

export interface ProductAvailabilityErrors {
    slug?: string
    variants: Record<number, string>
}

export function useProductForm() {
    const nuxtApp = useNuxtApp()
    const productStore = useProductStore()
    const productApi =
        nuxtApp.$productApi as import('~/services/api/wrappers/product.api').ProductApiService
    const productFormService = new ProductFormService(productApi)
    const saving = ref(false)

    async function validateAvailability(
        data: CreateProductDTO,
        productId?: number
    ): Promise<ProductAvailabilityErrors> {
        const existingProduct = productId
            ? productStore.currentProduct?.id === productId
                ? productStore.currentProduct
                : productStore.products.find((product) => product.id === productId)
            : undefined
        const retainedVariantIds = new Set(
            data.variants
                .map((variant) => variant.id)
                .filter((id): id is number => id !== undefined)
        )
        const [slugAvailable, ...skuAvailability] = await Promise.all([
            productFormService.validateSlug(data.slug, productId),
            ...data.variants.map((variant) => {
                const existingSkuOwner = existingProduct?.variants.find(
                    (candidate) => candidate.sku.toLowerCase() === variant.sku.toLowerCase()
                )
                return existingSkuOwner && retainedVariantIds.has(existingSkuOwner.id)
                    ? Promise.resolve(true)
                    : productFormService.validateSku(variant.sku, variant.id)
            }),
        ])

        const errors: ProductAvailabilityErrors = { variants: {} }
        if (!slugAvailable) errors.slug = VALIDATION_MESSAGES.SLUG_ALREADY_EXISTS
        skuAvailability.forEach((available, index) => {
            if (!available) errors.variants[index] = VALIDATION_MESSAGES.SKU_ALREADY_EXISTS
        })
        return errors
    }

    async function saveProduct(
        data: CreateProductDTO,
        productImages: ImageFiles,
        variantImages: ImageFiles[],
        productId?: number
    ): Promise<Product> {
        saving.value = true
        try {
            const product = productId
                ? await productFormService.updateProduct(
                      productId,
                      data,
                      productImages,
                      variantImages
                  )
                : await productFormService.createProduct(data, productImages, variantImages)

            if (productId) productStore.updateProduct(product)
            else productStore.addProduct(product)
            productStore.setCurrentProduct(product)
            return product
        } finally {
            saving.value = false
        }
    }

    return {
        saving,
        saveProduct,
        validateAvailability,
    }
}
