<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1200"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Platform Services"
                :organisation-name="organisationName"
                entity-label="Organisation"
                :entity-name="organisationName"
                @close="emit('update:modelValue', false)"
            />
            <v-card-text>
                <div class="d-flex justify-space-between align-center mb-4">
                    <div class="text-body-2 text-medium-emphasis">
                        Services offered by the platform to this organisation.
                    </div>
                    <v-btn
                        v-if="canWrite"
                        color="primary"
                        prepend-icon="mdi-account-cog"
                        @click="openBatch"
                    >
                        Manage services
                    </v-btn>
                </div>
                <v-progress-linear v-if="loading" indeterminate class="mb-4" />
                <section v-for="group in groupedServices" :key="group.id" class="mb-6">
                    <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ group.name }}</h4>
                    <v-row>
                        <v-col
                            v-for="service in group.services"
                            :key="service.id"
                            cols="12"
                            sm="6"
                            lg="4"
                        >
                            <v-tooltip
                                :text="service.tooltip || service.description || service.name"
                                location="top"
                            >
                                <template #activator="{ props: tooltipProps }">
                                    <v-card v-bind="tooltipProps" height="100%" variant="outlined">
                                        <v-img
                                            v-if="service.thumbnailImage || service.bannerImage"
                                            :src="
                                                service.thumbnailImage ||
                                                service.bannerImage ||
                                                undefined
                                            "
                                            height="140"
                                            cover
                                        />
                                        <v-card-title>{{ service.name }}</v-card-title>
                                        <v-card-subtitle>
                                            {{
                                                service.isChargeable
                                                    ? formatMembershipMoney(service.priceAmount)
                                                    : 'Free'
                                            }}
                                        </v-card-subtitle>
                                        <v-card-text>
                                            <div>{{ service.description }}</div>
                                            <v-chip
                                                v-if="subscriptionFor(service)"
                                                size="small"
                                                color="success"
                                                variant="tonal"
                                                class="mt-2"
                                            >
                                                {{
                                                    subscriptionFor(service)!.membershipId ===
                                                    service.id
                                                        ? `Subscribed · ${subscriptionFor(service)!.status}`
                                                        : 'Another tier subscribed'
                                                }}
                                            </v-chip>
                                            <div
                                                v-else
                                                class="text-caption text-medium-emphasis mt-2"
                                            >
                                                Available to subscribe
                                            </div>
                                        </v-card-text>
                                    </v-card>
                                </template>
                            </v-tooltip>
                        </v-col>
                    </v-row>
                </section>

                <v-divider class="my-6" />
                <h3 class="text-h6 mb-3">Service subscriptions</h3>
                <v-data-table :headers="headers" :items="subscriptions" :loading="loading">
                    <template #item.priceAmount="{ item }">
                        {{ item.isChargeable ? formatMembershipMoney(item.priceAmount) : 'Free' }}
                    </template>
                    <template #item.actions="{ item }">
                        <div class="d-flex ga-1 flex-wrap">
                            <v-btn
                                icon="mdi-eye"
                                size="small"
                                variant="text"
                                title="View history"
                                @click="view(item)"
                            />
                            <v-btn
                                v-if="canWrite && item.status === MEMBERSHIP_STATUS.ACTIVE"
                                icon="mdi-arrow-up-bold"
                                size="small"
                                variant="text"
                                title="Upgrade"
                                @click="upgrade(item)"
                            />
                            <v-btn
                                v-if="canWrite && item.status === MEMBERSHIP_STATUS.ACTIVE"
                                icon="mdi-arrow-down-bold"
                                size="small"
                                variant="text"
                                title="Downgrade"
                                @click="downgrade(item)"
                            />
                            <v-btn
                                v-if="
                                    canWrite &&
                                    item.status === MEMBERSHIP_STATUS.ACTIVE &&
                                    !item.cancelAtPeriodEnd
                                "
                                icon="mdi-cancel"
                                color="error"
                                size="small"
                                variant="text"
                                title="Cancel"
                                @click="cancel(item)"
                            />
                            <v-btn
                                v-if="canWrite && item.status === MEMBERSHIP_STATUS.CANCELLED"
                                icon="mdi-refresh"
                                size="small"
                                variant="text"
                                title="Renew or rejoin"
                                @click="rejoin(item)"
                            />
                            <v-btn
                                v-if="canWrite && pendingAction(item)"
                                icon="mdi-file-sign"
                                color="warning"
                                size="small"
                                variant="text"
                                title="Review changed pricing"
                                @click="review(item)"
                            />
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="emit('update:modelValue', false)">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <ManageMembershipSubscriptionsDialog
        v-model="batchOpen"
        audience="ORGANISATION"
        :organisation-id="organisationId"
        :subject-name="organisationName"
        :memberships="services"
        :subscriptions="subscriptions"
        :cards="cards"
        @saved="refresh"
    />
    <ReviewOrganisationMembershipPricingDialog
        v-model="reviewOpen"
        :organisation-id="organisationId"
        :subscription="selected"
        :action="selectedAction"
        @saved="refresh"
    />
    <ViewOrganisationMembershipSubscriptionDialog
        v-model="historyOpen"
        :organisation-id="organisationId"
        :subscription-id="selected?.id ?? null"
        :organisation-name="organisationName"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ManageMembershipSubscriptionsDialog from './ManageMembershipSubscriptionsDialog.vue'
import ReviewOrganisationMembershipPricingDialog from './ReviewOrganisationMembershipPricingDialog.vue'
import ViewOrganisationMembershipSubscriptionDialog from './ViewOrganisationMembershipSubscriptionDialog.vue'
import { MEMBERSHIP_ACTION_STATUS, MEMBERSHIP_STATUS } from '~/constants/membership.constants'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipAction, MembershipSubscription } from '~/types/membership.types'
import type { OrganisationCreditCard } from '~/types/organisation-credit-card.types'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    organisationName: string
    canWrite: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const manager = useMemberships()
const { errorFromError } = useToast()
const loading = ref(false)
const services = ref<Membership[]>([])
const subscriptions = ref<MembershipSubscription[]>([])
const cards = ref<OrganisationCreditCard[]>([])
const selected = ref<MembershipSubscription | null>(null)
const selectedAction = ref<MembershipAction | null>(null)
const batchOpen = ref(false)
const reviewOpen = ref(false)
const historyOpen = ref(false)
const headers = [
    { title: 'Platform service', key: 'membershipName' },
    { title: 'Service group', key: 'membershipGroupName' },
    { title: 'Status', key: 'status' },
    { title: 'Price', key: 'priceAmount' },
    { title: 'Next charge', key: 'nextChargeAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]
const groupedServices = computed(() => {
    const groups = new Map<number, { id: number; name: string; services: Membership[] }>()
    for (const service of services.value) {
        const group = groups.get(service.membershipTypeId) ?? {
            id: service.membershipTypeId,
            name: service.membershipGroupName,
            services: [],
        }
        group.services.push(service)
        groups.set(group.id, group)
    }
    return [...groups.values()]
})
const subscriptionFor = (service: Membership): MembershipSubscription | undefined =>
    subscriptions.value.find(
        (subscription) => subscription.membershipTypeId === service.membershipTypeId
    )
const pendingAction = (item: MembershipSubscription): MembershipAction | null =>
    item.pendingActions.find((action) => action.status === MEMBERSHIP_ACTION_STATUS.PENDING) ?? null
const refresh = async (): Promise<void> => {
    loading.value = true
    try {
        const result = await manager.loadOrganisationSubscriptionOptions(props.organisationId)
        services.value = result.memberships.filter((service) => service.isActive)
        subscriptions.value = result.subscriptions
        cards.value = result.cards
    } catch (error) {
        errorFromError(error, 'Unable to load Platform Services.')
    } finally {
        loading.value = false
    }
}
const openBatch = (): void => {
    batchOpen.value = true
}
const view = (item: MembershipSubscription): void => {
    selected.value = item
    historyOpen.value = true
}
const upgrade = (item: MembershipSubscription): void => {
    void item
    openBatch()
}
const downgrade = (item: MembershipSubscription): void => {
    void item
    openBatch()
}
const cancel = (item: MembershipSubscription): void => {
    void item
    openBatch()
}
const rejoin = (item: MembershipSubscription): void => {
    void item
    openBatch()
}
const review = (item: MembershipSubscription): void => {
    selected.value = item
    selectedAction.value = pendingAction(item)
    reviewOpen.value = true
}
watch(
    () => [props.modelValue, props.organisationId] as const,
    ([open]) => {
        if (open) void refresh()
    },
    { immediate: true }
)
</script>
