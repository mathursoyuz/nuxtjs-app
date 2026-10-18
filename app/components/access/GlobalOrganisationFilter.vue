<template>
    <v-autocomplete
        :model-value="modelValue"
        :items="items"
        item-title="title"
        item-value="value"
        label="Filter by organisation"
        aria-label="Filter page data by organisation or organisation"
        prepend-inner-icon="mdi-filter-outline"
        variant="outlined"
        density="compact"
        hide-details
        :disabled="access.refreshing"
        :menu-props="{ maxHeight: 360 }"
        no-data-text="No available organisations"
        class="global-organisation-filter"
        @update:model-value="setFilter"
    />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useAccessStore } from '~/stores/access.store'
import { useFilterStore } from '~/stores/filter.store'

const props = withDefaults(
    defineProps<{
        permission: string
        allOrganisationsLabel?: string
        includePlatform?: boolean
    }>(),
    { allOrganisationsLabel: 'All accessible organisations', includePlatform: false }
)

const ALL_ORGANISATIONS = '__all_organisations__'
const access = useAccessStore()
const filters = useFilterStore()
const canFilterAll = computed(() => access.canAcrossOrganisations(props.permission))
const canFilterPlatform = computed(
    () => props.includePlatform && access.can(props.permission) && access.platformOrganisationId !== null
)
const organisationItems = computed(() =>
    access
        .organisationsWithCrossOrganisationPermission(props.permission)
        .map((organisation) => ({ title: `${organisation.name} · #${organisation.id}`, value: organisation.id }))
)
const items = computed(() => [
    ...(canFilterAll.value
        ? [{ title: props.allOrganisationsLabel, value: ALL_ORGANISATIONS as string | number }]
        : []),
    ...(canFilterPlatform.value
        ? [{ title: 'Platform users', value: access.platformOrganisationId as number }]
        : []),
    ...organisationItems.value,
])
const modelValue = computed(() => filters.organisationId ?? ALL_ORGANISATIONS)

function setFilter(value: string | number | null) {
    if (value === null) return
    filters.setOrganisationId(value === ALL_ORGANISATIONS ? null : Number(value))
}

watch(
    [organisationItems, canFilterAll, canFilterPlatform],
    () => {
        const platformSelected =
            canFilterPlatform.value && filters.organisationId === access.platformOrganisationId
        if (
            filters.organisationId !== null &&
            !platformSelected &&
            !organisationItems.value.some((item) => item.value === filters.organisationId)
        ) {
            filters.setOrganisationId(
                canFilterAll.value
                    ? null
                    : canFilterPlatform.value
                      ? access.platformOrganisationId
                      : (organisationItems.value[0]?.value ?? null)
            )
        } else if (filters.organisationId === null && !canFilterAll.value) {
            filters.setOrganisationId(
                canFilterPlatform.value
                    ? access.platformOrganisationId
                    : (organisationItems.value[0]?.value ?? null)
            )
        }
    },
    { immediate: true }
)
</script>

<style scoped>
.global-organisation-filter {
    flex: 0 1 300px;
    min-width: 220px;
    max-width: 100%;
}

@media (max-width: 599px) {
    .global-organisation-filter {
        flex-basis: 100%;
    }
}
</style>
