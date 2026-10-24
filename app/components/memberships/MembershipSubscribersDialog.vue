<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1000"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                :title="audience === 'CUSTOMER' ? 'Membership members' : 'Subscribed organisations'"
                :scope="audience === 'ORGANISATION' ? 'Platform' : undefined"
                :entity-label="audience === 'CUSTOMER' ? 'Membership' : 'Platform Service'"
                :entity-name="membership?.name"
                @close="emit('update:modelValue', false)"
            />
            <v-card-text>
                <v-data-table :headers="headers" :items="subscribers" :loading="loading">
                    <template #item.joinedAt="{ item }">
                        {{ new Date(item.joinedAt).toLocaleDateString() }}
                    </template>
                    <template #item.changedFrom="{ item }">{{ item.changedFrom || '—' }}</template>
                    <template #item.changedTo="{ item }">{{ item.changedTo || '—' }}</template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { Membership, MembershipSubscriber } from '~/types/membership.types'

const props = defineProps<{
    modelValue: boolean
    audience: 'CUSTOMER' | 'ORGANISATION'
    organisationId?: number
    membership: Membership | null
    refreshKey?: number
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const manager = useMemberships()
const { errorFromError } = useToast()
const subscribers = ref<MembershipSubscriber[]>([])
const loading = ref(false)
const headers = [
    { title: props.audience === 'CUSTOMER' ? 'Customer' : 'Organisation', key: 'subscriberName' },
    { title: 'Email', key: 'subscriberEmail' },
    { title: 'Status', key: 'status' },
    { title: 'Join date', key: 'joinedAt' },
    { title: 'Changed from', key: 'changedFrom' },
    { title: 'Changed to', key: 'changedTo' },
]

const refresh = async (): Promise<void> => {
    if (!props.membership) return
    loading.value = true
    try {
        const response =
            props.audience === 'CUSTOMER'
                ? await manager.getMembershipMembers(props.organisationId!, props.membership.id)
                : await manager.getPlatformServiceSubscribers(props.membership.id)
        subscribers.value = response.data ?? []
    } catch (error) {
        errorFromError(error, 'Unable to load subscribers.')
    } finally {
        loading.value = false
    }
}

watch(
    () => [props.modelValue, props.membership?.id, props.refreshKey] as const,
    ([open]) => {
        if (open) void refresh()
    },
    { immediate: true }
)
</script>
