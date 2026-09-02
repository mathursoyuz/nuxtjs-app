import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    CheckSkuResponse,
    CreateProductDTO,
    Product,
    ToggleProductResponse,
    UpdateProductDTO,
} from '~/types/product.types'

/**
 * Product API wrapper service
 */
export class ProductApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllProducts(): Promise<ApiResponse<Product[]>> {
        return this.cachedApi.get<Product[]>('/products', undefined, 'products:all', 5 * 60 * 1000)
    }

    async getProductById(id: number): Promise<ApiResponse<Product>> {
        return this.cachedApi.get<Product>(
            `/products/${id}`,
            undefined,
            `products:${id}`,
            5 * 60 * 1000
        )
    }

    async checkSku(sku: string, variantId?: number): Promise<ApiResponse<CheckSkuResponse>> {
        return this.cachedApi.post<CheckSkuResponse>('/products/check-sku', {
            sku,
            ...(variantId ? { variantId } : {}),
        })
    }

    async checkSlug(slug: string, productId?: number): Promise<ApiResponse<CheckSkuResponse>> {
        return this.cachedApi.post<CheckSkuResponse>('/products/check-slug', {
            slug,
            ...(productId ? { productId } : {}),
        })
    }

    async createProduct(data: CreateProductDTO): Promise<ApiResponse<Product>> {
        // Don't send files here - images are uploaded separately
        const response = await this.cachedApi.post<Product>(
            '/products',
            data,
            undefined,
            'products:.*'
        )
        return response
    }

    async updateProduct(id: number, data: UpdateProductDTO): Promise<ApiResponse<Product>> {
        // Don't send files here - images are uploaded separately
        const response = await this.cachedApi.put<Product>(
            `/products/${id}`,
            data,
            undefined,
            'products:.*'
        )
        return response
    }

    async deleteProduct(id: number): Promise<ApiResponse<void>> {
        const response = await this.cachedApi.delete<void>(`/products/${id}`)
        this.cachedApi.invalidatePattern('products:.*')
        return response
    }

    async toggleActive(id: number, isActive: boolean): Promise<ApiResponse<ToggleProductResponse>> {
        const response = await this.cachedApi.patch<ToggleProductResponse>(
            `/products/${id}/toggle-active`,
            { isActive }
        )
        this.cachedApi.invalidate(`products:${id}`)
        this.cachedApi.invalidatePattern('products:.*')
        return response
    }

    async refreshProducts(): Promise<ApiResponse<Product[]>> {
        return this.cachedApi.get<Product[]>(
            '/products',
            undefined,
            'products:all',
            undefined,
            true
        )
    }

    async uploadProductImages(productId: number, formData: FormData): Promise<ApiResponse<void>> {
        return this.cachedApi.patch<void>(
            `/products/${productId}/uploadProductImages`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
            `products:${productId}`
        )
    }

    async uploadProductVariantImages(
        productId: number,
        variantId: number,
        formData: FormData
    ): Promise<ApiResponse<void>> {
        return this.cachedApi.patch<void>(
            `/products/${productId}/variants/${variantId}/uploadProductImages`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
            `products:${productId}`
        )
    }

    async removeVariantThumbnail(productId: number, variantId: number): Promise<ApiResponse<void>> {
        return this.cachedApi.patch<void>(
            `/products/${productId}/variants/${variantId}/remove-thumbnail`,
            {},
            undefined,
            `products:${productId}`
        )
    }

    async removeProductThumbnail(productId: number): Promise<ApiResponse<void>> {
        return this.cachedApi.patch<void>(
            `/products/${productId}/remove-thumbnail`,
            {},
            undefined,
            'products:.*'
        )
    }

    async deleteProductGalleryImage(
        productId: number,
        filename: string
    ): Promise<ApiResponse<void>> {
        return this.cachedApi.delete<void>(
            `/products/${productId}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            'products:.*'
        )
    }

    async deleteVariantGalleryImage(
        productId: number,
        variantId: number,
        filename: string
    ): Promise<ApiResponse<void>> {
        return this.cachedApi.delete<void>(
            `/products/${productId}/variants/${variantId}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            'products:.*'
        )
    }

    async syncProductToQB(
        productId: number
    ): Promise<ApiResponse<{ created: boolean; qbId: string }>> {
        const response = await this.cachedApi.post<{ created: boolean; qbId: string }>(
            `/quickbooks-sync/products/${productId}/sync-to-qb`,
            {},
            undefined,
            `products:.*`
        )
        this.cachedApi.invalidatePattern('products:.*')
        return response
    }

    async syncProductToSquare(productId: number): Promise<ApiResponse<void>> {
        // Note: Square product sync is done via category sync, not individual product sync
        // This method is a placeholder if individual sync is needed in the future
        throw new Error(
            'Individual Square product sync is not supported. Please sync via categories.'
        )
    }

    async importAllProductsFromSquare(): Promise<
        ApiResponse<{
            created: number
            updated: number
            skipped: number
            errors: Array<{ item: string; error: string }>
        }>
    > {
        const response = await this.cachedApi.post<{
            created: number
            updated: number
            skipped: number
            errors: Array<{ item: string; error: string }>
        }>('/square-sync/products', {}, undefined, 'products:.*')
        this.cachedApi.invalidatePattern('products:.*')
        return response
    }
}
