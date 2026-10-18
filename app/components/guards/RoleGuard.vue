<template>
    <slot v-if="hasAccess" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRole } from '~/composables/useRole'

interface Props {
    roles?: string | string[]
    requireAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    roles: undefined,
    requireAll: false,
})

const { hasRole, hasAnyRole } = useRole()

const hasAccess = computed(() => {
    if (!props.roles) {
        return true
    }
    if (typeof props.roles === 'string') {
        return hasRole(props.roles)
    }
    if (props.roles.length === 0) {
        return true
    }
    return props.requireAll ? props.roles.every(hasRole) : hasAnyRole(props.roles)
})
</script>
