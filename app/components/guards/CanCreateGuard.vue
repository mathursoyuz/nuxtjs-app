<template>
    <slot v-if="hasAccess" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRole } from '~/composables/useRole';

interface Props {
    resource: string;
}

const props = defineProps<Props>();

const { canCreate } = useRole();

const hasAccess = computed(() => {
    return canCreate(props.resource);
});
</script>
