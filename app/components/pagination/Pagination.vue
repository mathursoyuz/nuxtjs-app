<template>
    <div class="d-flex align-center justify-space-between flex-wrap">
        <div class="text-caption text-grey">
            Showing {{ startIndex }} to {{ endIndex }} of {{ totalItems }} entries
        </div>
        <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="totalVisible"
            :disabled="disabled"
            @update:model-value="handlePageChange"
        />
        <div v-if="showItemsPerPage" class="d-flex align-center gap-2">
            <span class="text-caption">Items per page:</span>
            <v-select
                v-model="itemsPerPage"
                :items="itemsPerPageOptions"
                density="compact"
                variant="outlined"
                hide-details
                style="width: 80px"
                @update:model-value="handleItemsPerPageChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface Props {
    modelValue: number;
    totalItems: number;
    itemsPerPage?: number;
    itemsPerPageOptions?: number[];
    totalVisible?: number;
    disabled?: boolean;
    showItemsPerPage?: boolean;
}

interface Emits {
    (e: 'update:modelValue', page: number): void;
    (e: 'items-per-page-change', itemsPerPage: number): void;
}

const props = withDefaults(defineProps<Props>(), {
    itemsPerPage: 10,
    itemsPerPageOptions: () => [10, 25, 50, 100],
    totalVisible: 7,
    disabled: false,
    showItemsPerPage: true,
});

const emit = defineEmits<Emits>();

const currentPage = ref(props.modelValue);
const itemsPerPage = ref(props.itemsPerPage);

const totalPages = computed(() => Math.ceil(props.totalItems / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value + 1);
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage.value, props.totalItems));

const handlePageChange = (page: number) => {
    emit('update:modelValue', page);
};

const handleItemsPerPageChange = (value: number) => {
    itemsPerPage.value = value;
    currentPage.value = 1; // Reset to first page
    emit('update:modelValue', 1);
    emit('items-per-page-change', value);
};

watch(() => props.modelValue, (newValue) => {
    currentPage.value = newValue;
});

watch(() => props.itemsPerPage, (newValue) => {
    itemsPerPage.value = newValue;
});
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
