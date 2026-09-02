<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <div class="d-flex align-center justify-space-between mb-4">
                    <h1 class="text-h4">QuickBooks Categories</h1>
                    <v-btn
                        color="primary"
                        prepend-icon="mdi-refresh"
                        @click="refreshData"
                        :loading="loading"
                    >
                        Refresh
                    </v-btn>
                </div>

                <v-card>
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span>QuickBooks Categories</span>
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
                            />
                        </div>

                        <!-- Bulk Actions -->
                        <div v-if="selectedCategories.length > 0" class="mb-4">
                            <v-alert type="info" density="compact">
                                {{ selectedCategories.length }} item(s) selected
                                <template #append>
                                    <v-btn
                                        color="primary"
                                        size="small"
                                        prepend-icon="mdi-download"
                                        :loading="importing"
                                        :disabled="selectedCategories.length === 0"
                                        @click="importSelectedCategories"
                                    >
                                        Import Selected ({{ selectedCategories.length }})
                                    </v-btn>
                                </template>
                            </v-alert>
                        </div>

                        <!-- Data Table -->
                        <v-data-table
                            v-model="selectedItems"
                            :headers="headers"
                            :items="filteredCategories"
                            :loading="loading"
                            :selectable="true"
                            :show-select="true"
                            item-value="Id"
                            class="elevation-1"
                            @update:model-value="handleSelectionChange"
                        >
                    <template #item.Active="{ item }">
                        <v-chip :color="item.Active ? 'green' : 'red'" size="small">
                            {{ item.Active ? 'Active' : 'Inactive' }}
                        </v-chip>
                    </template>
                    <template #item.SubCategory="{ item }">
                        <v-chip :color="item.SubCategory ? 'blue' : 'grey'" size="small">
                            {{ item.SubCategory ? 'Sub Category' : 'Category' }}
                        </v-chip>
                    </template>
                    <template #item.syncStatus="{ item }">
                        <div class="d-flex align-center gap-2">
                            <v-chip
                                :color="isCategorySynced(item.Id) ? 'success' : 'warning'"
                                size="small"
                                variant="flat"
                            >
                                <v-icon start size="small">
                                    {{
                                        isCategorySynced(item.Id)
                                            ? 'mdi-check-circle'
                                            : 'mdi-alert-circle'
                                    }}
                                </v-icon>
                                {{ isCategorySynced(item.Id) ? 'Synced' : 'Not Synced' }}
                            </v-chip>
                    <v-tooltip
                        v-if="getCategorySyncError(item.Id)"
                        :text="getCategorySyncError(item.Id) || ''"
                        location="top"
                    >
                                <template #activator="{ props }">
                                    <v-chip
                                        v-bind="props"
                                        color="error"
                                        size="small"
                                        variant="flat"
                                    >
                                        <v-icon start size="small">mdi-alert-circle</v-icon>
                                        Error
                                    </v-chip>
                                </template>
                            </v-tooltip>
                        </div>
                    </template>
                    <template #item.importActions="{ item }">
                        <v-btn
                            color="primary"
                            size="small"
                            variant="text"
                            prepend-icon="mdi-download"
                            :loading="importing"
                            @click="importSingleCategory(item)"
                        >
                            {{ isCategorySynced(item.Id) ? 'Re-import' : 'Import' }}
                        </v-btn>
                    </template>
                        </v-data-table>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { useLoadingTask } from '~/composables/useLoadingTask'
import { useToast } from '~/composables/useToast'
import { INTEGRATION_MESSAGES } from '~/constants/messages.constants'
import type { QuickBooksCategory } from '~/services/api/wrappers/quickbooks.api'
import type { Category } from '~/services/api/wrappers/category.api'

definePageMeta({
    middleware: ['auth'],
})

const nuxtApp = useNuxtApp()
const { successFromResponse, errorFromError, error } = useToast()
const quickbooksApi =
    nuxtApp.$quickbooksApi as import('~/services/api/wrappers/quickbooks.api').QuickBooksApiService
const categoryApi =
    nuxtApp.$categoryApi as import('~/services/api/wrappers/category.api').CategoryApiService

const categories = ref<QuickBooksCategory[]>([])
const loading = ref(false)
const importing = ref(false)
const selectedCategories = ref<QuickBooksCategory[]>([])
const selectedItems = ref<QuickBooksCategory[]>([])
const localCategories = ref<Category[]>([])
const searchQuery = ref('')

const headers = [
    { title: 'ID', key: 'Id', sortable: true },
    { title: 'Name', key: 'Name', sortable: true },
    { title: 'Fully Qualified Name', key: 'FullyQualifiedName', sortable: true },
    { title: 'Active', key: 'Active', sortable: true },
    { title: 'Sub Category', key: 'SubCategory', sortable: true },
    { title: 'Sync Status', key: 'syncStatus', sortable: false },
    { title: 'Import', key: 'importActions', sortable: false },
]

const filteredCategories = computed(() => {
    if (!searchQuery.value || searchQuery.value.trim() === '') {
        return categories.value
    }

    const query = searchQuery.value.toLowerCase().trim()
    return categories.value.filter((category) => {
        const nameMatch = category.Name?.toLowerCase().includes(query)
        const fullyQualifiedMatch = category.FullyQualifiedName?.toLowerCase().includes(query)
        const idMatch = category.Id?.toLowerCase().includes(query)
        return nameMatch || fullyQualifiedMatch || idMatch
    })
})

const handleSelectionChange = (selected: unknown[]) => {
    selectedCategories.value = selected as QuickBooksCategory[]
}

const isCategorySynced = (qbCategoryId: string): boolean =>
    localCategories.value.some((cat) => cat.qbCategoryId === qbCategoryId)

const getCategorySyncError = (qbCategoryId: string): string | null => {
    const match = localCategories.value.find((cat) => cat.qbCategoryId === qbCategoryId)
    return match?.qbSyncErrorReason ?? null
}

const importSelectedCategories = async () => {
    if (selectedCategories.value.length === 0) {
        error('Please select at least one category to import')
        return
    }

    importing.value = true
    try {
        const task = useLoadingTask('import-qb-categories')
        await task.execute(async () => {
            const response = await quickbooksApi.importCategories()
            successFromResponse(response, 'Categories imported from QuickBooks')
        })
    } catch (err) {
        console.error('Error importing QuickBooks categories:', err)
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
    } finally {
        importing.value = false
    }
}

const importSingleCategory = async (category: QuickBooksCategory) => {
    importing.value = true
    try {
        const task = useLoadingTask('import-qb-category')
        await task.execute(async () => {
            const response = await quickbooksApi.importCategories()
            successFromResponse(
                response,
                `Category ${category.Name} imported from QuickBooks (full import executed)`
            )
        })
    } catch (err) {
        console.error('Error importing QuickBooks category:', err)
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
    } finally {
        importing.value = false
    }
}

const fetchCategories = async () => {
    loading.value = true
    try {
        const task = useLoadingTask('load-qb-categories')
        await task.execute(async () => {
            const response = await quickbooksApi.getCategories()
            if (response.success && response.data) {
                categories.value = response.data
            } else {
                errorFromError(response, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
            }
        })

        // Refresh local categories to update sync status mapping
        const localResponse = await categoryApi.refreshCategories()
        if (localResponse.success && localResponse.data) {
            localCategories.value = localResponse.data
        }
    } catch (err) {
        console.error('Error fetching QuickBooks categories:', err)
        errorFromError(err, INTEGRATION_MESSAGES.QB_FETCH_ERROR)
    } finally {
        loading.value = false
    }
}

const refreshData = async () => {
    await fetchCategories()
}

const { pending: productsPending } = await useLazyAsyncData('qb:categories:initial', async () => {
    await fetchCategories()
    return null
})
</script>
