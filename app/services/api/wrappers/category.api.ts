import HttpFactory from '@/repository/factory'
import type { ApiResponse } from '~/types/api.types'

export interface Category {
    id: number
    parentId: number | null
    name: string
    slug: string
    description: string | null
    image: string | null
    squareCategoryId: string | null
    isSquareSynced: boolean
    isQbSynced: boolean
    qbSyncErrorReason: string | null
    qbCategoryId: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateCategoryDTO {
    parentId: number | null
    name: string
    slug: string
    description?: string | null
    image?: string | null
    isActive: boolean
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

/**
 * Category API wrapper service
 */
export class CategoryApiService extends HttpFactory {
    async getAllCategories(): Promise<ApiResponse<Category[]>> {
        return await this.call<Category[]>('GET', '/categories', undefined, {
            cacheKey: 'categories:all',
            ttl: 5 * 60 * 1000,
        })
    }

    async getCategoryById(id: number): Promise<ApiResponse<Category>> {
        return await this.call<Category>('GET', `/categories/${id}`, undefined, {
            cacheKey: `categories:${id}`,
            ttl: 5 * 60 * 1000,
        })
    }

    async createCategory(data: CreateCategoryDTO): Promise<ApiResponse<Category>> {
        return await this.call<Category, CreateCategoryDTO>('POST', '/categories', data, {
            invalidatePattern: 'categories:.*',
        })
    }

    async updateCategory(id: number, data: UpdateCategoryDTO): Promise<ApiResponse<Category>> {
        const response = await this.call<Category, UpdateCategoryDTO>(
            'PUT',
            `/categories/${id}`,
            data,
            { invalidatePattern: 'categories:.*' }
        )
        this.invalidateCacheKey(`categories:${id}`)
        return response
    }

    async updateCategoryStatus(id: number, isActive: boolean): Promise<ApiResponse<Category>> {
        return await this.call<Category, { isActive: boolean }>(
            'PATCH',
            `/categories/${id}/status`,
            { isActive },
            { invalidatePattern: 'categories:.*' }
        )
    }

    async uploadCategoryImage(id: number, file: File): Promise<ApiResponse<Category>> {
        const formData = new FormData()
        formData.append('uploadImage', file)

        const response = await this.call<Category, FormData>(
            'PATCH',
            `/categories/${id}/uploadImage`,
            formData,
            {
                config: {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                },
                invalidatePattern: 'categories:.*',
            }
        )

        this.invalidateCacheKey(`categories:${id}`)
        return response
    }

    async deleteCategory(id: number): Promise<ApiResponse<void>> {
        return await this.call<void>('DELETE', `/categories/${id}`, undefined, {
            invalidatePattern: 'categories:.*',
        })
    }

    async refreshCategories(): Promise<ApiResponse<Category[]>> {
        return await this.call<Category[]>('GET', '/categories', undefined, {
            cacheKey: 'categories:all',
            skipCache: true,
        })
    }

    invalidateCache(): void {
        this.invalidateCacheKey('categories:.*')
    }
}

export default CategoryApiService
