<template>
    <v-card>
        <v-card-title v-if="title" class="d-flex align-center justify-space-between">
            <span>{{ title }}</span>
            <slot name="header-actions" />
        </v-card-title>

        <v-card-text>
            <!-- Search and Filters -->
            <div v-if="searchable || $slots.filters" class="mb-4">
                <v-row>
                    <v-col v-if="searchable" cols="12" md="6">
                        <v-text-field
                            v-model="searchQuery"
                            :label="searchLabel"
                            prepend-inner-icon="mdi-magnify"
                            variant="outlined"
                            density="compact"
                            clearable
                            @update:model-value="handleSearch"
                        />
                    </v-col>
                    <v-col v-if="$slots.filters" cols="12" :md="searchable ? 6 : 12">
                        <slot name="filters" />
                    </v-col>
                </v-row>
            </div>

            <!-- Bulk Actions -->
            <div v-if="selectable && selectedItems.length > 0" class="mb-4">
                <v-alert type="info" density="compact">
                    {{ selectedItems.length }} item(s) selected
                    <template #append>
                        <slot name="bulk-actions" :selected="selectedItems" />
                    </template>
                </v-alert>
            </div>

            <!-- Data Table -->
            <v-data-table
                v-model="selectedItems"
                :headers="headers"
                :items="items"
                :loading="loading"
                :items-per-page="itemsPerPage"
                :hide-default-footer="hideDefaultFooter"
                :items-per-page-options="itemsPerPageOptions"
                :sort-by="sortBy"
                :selectable="selectable"
                :show-select="selectable"
                :server-items-length="serverItemsLength"
                :page="currentPage"
                :item-value="itemValueKey"
                class="elevation-1"
                @update:options="handleOptionsUpdate"
                @update:page="handlePageUpdate"
            >
                <!-- Custom cell slots (only item.* slots) -->
                <template v-for="(_, slot) in $slots" :key="slot" #[slot]="scope">
                    <slot v-if="slot.startsWith('item.')" :name="slot" v-bind="scope || {}" />
                </template>

                <!-- Special slots that don't need scope -->
                <template v-if="$slots['no-data']" #no-data>
                    <slot name="no-data" />
                </template>
                <template v-else #no-data>
                    <div class="text-center py-8">
                        <v-icon size="64" color="grey-lighten-1">mdi-database-off</v-icon>
                        <p class="text-h6 mt-4 text-grey">No data available</p>
                    </div>
                </template>

                <template v-if="$slots.loading" #loading>
                    <slot name="loading" />
                </template>
                <template v-else #loading>
                    <v-skeleton-loader type="table-row@10" />
                </template>

                <!-- Default actions column (only if showActions is true and no custom item.actions slot is provided) -->
                <template v-if="showActions && !$slots['item.actions']" #item.actions="{ item }">
                    <div class="d-flex gap-2">
                        <slot name="item-actions" :item="item">
                            <v-btn
                                v-if="canEdit"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                @click="$emit('edit', item)"
                            />
                            <v-btn
                                v-if="canDelete"
                                icon="mdi-delete"
                                size="small"
                                variant="text"
                                color="error"
                                @click="$emit('delete', item)"
                            />
                        </slot>
                    </div>
                </template>
            </v-data-table>

            <!-- Pagination Info -->
            <div v-if="showPaginationInfo" class="mt-4 text-caption text-grey">
                Showing {{ startIndex }} to {{ endIndex }} of {{ totalItems }} entries
            </div>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface DataTableHeader {
    title: string
    key: string
    sortable?: boolean
    align?: 'start' | 'center' | 'end'
    width?: string
    filterable?: boolean
}

interface Props {
    headers: DataTableHeader[]
    items: any[]
    loading?: boolean
    title?: string
    searchable?: boolean
    searchLabel?: string
    selectable?: boolean
    showActions?: boolean
    itemsPerPage?: number
    hideDefaultFooter?: boolean
    itemsPerPageOptions?: number[]
    showPaginationInfo?: boolean
    initialSortBy?: { key: string; order: 'asc' | 'desc' }[]
    serverItemsLength?: number
    currentPage?: number
    itemValueKey?: string
    canEdit?: boolean
    canDelete?: boolean
}

interface Emits {
    (e: 'search', value: string): void
    (e: 'edit', item: any): void
    (e: 'delete', item: any): void
    (e: 'page-change', page: number): void
    (e: 'items-per-page-change', itemsPerPage: number): void
    (e: 'sort-change', sortBy: { key: string; order: 'asc' | 'desc' }[]): void
    (e: 'selection-change', selected: unknown[]): void
}

const props = withDefaults(defineProps<Props>(), {
    loading: false,
    searchable: true,
    searchLabel: 'Search',
    selectable: false,
    showActions: true,
    itemsPerPage: 10,
    hideDefaultFooter: false,
    itemsPerPageOptions: () => [10, 25, 50, 100],
    showPaginationInfo: true,
    initialSortBy: () => [],
    serverItemsLength: undefined,
    currentPage: 1,
    itemValueKey: 'id',
    canEdit: false,
    canDelete: false,
})

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const selectedItems = ref<unknown[]>([])
const sortBy = ref<{ key: string; order: 'asc' | 'desc' }[]>(props.initialSortBy)

const totalItems = computed(() => props.serverItemsLength ?? props.items.length)
const startIndex = computed(() => {
    if (props.serverItemsLength) {
        return ((props.currentPage ?? 1) - 1) * props.itemsPerPage + 1
    }
    return 1
})
const endIndex = computed(() => {
    if (props.serverItemsLength) {
        const end = (props.currentPage ?? 1) * props.itemsPerPage
        return Math.min(end, totalItems.value)
    }
    return totalItems.value
})

const handleSearch = (value: string | null) => {
    emit('search', value || '')
}

const handleOptionsUpdate = (options: {
    page?: number
    itemsPerPage?: number
    sortBy?: { key: string; order: 'asc' | 'desc' }[]
}) => {
    if (options.sortBy) {
        sortBy.value = options.sortBy
        emit('sort-change', options.sortBy)
    }
    if (options.itemsPerPage !== undefined) {
        emit('items-per-page-change', options.itemsPerPage)
    }
}

const handlePageUpdate = (page: number) => {
    emit('page-change', page)
}

watch(selectedItems, (newSelection) => {
    emit('selection-change', newSelection)
})
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
