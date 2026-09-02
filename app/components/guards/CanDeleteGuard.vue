<template>
    <slot v-if="hasAccess" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRole } from '~/composables/useRole';

interface Props {
    resource: string;
    ownerId?: number;
}

const props = defineProps<Props>();

const { canDelete } = useRole();

const hasAccess = computed(() => {
    return canDelete(props.resource, props.ownerId);
});
</script>
