<template>
    <div>
        <slot v-if="!hasError" />
        <v-alert v-else type="error" class="ma-4">
            <v-alert-title>Something went wrong</v-alert-title>
            <p>{{ errorMessage }}</p>
            <v-btn color="primary" @click="reset">Try Again</v-btn>
        </v-alert>
    </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((err) => {
    hasError.value = true;
    errorMessage.value = err instanceof Error ? err.message : 'An unexpected error occurred';
    return false; // Prevent error from propagating
});

const reset = () => {
    hasError.value = false;
    errorMessage.value = '';
};
</script>
