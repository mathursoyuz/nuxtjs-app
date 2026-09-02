<template>
    <div>
        <v-text-field
            v-model="searchQuery"
            placeholder="Search categories..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="mb-3"
        />
        <v-list density="compact" class="category-list">
            <v-list-item
                v-for="category in filteredCategories"
                :key="category.value"
                :value="category.value"
                @click="toggleCategory(category.value)"
            >
                <template #prepend>
                    <v-checkbox
                        :model-value="isSelected(category.value)"
                        density="compact"
                        hide-details
                        @click.stop="toggleCategory(category.value)"
                    />
                </template>
                <v-list-item-title>{{ category.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="filteredCategories.length === 0">
                <v-list-item-title class="text-medium-emphasis">No categories found</v-list-item-title>
            </v-list-item>
        </v-list>
        <div v-if="selected.length > 0" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-2">Selected ({{ selected.length }})</div>
            <div class="d-flex flex-wrap gap-2">
                <v-chip
                    v-for="catId in selected"
                    :key="catId"
                    size="small"
                    closable
                    @click:close="removeCategory(catId)"
                >
                    {{ getCategoryName(catId) }}
                </v-chip>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
    selected: number[];
    available: Array<{ title: string; value: number }>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:selected': [value: number[]];
}>();

const searchQuery = ref('');

const filteredCategories = computed(() => {
    if (!searchQuery.value) {
        return props.available;
    }
    const query = searchQuery.value.toLowerCase();
    return props.available.filter((cat) => cat.title.toLowerCase().includes(query));
});

const isSelected = (categoryId: number): boolean => {
    return props.selected.includes(categoryId);
};

const toggleCategory = (categoryId: number) => {
    const newSelected = [...props.selected];
    const index = newSelected.indexOf(categoryId);
    
    if (index > -1) {
        newSelected.splice(index, 1);
    } else {
        newSelected.push(categoryId);
    }
    
    emit('update:selected', newSelected);
};

const removeCategory = (categoryId: number) => {
    const newSelected = props.selected.filter((id) => id !== categoryId);
    emit('update:selected', newSelected);
};

const getCategoryName = (categoryId: number): string => {
    const category = props.available.find((cat) => cat.value === categoryId);
    return category?.title || `Category ${categoryId}`;
};
</script>

<style scoped>
.category-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
}

.gap-2 {
    gap: 8px;
}
</style>
