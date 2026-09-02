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
