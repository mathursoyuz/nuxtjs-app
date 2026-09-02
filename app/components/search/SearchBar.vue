<template>
    <v-text-field
        :model-value="modelValue"
        :label="label"
        :placeholder="placeholder"
        :prepend-inner-icon="prependIcon"
        :append-inner-icon="appendIcon"
        :variant="variant"
        :density="density"
        :clearable="clearable"
        :disabled="disabled"
        :loading="loading"
        :debounce="debounce"
        hide-details
        @update:model-value="handleSearch"
        @keyup.enter="handleEnter"
    />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
    modelValue: string;
    label?: string;
    placeholder?: string;
    prependIcon?: string;
    appendIcon?: string;
    variant?: 'filled' | 'outlined' | 'plain' | 'underlined' | 'solo' | 'solo-inverted' | 'solo-filled';
    density?: 'default' | 'comfortable' | 'compact';
    clearable?: boolean;
    disabled?: boolean;
    loading?: boolean;
    debounce?: number;
}

interface Emits {
    (e: 'update:modelValue', value: string): void;
    (e: 'search', value: string): void;
    (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
    label: 'Search',
    placeholder: 'Type to search...',
    prependIcon: 'mdi-magnify',
    variant: 'outlined',
    density: 'default',
    clearable: true,
    disabled: false,
    loading: false,
    debounce: 300,
});

const emit = defineEmits<Emits>();

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const handleSearch = (value: string | null) => {
    const searchValue = value || '';
    emit('update:modelValue', searchValue);
    
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    
    debounceTimer = setTimeout(() => {
        emit('search', searchValue);
        if (searchValue === '') {
            emit('clear');
        }
    }, props.debounce);
};

const handleEnter = () => {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    emit('search', props.modelValue);
};
</script>
