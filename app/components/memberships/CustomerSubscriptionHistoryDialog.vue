<template>
    <v-dialog
        :model-value="modelValue"
        max-width="900"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Subscription history"
                entity-label="Customer"
                :entity-name="customerName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-text>
                <v-data-table :headers="headers" :items="subscriptions" :loading="loading">
                    <template #item.joinedAt="{ item }">
                        {{ item.joinedAtDisplay || item.joinedAt }}
                    </template>
                    <template #item.actions="{ item }">
                        <v-btn
                            icon="mdi-history"
                            size="small"
                            variant="text"
                            title="View full history"
                            @click="view(item)"
                        />
                    </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <ViewMembershipSubscriptionDialog
        v-model="detailsOpen"
        :organisation-id="organisationId"
        :subscription-id="selectedId"
        :customer-name="customerName"
    />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
import ViewMembershipSubscriptionDialog from './ViewMembershipSubscriptionDialog.vue'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import type { MembershipSubscription } from '~/types/membership.types'
const props = defineProps<{
    modelValue: boolean
    organisationId: number
    customerId: number
    customerName: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const manager = useMemberships()
const { errorFromError } = useToast()
const subscriptions = ref<MembershipSubscription[]>([])
const loading = ref(false)
const selectedId = ref<number | null>(null)
const detailsOpen = ref(false)
const headers = [
    { title: 'Membership', key: 'membershipName' },
    { title: 'Membership group', key: 'membershipGroupName' },
    { title: 'Status', key: 'status' },
    { title: 'Joined', key: 'joinedAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]
const refresh = async (): Promise<void> => {
    loading.value = true
    try {
        subscriptions.value =
            (await manager.getCustomerSubscriptions(props.organisationId, props.customerId)).data ??
            []
    } catch (error) {
        errorFromError(error, 'Unable to load subscription history.')
    } finally {
        loading.value = false
    }
}
const view = (item: MembershipSubscription): void => {
    selectedId.value = item.id
    detailsOpen.value = true
}
watch(
    () => [props.modelValue, props.customerId] as const,
    ([open]) => {
        if (open) void refresh()
    },
    { immediate: true }
)
</script>
