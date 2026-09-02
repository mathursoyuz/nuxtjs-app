import type { ProductApiService } from '../api/wrappers/product.api'
import type { CreateProductDTO, Product, ProductVariantInput } from '~/types/product.types'

export interface ImageFiles {
    entityId?: number
    thumbnail: File | null
    gallery: File[]
    removeExistingThumbnail: boolean
    removedExistingGallery: string[]
}

export class ProductFormService {
    constructor(private readonly productApi: ProductApiService) {}

    async validateSku(sku: string, variantId?: number): Promise<boolean> {
        if (!sku.trim()) return false
        const response = await this.productApi.checkSku(sku, variantId)
        return response.data?.available ?? false
    }

    async validateSlug(slug: string, productId?: number): Promise<boolean> {
        if (!slug.trim()) return false
        const response = await this.productApi.checkSlug(slug, productId)
        return response.data?.available ?? false
    }

    async createProduct(
        data: CreateProductDTO,
        productImages: ImageFiles,
        variantImages: ImageFiles[]
    ): Promise<Product> {
        const response = await this.productApi.createProduct(data)
        if (!response.data) throw new Error('Failed to create product')
        await this.uploadImages(response.data, productImages, variantImages)
        return this.getSavedProduct(response.data.id)
    }

    async updateProduct(
        productId: number,
        data: CreateProductDTO,
        productImages: ImageFiles,
        variantImages: ImageFiles[]
    ): Promise<Product> {
        const response = await this.productApi.updateProduct(productId, data)
        if (!response.data) throw new Error('Failed to update product')
        await this.uploadImages(response.data, productImages, variantImages)
        return this.getSavedProduct(response.data.id)
    }

    private async uploadImages(
        product: Product,
        productImages: ImageFiles,
        variantImages: ImageFiles[]
    ): Promise<void> {
        if (productImages.removeExistingThumbnail) {
            await this.productApi.removeProductThumbnail(product.id)
        }
        await Promise.all(
            productImages.removedExistingGallery.map((filename) =>
                this.productApi.deleteProductGalleryImage(product.id, filename)
            )
        )
        const productFormData = this.toFormData(productImages)
        if (productFormData) {
            await this.productApi.uploadProductImages(product.id, productFormData)
        }

        for (const [index, files] of variantImages.entries()) {
            const variant = files.entityId
                ? product.variants.find((candidate) => candidate.id === files.entityId)
                : product.variants[index]
            if (!variant) continue
            if (files.removeExistingThumbnail) {
                await this.productApi.removeVariantThumbnail(product.id, variant.id)
            }
            await Promise.all(
                files.removedExistingGallery.map((filename) =>
                    this.productApi.deleteVariantGalleryImage(product.id, variant.id, filename)
                )
            )
            const formData = this.toFormData(files)
            if (!formData) continue
            await this.productApi.uploadProductVariantImages(product.id, variant.id, formData)
        }
    }

    private async getSavedProduct(productId: number): Promise<Product> {
        const response = await this.productApi.getProductById(productId)
        if (!response.data) throw new Error('Failed to load saved product')
        return response.data
    }

    private toFormData(files: ImageFiles): FormData | null {
        if (!files.thumbnail && files.gallery.length === 0) return null
        const formData = new FormData()
        if (files.thumbnail) formData.append('uploadThumbnail', files.thumbnail)
        files.gallery.forEach((file) => formData.append('uploadGallery', file))
        return formData
    }
}

export type ProductFormData = CreateProductDTO
export type ProductVariantFormInput = ProductVariantInput
