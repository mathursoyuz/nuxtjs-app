<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">Categories</h1>
                    <v-btn
                        v-if="access.can(CATEGORY_PERMISSIONS.CREATE)"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="openAddDialog"
                    >
                        Create Category
                    </v-btn>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>Categories</span>
                    </v-card-title>
                    <v-card-text>
                        <!-- Search -->
                        <div class="mb-4">
                            <v-text-field
                                v-model="searchQuery"
                                label="Search categories..."
                                prepend-inner-icon="mdi-magnify"
                                variant="outlined"
                                density="compact"
                                clearable
                                @update:model-value="handleSearch"
                            />
                        </div>

                        <!-- Data Table -->
                        <v-data-table
                            :headers="headers"
                            :items="filteredCategories"
                            :loading="loading"
                            :selectable="access.can(CATEGORY_PERMISSIONS.UPDATE)"
                            :show-select="access.can(CATEGORY_PERMISSIONS.UPDATE)"
                            item-value="id"
                            class="elevation-1"
                        >
                            <template #item.parentId="{ item }">
                                <span v-if="item.parentId === null">Root</span>
                                <span v-else>{{ getCategoryName(item.parentId) }}</span>
                            </template>

                            <template #item.image="{ item }">
                                <v-avatar size="40">
                                    <v-img
                                        :src="getFullImageUrl(item.image, 'categories')"
                                        :alt="item.name"
                                    />
                                </v-avatar>
                            </template>

                            <template #item.isActive="{ item }">
                                <v-switch
                                    :disabled="!access.can(CATEGORY_PERMISSIONS.UPDATE)"
                                    :model-value="item.isActive"
                                    density="compact"
                                    hide-details
                                    color="primary"
                                    @update:model-value="toggleActive(item.id, !!$event)"
                                />
                            </template>

                            <template #item.squareSynced="{ item }">
                                <v-chip
                                    size="small"
                                    :color="item.isSquareSynced ? 'success' : 'error'"
                                >
                                    {{ item.isSquareSynced ? 'Synced' : 'Not Synced' }}
                                </v-chip>
                            </template>

                            <template #item.qbSynced="{ item }">
                                <div>
                                    <v-chip
                                        size="small"
                                        :color="item.isQbSynced ? 'success' : 'error'"
                                        class="mb-1"
                                    >
                                        QB {{ item.isQbSynced ? 'Synced' : 'Not Synced' }}
                                    </v-chip>
                                    <div
                                        v-if="!item.isQbSynced && item.qbSyncErrorReason"
                                        class="text-caption text-error"
                                    >
                                        {{ item.qbSyncErrorReason }}
                                    </div>
                                </div>
                            </template>
                            <template #item.syncActions="{ item }">
                                <div class="d-flex gap-2 justify-space-between">
                                    <v-btn
                                        v-if="access.can(CATEGORY_PERMISSIONS.UPDATE)"
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-sync"
                                        :loading="syncingSquare[item.id] || false"
                                        @click="importFromSquare(item)"
                                    >
                                        {{
                                            item.isSquareSynced ? 'Re-Sync Square' : 'Import Square'
                                        }}
                                    </v-btn>
                                    <v-btn
                                        v-if="access.can(CATEGORY_PERMISSIONS.UPDATE)"
                                        size="small"
                                        color="primary"
                                        variant="tonal"
                                        prepend-icon="mdi-sync"
                                        :loading="syncingQb[item.id] || false"
                                        @click="importToQB(item)"
                                    >
                                        {{ item.isQbSynced ? 'Re-Sync QB' : 'Import QB' }}
                                    </v-btn>
                                </div>
                            </template>

                            <template #item.actions="{ item }">
                                <div class="d-flex gap-2 flex-wrap">
                                    <v-btn
                                        size="small"
                                        color="primary"
                                        variant="text"
                                        prepend-icon="mdi-pencil"
                                        @click="handleEdit(item)"
                                    >
                                        Edit
                                    </v-btn>
                                    <v-btn
                                        v-if="access.can(CATEGORY_PERMISSIONS.DELETE)"
                                        size="small"
                                        color="error"
                                        variant="text"
                                        prepend-icon="mdi-delete"
                                        @click="handleDelete(item)"
                                    >
                                        Delete
                                    </v-btn>
                                </div>
                            </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>

        <!-- Add Category Dialog -->
        <!-- Add Category Dialog - Lazy loaded -->
        <AddCategoryDialog
            v-if="showAddDialog"
            v-model="showAddDialog"
            @submit="handleCategoryCreated"
        />

        <!-- Edit Category Dialog - Lazy loaded -->
        <EditCategoryDialog
            v-if="showEditDialog"
            v-model="showEditDialog"
            :category="selectedCategory"
            @submit="handleCategoryUpdated"
        />

        <!-- Delete Category Dialog - Lazy loaded -->
        <DeleteCategoryDialog
            v-if="showDeleteDialog"
            v-model="showDeleteDialog"
            :category="selectedCategory"
            @submit="handleCategoryDeleted"
        />
    </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCategory } from '~/composables/useCategory'
import { useSquareImport } from '~/composables/useSquareImport'
import { useAccessStore } from '~/stores/access.store'
import { CATEGORY_PERMISSIONS } from '~/components/categories/category.permissions'
import { useQuickbooks } from '~/composables/useQuickbooks'
import { useToast } from '~/composables/useToast'
import { CATEGORY_MESSAGES, INTEGRATION_MESSAGES } from '~/constants/messages.constants'
import { defineAsyncComponent } from 'vue'

// Lazy load dialog components - only loaded when needed
const AddCategoryDialog = defineAsyncComponent(
    () => import('~/components/categories/AddCategoryDialog.vue')
)
const EditCategoryDialog = defineAsyncComponent(
    () => import('~/components/categories/EditCategoryDialog.vue')
)
const DeleteCategoryDialog = defineAsyncComponent(
    () => import('~/components/categories/DeleteCategoryDialog.vue')
)
import type { Category } from '~/types/category.types'
import type { SquareCategory } from '~/types/square-import.types'
import { getFullImageUrl } from '~/utils/image.util'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CATEGORY_PERMISSIONS.READ },
})

const { operations: squareImport } = useSquareImport<SquareCategory>()
const {
    categories,
    loading,
    fetchCategories,
    refreshCategories,
    deleteCategory,
    updateCategoryStatus,
} = useCategory()
const access = useAccessStore()
const { successFromResponse, errorFromError, success, error, warning, info } = useToast()
const { syncCategoryToQB } = useQuickbooks()

// Track sync state for each category
const syncingSquare = ref<Record<number, boolean>>({})
const syncingQb = ref<Record<number, boolean>>({})

// Dialog states
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedCategory = ref<Category | null>(null)

const headers = [
    { title: 'Name', key: 'name', sortable: true },
    { title: 'Slug', key: 'slug', sortable: true },
    { title: 'Parent', key: 'parentId', sortable: true },
    { title: 'Image', key: 'image', sortable: false },
    { title: 'Active', key: 'isActive', sortable: true },
    { title: 'Square Synced', key: 'squareSynced', sortable: true },
    { title: 'QB Synced', key: 'qbSynced', sortable: true },
    { title: 'SyncActions', key: 'syncActions', sortable: false },
    { title: 'Actions', key: 'actions', sortable: false },
]

const searchQuery = ref('')
const selectedItems = ref<Category[]>([])

const getCategoryName = (id: number): string => {
    const category = categories.value.find((c) => c.id === id)
    return category?.name || 'Unknown'
}

const filteredCategories = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return categories.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return categories.value.filter((category) => {
        const nameMatch = category.name?.toLowerCase().includes(query)
        const slugMatch = category.slug?.toLowerCase().includes(query)
        return nameMatch || slugMatch
    })
})

const handleSearch = (query: string | null): void => {
    searchQuery.value = query || ''
}

const openAddDialog = (): void => {
    showAddDialog.value = true
}

const handleEdit = (item: unknown): void => {
    const category = item as Category
    selectedCategory.value = category
    showEditDialog.value = true
}

const handleDelete = (item: unknown): void => {
    const category = item as Category
    selectedCategory.value = category
    showDeleteDialog.value = true
}

const handleCategoryCreated = async (): Promise<void> => {
    await fetchCategories()
    showAddDialog.value = false
}

const handleCategoryUpdated = async (): Promise<void> => {
    await fetchCategories()
    showEditDialog.value = false
    selectedCategory.value = null
}

const handleCategoryDeleted = async (): Promise<void> => {
    await fetchCategories()
    showDeleteDialog.value = false
    selectedCategory.value = null
}

const toggleActive = async (id: number, isActive: boolean): Promise<void> => {
    try {
        await updateCategoryStatus(id, isActive)
        success(`Category ${isActive ? 'activated' : 'deactivated'}.`)
        await fetchCategories()
    } catch (error) {
        errorFromError(error, 'Unable to update category status.')
        await fetchCategories()
    }
}

const importFromSquare = async (item: Category): Promise<void> => {
    syncingSquare.value[item.id] = true

    try {
        // Search all Square categories
        const searchResponse = await squareImport.searchCategories()
        if (!searchResponse.success || !searchResponse.data) {
            errorFromError(searchResponse, CATEGORY_MESSAGES.IMPORT_SQUARE_FETCH_ERROR)
            return
        }

        const squareCategories = Array.isArray(searchResponse.data) ? searchResponse.data : []

        // Try to find matching Square category by squareCategoryId first, then by name
        let matchingSquareCategory = item.squareCategoryId
            ? squareCategories.find((sc) => sc.id === item.squareCategoryId)
            : null

        // If not found by ID, try to find by name
        if (!matchingSquareCategory) {
            matchingSquareCategory = squareCategories.find(
                (sc) => sc.category_data?.name?.toLowerCase() === item.name.toLowerCase()
            )
        }

        if (!matchingSquareCategory) {
            const warningMessage = item.squareCategoryId
                ? 'Square category not found. It may have been deleted in Square.'
                : CATEGORY_MESSAGES.IMPORT_SQUARE_NO_CATEGORIES
            warning(warningMessage)
            return
        }

        // Import the matching Square category
        const importResponse = await squareImport.importCategories([matchingSquareCategory])
        if (importResponse.success && importResponse.data) {
            const result = importResponse.data.result
            const successCount = result.created + result.updated

            if (successCount > 0) {
                successFromResponse(importResponse, CATEGORY_MESSAGES.IMPORT_SQUARE_SUCCESS)
            } else {
                info(CATEGORY_MESSAGES.IMPORT_SQUARE_SKIPPED)
            }

            if (result.errors.length > 0) {
                const firstError = result.errors[0]
                if (firstError) {
                    warning(`Import warning: ${firstError.error}`)
                }
            }

            await refreshCategories()
        } else {
            errorFromError(importResponse, CATEGORY_MESSAGES.IMPORT_SQUARE_ERROR)
        }
    } catch (err) {
        console.error('Error importing category from Square:', err)
        errorFromError(err, CATEGORY_MESSAGES.IMPORT_SQUARE_ERROR)
    } finally {
        syncingSquare.value[item.id] = false
    }
}

const importToQB = async (item: Category): Promise<void> => {
    syncingQb.value[item.id] = true

    try {
        await syncCategoryToQB(item.id)
        success(CATEGORY_MESSAGES.SYNC_QB_SUCCESS)
        await refreshCategories()
    } catch (err) {
        errorFromError(err, CATEGORY_MESSAGES.SYNC_QB_ERROR)
        console.error('Error syncing category to QuickBooks:', err)
    } finally {
        syncingQb.value[item.id] = false
    }
}

// Use useLazyAsyncData for initial data fetching
const { pending: categoriesPending } = await useLazyAsyncData('categories-initial', async () => {
    await fetchCategories()
})
</script>
