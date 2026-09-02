<template>
    <v-expansion-panels v-model="panel" variant="accordion" class="mb-4">
        <v-expansion-panel>
            <v-expansion-panel-title>
                <v-icon class="mr-2">mdi-filter</v-icon>
                Filters
                <v-chip v-if="activeFilterCount > 0" size="small" color="primary" class="ml-2">
                    {{ activeFilterCount }}
                </v-chip>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
                <v-row>
                    <slot />
                </v-row>
                <v-row class="mt-2">
                    <v-col cols="12" class="d-flex justify-end gap-2">
                        <v-btn variant="outlined" @click="clearFilters">
                            Clear All
                        </v-btn>
                        <v-btn color="primary" @click="applyFilters">
                            Apply Filters
                        </v-btn>
                    </v-col>
                </v-row>
            </v-expansion-panel-text>
        </v-expansion-panel>
    </v-expansion-panels>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
    modelValue?: Record<string, unknown>;
    defaultExpanded?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: Record<string, unknown>): void;
    (e: 'apply', value: Record<string, unknown>): void;
    (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
    defaultExpanded: false,
});

const emit = defineEmits<Emits>();

const panel = ref(props.defaultExpanded ? [0] : []);
const filters = ref<Record<string, unknown>>(props.modelValue || {});

const activeFilterCount = computed(() => {
    return Object.values(filters.value).filter((v) => {
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'string') return v.trim().length > 0;
        return v !== null && v !== undefined;
    }).length;
});

const applyFilters = () => {
    emit('update:modelValue', { ...filters.value });
    emit('apply', { ...filters.value });
};

const clearFilters = () => {
    filters.value = {};
    emit('update:modelValue', {});
    emit('clear');
};

// Expose methods for parent components
defineExpose({
    filters,
    applyFilters,
    clearFilters,
});
</script>

<style scoped>
.gap-2 {
    gap: 8px;
}
</style>
