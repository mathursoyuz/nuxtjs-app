<template>
    <div v-if="hasErrors" class="mb-4">
        <v-alert type="error" variant="tonal">
            <div class="text-h6 mb-2">Please fix the following errors:</div>
            <ul class="mb-0">
                <li v-for="(error, field) in errorList" :key="field">
                    <strong>{{ field }}:</strong> {{ error }}
                </li>
            </ul>
        </v-alert>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    errors: Record<string, string | string[] | undefined>;
}

const props = defineProps<Props>();

const errorList = computed(() => {
    const list: Record<string, string> = {};
    for (const [field, error] of Object.entries(props.errors)) {
        if (error) {
            list[field] = Array.isArray(error) ? error[0] : error;
        }
    }
    return list;
});

const hasErrors = computed(() => Object.keys(errorList.value).length > 0);
</script>
