<template>
    <v-card-title class="dialog-header d-flex align-center justify-space-between ga-4 pa-4">
        <div class="min-width-0">
            <div class="text-h5 text-white text-wrap">{{ title }}</div>
            <div class="dialog-header__context text-caption text-wrap">
                <span v-if="resolvedScope">Scope: {{ resolvedScope }}</span>
                <span v-else>Organisation: {{ resolvedOrganisationName }}</span>
                <span v-if="entityLabel && entityName" class="ml-3">
                    {{ entityLabel }}: {{ entityName }}
                </span>
            </div>
        </div>
        <div class="d-flex align-center ga-2 flex-shrink-0">
            <slot name="actions" />
            <v-btn
                v-if="closeable"
                icon="mdi-close"
                variant="text"
                color="white"
                :disabled="closeDisabled"
                :aria-label="`Close ${title}`"
                @click="emit('close')"
            />
        </div>
    </v-card-title>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAccessStore } from '~/stores/access.store'

const props = withDefaults(
    defineProps<{
        title: string
        organisationName?: string | null
        entityLabel?: string
        entityName?: string | null
        scope?: string
        closeable?: boolean
        closeDisabled?: boolean
    }>(),
    {
        organisationName: undefined,
        entityLabel: undefined,
        entityName: undefined,
        scope: undefined,
        closeable: true,
        closeDisabled: false,
    }
)
const emit = defineEmits<{ close: [] }>()
const access = useAccessStore()

const resolvedScope = computed(() => props.scope?.trim() || '')
const resolvedOrganisationName = computed(
    () =>
        props.organisationName?.trim() ||
        access.actingContext?.organisationName?.trim() ||
        'No organisation selected'
)
</script>

<style scoped>
.dialog-header {
    background: linear-gradient(135deg, #7f1d2d 0%, #9b2335 55%, #be3455 100%);
}

.dialog-header__context {
    color: rgba(255, 255, 255, 0.86);
}

.min-width-0 {
    min-width: 0;
}
</style>
