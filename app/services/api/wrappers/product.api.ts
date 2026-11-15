import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'
import type {
    CheckSkuResponse,
    CreateProductDTO,
    Product,
    ToggleProductResponse,
    UpdateProductDTO,
} from '~/types/product.types'

export interface ProductImportResult {
    created: number
    updated: number
    skipped: number
    errors: Array<{ item: string; error: string }>
}

/**
 * Product API wrapper service
 */
export class ProductApiService extends HttpFactory {
    async getAllProducts(): Promise<ApiResponse<Product[]>> {
        return await this.call<Product[]>('GET', '/products', undefined, {
            cacheKey: 'products:all',
            ttl: 5 * 60 * 1000,
        })
    }

    async getProductById(id: number): Promise<ApiResponse<Product>> {
        return await this.call<Product>('GET', `/products/${id}`, undefined, {
            cacheKey: `products:${id}`,
            ttl: 5 * 60 * 1000,
        })
    }

    async checkSku(sku: string, variantId?: number): Promise<ApiResponse<CheckSkuResponse>> {
        const data = {
            sku,
            ...(variantId ? { variantId } : {}),
        }
        return await this.call<CheckSkuResponse, typeof data>('POST', '/products/check-sku', data)
    }

    async checkSlug(slug: string, productId?: number): Promise<ApiResponse<CheckSkuResponse>> {
        const data = {
            slug,
            ...(productId ? { productId } : {}),
        }
        return await this.call<CheckSkuResponse, typeof data>('POST', '/products/check-slug', data)
    }

    async createProduct(data: CreateProductDTO): Promise<ApiResponse<Product>> {
        // Don't send files here - images are uploaded separately
        return await this.call<Product, CreateProductDTO>('POST', '/products', data, {
            invalidatePattern: 'products:.*',
        })
    }

    async updateProduct(id: number, data: UpdateProductDTO): Promise<ApiResponse<Product>> {
        // Don't send files here - images are uploaded separately
        return await this.call<Product, UpdateProductDTO>(
            'PUT',
            `/products/${id}`,
            data,
            { invalidatePattern: 'products:.*' }
        )
    }

    async deleteProduct(id: number): Promise<ApiResponse<void>> {
        const response = await this.call<void>('DELETE', `/products/${id}`)
        this.invalidateCachePattern('products:.*')
        return response
    }

    async toggleActive(id: number, isActive: boolean): Promise<ApiResponse<ToggleProductResponse>> {
        const response = await this.call<ToggleProductResponse, { isActive: boolean }>(
            'PATCH',
            `/products/${id}/toggle-active`,
            { isActive }
        )
        this.invalidateCacheKey(`products:${id}`)
        this.invalidateCachePattern('products:.*')
        return response
    }

    async refreshProducts(): Promise<ApiResponse<Product[]>> {
        return await this.call<Product[]>('GET', '/products', undefined, {
            cacheKey: 'products:all',
            skipCache: true,
        })
    }

    async uploadProductImages(productId: number, formData: FormData): Promise<ApiResponse<void>> {
        return await this.call<void, FormData>(
            'PATCH',
            `/products/${productId}/uploadProductImages`,
            formData,
            {
                config: {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
                invalidatePattern: `products:${productId}`,
            }
        )
    }

    async uploadProductVariantImages(
        productId: number,
        variantId: number,
        formData: FormData
    ): Promise<ApiResponse<void>> {
        return await this.call<void, FormData>(
            'PATCH',
            `/products/${productId}/variants/${variantId}/uploadProductImages`,
            formData,
            {
                config: {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
                invalidatePattern: `products:${productId}`,
            }
        )
    }

    async removeVariantThumbnail(productId: number, variantId: number): Promise<ApiResponse<void>> {
        return await this.call<void, Record<string, never>>(
            'PATCH',
            `/products/${productId}/variants/${variantId}/remove-thumbnail`,
            {},
            { invalidatePattern: `products:${productId}` }
        )
    }

    async removeProductThumbnail(productId: number): Promise<ApiResponse<void>> {
        return await this.call<void, Record<string, never>>(
            'PATCH',
            `/products/${productId}/remove-thumbnail`,
            {},
            { invalidatePattern: 'products:.*' }
        )
    }

    async deleteProductGalleryImage(
        productId: number,
        filename: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void>(
            'DELETE',
            `/products/${productId}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            { invalidatePattern: 'products:.*' }
        )
    }

    async deleteVariantGalleryImage(
        productId: number,
        variantId: number,
        filename: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void>(
            'DELETE',
            `/products/${productId}/variants/${variantId}/gallery/${encodeURIComponent(filename)}`,
            undefined,
            { invalidatePattern: 'products:.*' }
        )
    }

    async syncProductToQB(
        productId: number
    ): Promise<ApiResponse<{ created: boolean; qbId: string }>> {
        const response = await this.call<
            { created: boolean; qbId: string },
            Record<string, never>
        >(
            'POST',
            `/quickbooks-sync/products/${productId}/sync-to-qb`,
            {},
            { invalidatePattern: 'products:.*' }
        )
        this.invalidateCachePattern('products:.*')
        return response
    }

    async syncProductToSquare(productId: number): Promise<ApiResponse<void>> {
        // Note: Square product sync is done via category sync, not individual product sync
        // This method is a placeholder if individual sync is needed in the future
        throw new Error(
            'Individual Square product sync is not supported. Please sync via categories.'
        )
    }

    async importAllProductsFromSquare(): Promise<ApiResponse<ProductImportResult>> {
        const response = await this.call<ProductImportResult, Record<string, never>>(
            'POST',
            '/square-sync/products',
            {},
            { invalidatePattern: 'products:.*' }
        )
        this.invalidateCachePattern('products:.*')
        return response
    }
}

export default ProductApiService
