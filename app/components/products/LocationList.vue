<template>
    <div>
        <v-text-field
            v-model="searchQuery"
            placeholder="Search locations..."
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="mb-3"
        />
        <v-list density="compact" class="location-list">
            <v-list-item
                v-for="location in filteredLocations"
                :key="location.value"
                :value="location.value"
                @click="toggleLocation(location.value)"
            >
                <template #prepend>
                    <v-checkbox
                        :model-value="isSelected(location.value)"
                        density="compact"
                        hide-details
                        @click.stop="toggleLocation(location.value)"
                    />
                </template>
                <v-list-item-title>{{ location.title }}</v-list-item-title>
            </v-list-item>
            <v-list-item v-if="filteredLocations.length === 0">
                <v-list-item-title class="text-medium-emphasis">No locations found</v-list-item-title>
            </v-list-item>
        </v-list>
        <div v-if="selected.length > 0" class="mt-3">
            <div class="text-caption text-medium-emphasis mb-2">Selected ({{ selected.length }})</div>
            <div class="d-flex flex-wrap gap-2">
                <v-chip
                    v-for="locId in selected"
                    :key="locId"
                    size="small"
                    closable
                    @click:close="removeLocation(locId)"
                >
                    {{ getLocationName(locId) }}
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

const filteredLocations = computed(() => {
    if (!searchQuery.value) {
        return props.available;
    }
    const query = searchQuery.value.toLowerCase();
    return props.available.filter((loc) => loc.title.toLowerCase().includes(query));
});

const isSelected = (locationId: number): boolean => {
    return props.selected.includes(locationId);
};

const toggleLocation = (locationId: number) => {
    const newSelected = [...props.selected];
    const index = newSelected.indexOf(locationId);
    
    if (index > -1) {
        newSelected.splice(index, 1);
    } else {
        newSelected.push(locationId);
    }
    
    emit('update:selected', newSelected);
};

const removeLocation = (locationId: number) => {
    const newSelected = props.selected.filter((id) => id !== locationId);
    emit('update:selected', newSelected);
};

const getLocationName = (locationId: number): string => {
    const location = props.available.find((loc) => loc.value === locationId);
    return location?.title || `Location ${locationId}`;
};
</script>

<style scoped>
.location-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
}

.gap-2 {
    gap: 8px;
}
</style>
