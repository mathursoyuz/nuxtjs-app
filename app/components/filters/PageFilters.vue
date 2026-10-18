<template>
    <Teleport v-if="mounted && isCurrentPage" to="#page-filter-controls">
        <div class="page-filters-controls">
            <slot />
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

// Nuxt's page route stays with its page during transitions. This prevents
// outgoing page filters appearing alongside the next page's controls.
const route = useRoute()
const router = useRouter()
const mounted = ref(false)
const isCurrentPage = computed(() => route.path === router.currentRoute.value.path)
onMounted(() => {
    mounted.value = true
})
</script>

<style scoped>
.page-filters-controls {
    display: contents;
}
</style>
