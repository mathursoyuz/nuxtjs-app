<template>
    <v-text-field
        :model-value="modelValue"
        label="Slug"
        :loading="checking"
        :error-messages="combinedErrors"
        :hint="hint"
        persistent-hint
        @update:model-value="handleUserInput(String($event ?? ''))"
    />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { MembershipApiService } from '~/services/api/wrappers/membership.api'
import { createMembershipSlug, isMembershipSlugValid } from '~/utils/membership-slug.util'

const props = defineProps<{
    modelValue: string
    name: string
    active: boolean
    scope: 'PLATFORM' | 'ORGANISATION'
    entity: 'GROUP' | 'MEMBERSHIP'
    organisationId?: number
    excludeId?: number
    errorMessages?: string | string[]
}>()
const emit = defineEmits<{
    'update:modelValue': [value: string]
    'update:available': [value: boolean | null]
}>()
const api = useNuxtApp().$membershipApi as MembershipApiService
const checking = ref(false)
const available = ref<boolean | null>(null)
const checkFailed = ref(false)
const manuallyEdited = ref(false)
let timer: ReturnType<typeof setTimeout> | null = null
let revision = 0

const combinedErrors = computed(() => {
    const errors = Array.isArray(props.errorMessages)
        ? [...props.errorMessages]
        : props.errorMessages
          ? [props.errorMessages]
          : []
    if (available.value === false) errors.push('This slug is already in use')
    return errors
})
const hint = computed(() => {
    if (checking.value) return 'Checking slug availability…'
    if (available.value === true) return 'Slug is available'
    if (checkFailed.value) return 'Live check unavailable. The slug will be checked when you save.'
    return 'Generated from the name. You can change it.'
})

const setAvailability = (value: boolean | null): void => {
    available.value = value
    emit('update:available', value)
}

const checkAvailability = async (slug: string): Promise<void> => {
    const currentRevision = ++revision
    checking.value = true
    checkFailed.value = false
    try {
        const response =
            props.scope === 'PLATFORM'
                ? props.entity === 'GROUP'
                    ? await api.checkPlatformGroupSlug(slug, props.excludeId)
                    : await api.checkPlatformMembershipSlug(slug, props.excludeId)
                : props.entity === 'GROUP'
                  ? await api.checkOrganisationGroupSlug(
                        props.organisationId!,
                        slug,
                        props.excludeId
                    )
                  : await api.checkOrganisationMembershipSlug(
                        props.organisationId!,
                        slug,
                        props.excludeId
                    )
        if (currentRevision === revision) setAvailability(response.data?.available ?? false)
    } catch {
        if (currentRevision === revision) {
            checkFailed.value = true
            setAvailability(null)
        }
    } finally {
        if (currentRevision === revision) checking.value = false
    }
}

const scheduleCheck = (value: string): void => {
    if (timer) clearTimeout(timer)
    revision += 1
    checking.value = false
    checkFailed.value = false
    setAvailability(null)
    const slug = value.trim()
    if (!props.active || !isMembershipSlugValid(slug)) return
    timer = setTimeout(() => void checkAvailability(slug), 350)
}

const handleUserInput = (value: string): void => {
    manuallyEdited.value = true
    emit('update:modelValue', value)
}

watch(
    () => props.name,
    (name) => {
        if (!props.active || manuallyEdited.value) return
        const generated = createMembershipSlug(name)
        if (generated !== props.modelValue) emit('update:modelValue', generated)
    }
)
watch(
    () => props.modelValue,
    (value) => scheduleCheck(value),
    { immediate: true }
)
watch(
    () => [props.active, props.excludeId] as const,
    async ([active]) => {
        if (!active) return
        await nextTick()
        manuallyEdited.value =
            Boolean(props.modelValue) && props.modelValue !== createMembershipSlug(props.name)
        if (!props.modelValue && props.name)
            emit('update:modelValue', createMembershipSlug(props.name))
        else scheduleCheck(props.modelValue)
    },
    { immediate: true }
)

onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
    revision += 1
})
</script>
