<template>
    <div v-if="errors && errors.length > 0" class="form-errors">
        <v-alert
            v-for="(error, index) in errors"
            :key="index"
            type="error"
            density="compact"
            variant="text"
            class="mb-1"
        >
            {{ error }}
        </v-alert>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    errors?: string | string[];
}

const props = defineProps<Props>();

const errors = computed(() => {
    if (!props.errors) return [];
    if (typeof props.errors === 'string') return [props.errors];
    return props.errors;
});
</script>

<style scoped>
.form-errors {
    margin-top: 4px;
}

.form-errors :deep(.v-alert) {
    padding: 4px 8px;
    font-size: 12px;
    min-height: auto;
}
</style>
