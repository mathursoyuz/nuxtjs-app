<template>
    <v-snackbar
        v-model="show"
        :color="type"
        :timeout="timeout"
        location="top right"
    >
        {{ message }}
        <template #actions>
            <v-btn variant="text" @click="show = false">Close</v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
    modelValue: boolean;
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    timeout?: number;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
    type: 'info',
    timeout: 5000,
});

const emit = defineEmits<Emits>();

const show = ref(props.modelValue);

watch(() => props.modelValue, (newValue) => {
    show.value = newValue;
});

watch(show, (newValue) => {
    emit('update:modelValue', newValue);
});
</script>
