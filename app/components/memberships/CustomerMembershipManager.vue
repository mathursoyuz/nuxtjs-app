<template>
    <div>
        <div class="d-flex justify-space-between align-center mb-4">
            <div>
                <h3 class="text-h6">Memberships</h3>
                <div class="text-body-2 text-medium-emphasis">
                    Subscribe, renew, upgrade, downgrade, or cancel customer memberships.
                </div>
            </div>
            <v-btn
                v-if="canWrite"
                color="primary"
                prepend-icon="mdi-account-cog"
                @click="openBatch"
            >
                Manage subscriptions
            </v-btn>
        </div>

        <v-progress-linear v-if="loading" indeterminate class="mb-4" />
        <v-alert v-if="!loading && !availableMemberships.length" type="info" variant="tonal">
            No memberships are currently available for this organisation.
        </v-alert>
        <div v-else>
            <section v-for="group in groupedAvailableMemberships" :key="group.id" class="mb-6">
                <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ group.name }}</h4>
                <v-row>
                    <v-col
                        v-for="membership in group.memberships"
                        :key="membership.id"
                        cols="12"
                        sm="6"
                        lg="4"
                    >
                        <v-tooltip
                            :text="membership.tooltip || membership.description || membership.name"
                            location="top"
                        >
                            <template #activator="{ props: tooltipProps }">
                                <v-card v-bind="tooltipProps" height="100%" variant="outlined">
                                    <v-img
                                        v-if="membership.thumbnailImage || membership.bannerImage"
                                        :src="
                                            membership.thumbnailImage ||
                                            membership.bannerImage ||
                                            undefined
                                        "
                                        height="150"
                                        cover
                                        :alt="membership.name"
                                    />
                                    <v-card-title>{{ membership.name }}</v-card-title>
                                    <v-card-subtitle>
                                        {{
                                            membership.isChargeable
                                                ? formatMembershipMoney(membership.priceAmount)
                                                : 'Free'
                                        }}
                                        · Tier {{ membership.tierRank }}
                                    </v-card-subtitle>
                                    <v-card-text>
                                        <v-chip
                                            v-if="currentSubscriptionFor(membership)"
                                            size="small"
                                            :color="
                                                subscriptionColor(
                                                    currentSubscriptionFor(membership)!.status
                                                )
                                            "
                                            variant="tonal"
                                        >
                                            {{ currentSubscriptionFor(membership)!.status }}
                                        </v-chip>
                                        <div
                                            v-else-if="groupSubscriptionFor(membership)"
                                            class="text-body-2 text-medium-emphasis"
                                        >
                                            Another tier in this group is subscribed
                                        </div>
                                        <div v-else class="text-body-2 text-medium-emphasis">
                                            Available to subscribe
                                        </div>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-btn
                                            size="small"
                                            variant="text"
                                            prepend-icon="mdi-information-outline"
                                            @click="showDetails(membership)"
                                        >
                                            Details
                                        </v-btn>
                                        <v-spacer />
                                        <v-btn
                                            v-if="canWrite && !groupSubscriptionFor(membership)"
                                            size="small"
                                            color="primary"
                                            @click="openBatch"
                                        >
                                            Subscribe
                                        </v-btn>
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-tooltip>
                    </v-col>
                </v-row>
            </section>
        </div>

        <v-divider class="my-6" />
        <h3 class="text-h6 mb-3">Subscriptions</h3>
        <v-data-table :headers="headers" :items="subscriptions" :loading="loading">
            <template #item.priceAmount="{ item }">
                {{ item.isChargeable ? formatMembershipMoney(item.priceAmount) : 'Free' }}
            </template>
            <template #item.currentPeriodEnd="{ item }">
                {{ formatDate(item.currentPeriodEnd) }}
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
                    <v-btn
                        v-if="canWrite && pendingAction(item)"
                        icon="mdi-link"
                        size="small"
                        variant="text"
                        title="Copy customer action link"
                        @click="copyActionLink(item)"
                    />
                </div>
            </template>
        </v-data-table>
    </div>

    <MembershipDetailsDialog
        v-model="detailsOpen"
        :organisation-id="organisationId"
        :membership="selectedMembership"
    />
    <ManageMembershipSubscriptionsDialog
        v-model="batchOpen"
        audience="CUSTOMER"
        :organisation-id="organisationId"
        :customer-id="customerId"
        :subject-name="customerName"
        :memberships="availableMemberships"
        :subscriptions="subscriptions"
        :cards="cards"
        @saved="refresh"
    />
    <ReviewMembershipPricingDialog
        v-model="reviewOpen"
        :organisation-id="organisationId"
        :subscription="selected"
        :action="selectedAction"
        @saved="refresh"
    />
    <ViewMembershipSubscriptionDialog
        v-model="viewOpen"
        :organisation-id="organisationId"
        :subscription-id="selected?.id ?? null"
        :customer-name="customerName"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MembershipDetailsDialog from './MembershipDetailsDialog.vue'
import ManageMembershipSubscriptionsDialog from './ManageMembershipSubscriptionsDialog.vue'
import ReviewMembershipPricingDialog from './ReviewMembershipPricingDialog.vue'
import ViewMembershipSubscriptionDialog from './ViewMembershipSubscriptionDialog.vue'
import { MEMBERSHIP_ACTION_STATUS, MEMBERSHIP_STATUS } from '~/constants/membership.constants'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipAction, MembershipSubscription } from '~/types/membership.types'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'

const props = withDefaults(
    defineProps<{
        organisationId: number
        customerId: number
        customerName?: string
        canWrite: boolean
        active?: boolean
    }>(),
    { active: true }
)
const emit = defineEmits<{ updated: [] }>()
const manager = useMemberships()
const { success, errorFromError } = useToast()
const loading = ref(false)
const subscriptions = ref<MembershipSubscription[]>([])
const availableMemberships = ref<Membership[]>([])
const cards = ref<CustomerCreditCard[]>([])
const selected = ref<MembershipSubscription | null>(null)
const selectedAction = ref<MembershipAction | null>(null)
const selectedMembership = ref<Membership | null>(null)
const batchOpen = ref(false)
const reviewOpen = ref(false)
const viewOpen = ref(false)
const detailsOpen = ref(false)
const headers = [
    { title: 'Membership', key: 'membershipName' },
    { title: 'Membership group', key: 'membershipGroupName' },
    { title: 'Status', key: 'status' },
    { title: 'Price', key: 'priceAmount' },
    { title: 'Period ends', key: 'currentPeriodEnd' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const groupedAvailableMemberships = computed(() => {
    const groups = new Map<number, { id: number; name: string; memberships: Membership[] }>()
    for (const membership of availableMemberships.value) {
        const group = groups.get(membership.membershipTypeId) ?? {
            id: membership.membershipTypeId,
            name: membership.membershipGroupName,
            memberships: [],
        }
        group.memberships.push(membership)
        groups.set(group.id, group)
    }
    return [...groups.values()]
})
const formatDate = (value: string | null): string =>
    value ? new Date(value).toLocaleDateString() : 'No expiry'
const pendingAction = (item: MembershipSubscription): MembershipAction | null =>
    item.pendingActions.find((action) => action.status === MEMBERSHIP_ACTION_STATUS.PENDING) ?? null
const groupSubscriptionFor = (membership: Membership): MembershipSubscription | undefined =>
    subscriptions.value.find(
        (subscription) => subscription.membershipTypeId === membership.membershipTypeId
    )
const currentSubscriptionFor = (membership: Membership): MembershipSubscription | undefined =>
    subscriptions.value.find((subscription) => subscription.membershipId === membership.id)
const subscriptionColor = (status: string): string =>
    status === MEMBERSHIP_STATUS.ACTIVE
        ? 'success'
        : status === MEMBERSHIP_STATUS.CANCELLED
          ? 'error'
          : 'warning'

const refresh = async (): Promise<void> => {
    if (!props.active) return
    loading.value = true
    try {
        const result = await manager.loadCustomerMembershipOptions(
            props.organisationId,
            props.customerId
        )
        subscriptions.value = result.subscriptions
        availableMemberships.value = result.memberships.filter((membership) => membership.isActive)
        cards.value = result.cards
        emit('updated')
    } catch (error) {
        errorFromError(error, 'Unable to load customer memberships.')
    } finally {
        loading.value = false
    }
}
const showDetails = (membership: Membership): void => {
    selectedMembership.value = membership
    detailsOpen.value = true
}
const openBatch = (): void => {
    batchOpen.value = true
}
const view = (item: MembershipSubscription): void => {
    selected.value = item
    viewOpen.value = true
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
const copyActionLink = async (item: MembershipSubscription): Promise<void> => {
    const action = pendingAction(item)
    if (!action) return
    try {
        const response = await manager.createCustomerActionLink(props.organisationId, action.id)
        if (!response.data) throw new Error('Action link was not created.')
        await navigator.clipboard.writeText(
            new URL(response.data.relativeUrl, window.location.origin).toString()
        )
        success('Membership action link copied.')
    } catch (error) {
        errorFromError(error, 'Unable to create membership action link.')
    }
}
watch(
    () => [props.active, props.customerId, props.organisationId] as const,
    ([active]) => {
        if (active) void refresh()
    },
    { immediate: true }
)
</script>
