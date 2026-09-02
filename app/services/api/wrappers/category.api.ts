import type { CachedApiClient } from '../CachedApiClient';
import type { ApiResponse } from '~/types/api.types';

export interface Category {
    id: number;
    parentId: number;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    squareCategoryId: string | null;
    isSquareSynced: boolean;
    isQbSynced: boolean;
    qbSyncErrorReason: string | null;
    qbCategoryId: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCategoryDTO {
    parentId: number;
    name: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    isActive: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

/**
 * Category API wrapper service
 */
export class CategoryApiService {
    constructor(private readonly cachedApi: CachedApiClient) {}

    async getAllCategories(): Promise<ApiResponse<Category[]>> {
        return this.cachedApi.get<Category[]>('/categories', undefined, 'categories:all', 5 * 60 * 1000);
    }

    async getCategoryById(id: number): Promise<ApiResponse<Category>> {
        return this.cachedApi.get<Category>(`/categories/${id}`, undefined, `categories:${id}`, 5 * 60 * 1000);
    }

    async createCategory(data: CreateCategoryDTO): Promise<ApiResponse<Category>> {
        const response = await this.cachedApi.post<Category>('/categories', data, undefined, 'categories:.*');
        return response;
    }

    async updateCategory(id: number, data: UpdateCategoryDTO): Promise<ApiResponse<Category>> {
        const response = await this.cachedApi.put<Category>(`/categories/${id}`, data, undefined, 'categories:.*');
        this.cachedApi.invalidate(`categories:${id}`);
        return response;
    }

    async uploadCategoryImage(id: number, file: File): Promise<ApiResponse<Category>> {
        const formData = new FormData();
        formData.append('uploadImage', file);

        const response = await this.cachedApi.patch<Category>(
            `/categories/${id}/uploadImage`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
            'categories:.*'
        );
        
        this.cachedApi.invalidate(`categories:${id}`);
        return response;
    }

    async deleteCategory(id: number): Promise<ApiResponse<void>> {
        const response = await this.cachedApi.delete<void>(`/categories/${id}`, undefined, 'categories:.*');
        return response;
    }

    async refreshCategories(): Promise<ApiResponse<Category[]>> {
        return this.cachedApi.get<Category[]>('/categories', undefined, 'categories:all', undefined, true);
    }
}
