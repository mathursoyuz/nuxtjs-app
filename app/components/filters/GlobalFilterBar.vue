<template>
    <div
        ref="bar"
        class="global-filter-bar"
        :class="{ 'has-organisation-filter': showOrganisationFilter }"
        role="region"
        aria-label="Page filters"
    >
        <div id="page-filter-controls" class="page-filter-target" />
        <GlobalOrganisationFilter
            v-if="organisationFilter"
            :permission="organisationFilter.permission"
            :all-organisations-label="organisationFilter.allOrganisationsLabel"
            :include-platform="organisationFilter.includePlatform"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import GlobalOrganisationFilter from '~/components/access/GlobalOrganisationFilter.vue'
import { useAccessStore } from '~/stores/access.store'
import type { OrganisationFilterOptions } from '~/types/page-filters.types'

const emit = defineEmits<{ resize: [height: number] }>()
const route = useRoute()
const access = useAccessStore()
const bar = ref<HTMLElement | null>(null)
let observer: ResizeObserver | undefined

const organisationFilter = computed<OrganisationFilterOptions | null>(() => {
    const options = route.meta.organisationFilter
    if (!options || !access.canFilterOrganisations || !access.isPlatformContext) return null
    return access.canAcrossOrganisations(options.permission) ||
        (options.includePlatform && access.can(options.permission))
        ? options
        : null
})

const showOrganisationFilter = computed(() => organisationFilter.value !== null)

onMounted(() => {
    if (!bar.value) return
    // Reserve the actual wrapped height in Vuetify's fixed app bar, including
    // page controls that are teleported here after their page mounts.
    observer = new ResizeObserver(() => {
        emit('resize', Math.ceil(bar.value?.getBoundingOrganisationRect().height ?? 0))
    })
    observer.observe(bar.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.global-filter-bar {
    display: flex;
    flex: none;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    width: 100%;
    padding: 8px 24px 12px;
}

.global-filter-bar:not(.has-organisation-filter):not(:has(.page-filters-controls)) {
    display: none;
}

.page-filter-target {
    display: contents;
}

.page-filter-target :deep(.page-filters-controls > *) {
    flex: 0 1 auto;
    min-width: 160px;
    max-width: 100%;
}

@media (max-width: 599px) {
    .global-filter-bar {
        padding-inline: 16px;
    }
}
</style>
