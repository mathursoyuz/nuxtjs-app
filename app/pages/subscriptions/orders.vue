<template>
    <v-container fluid>
        <div class="mb-4">
            <h1 class="text-h4">Subscription Orders</h1>
            <div class="text-body-2 text-medium-emphasis">
                Invoices, payment transactions, voids, and refunds for memberships and Platform
                Services.
            </div>
        </div>
        <v-card>
            <v-card-text>
                <div class="d-flex ga-4 flex-wrap align-center mb-4">
                    <v-select
                        v-model="organisationId"
                        :items="organisations"
                        item-title="name"
                        item-value="id"
                        label="Organisation"
                        style="max-width: 340px"
                        hide-details
                        @update:model-value="refresh"
                    />
                    <v-btn-toggle v-model="audience" mandatory color="primary">
                        <v-btn value="ALL">All</v-btn>
                        <v-btn value="CUSTOMER">Memberships</v-btn>
                        <v-btn value="ORGANISATION">Platform Services</v-btn>
                    </v-btn-toggle>
                </div>
                <v-data-table :headers="headers" :items="filteredOrders" :loading="loading">
                    <template #item.finalAmountCharged="{ item }">
                        {{ formatMembershipMoney(item.finalAmountCharged) }}
                    </template>
                    <template #item.refundedAmount="{ item }">
                        {{ formatMembershipMoney(item.refundedAmount) }}
                    </template>
                    <template #item.createdAt="{ item }">
                        {{ new Date(item.createdAt).toLocaleString() }}
                    </template>
                    <template #item.actions="{ item }">
                        <div class="d-flex ga-1">
                            <v-btn
                                v-if="item.membershipPriceAmount > 0"
                                icon="mdi-bank-transfer"
                                size="small"
                                variant="text"
                                title="View transactions"
                                @click="openTransactions(item)"
                            />
                            <v-btn
                                icon="mdi-receipt-text"
                                size="small"
                                variant="text"
                                title="View invoice"
                                @click="openInvoice(item)"
                            />
                            <v-btn
                                v-if="canRefund(item)"
                                icon="mdi-cash-refund"
                                size="small"
                                color="error"
                                variant="text"
                                title="Refund or void"
                                @click="openRefund(item)"
                            />
                        </div>
                    </template>
                </v-data-table>
            </v-card-text>
        </v-card>
        <SubscriptionOrderTransactionsDialog v-model="transactionsOpen" :order="selected" />
        <SubscriptionInvoiceDialog v-model="invoiceOpen" :order="selected" />
        <SubscriptionRefundDialog
            v-if="organisationId"
            v-model="refundOpen"
            :organisation-id="organisationId"
            :order="selected"
            @refunded="refresh"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SubscriptionOrderTransactionsDialog from '~/components/memberships/SubscriptionOrderTransactionsDialog.vue'
import SubscriptionInvoiceDialog from '~/components/memberships/SubscriptionInvoiceDialog.vue'
import SubscriptionRefundDialog from '~/components/memberships/SubscriptionRefundDialog.vue'
import {
    CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
    ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
} from '~/components/memberships/membership.permissions'
import { useAccessStore } from '~/stores/access.store'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { MembershipSubscriptionOrder } from '~/types/membership.types'

definePageMeta({ middleware: ['auth'] })
const access = useAccessStore()
const route = useRoute()
const manager = useMemberships()
const { errorFromError } = useToast()
const organisationId = ref<number | null>(null)
const requestedAudience =
    route.query.audience === 'CUSTOMER' || route.query.audience === 'ORGANISATION'
        ? route.query.audience
        : 'ALL'
const requestedCustomerId =
    typeof route.query.customerId === 'string' && /^\d+$/.test(route.query.customerId)
        ? Number(route.query.customerId)
        : undefined
const requestedOrganisationId =
    typeof route.query.organisationId === 'string' && /^\d+$/.test(route.query.organisationId)
        ? Number(route.query.organisationId)
        : undefined
const audience = ref<'ALL' | 'CUSTOMER' | 'ORGANISATION'>(requestedAudience)
const orders = ref<MembershipSubscriptionOrder[]>([])
const loading = ref(false)
const selected = ref<MembershipSubscriptionOrder | null>(null)
const transactionsOpen = ref(false)
const invoiceOpen = ref(false)
const refundOpen = ref(false)
const organisations = computed(() =>
    access.organisations.filter(
        (item) =>
            item.id !== access.platformOrganisationId &&
            (access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, item.id) ||
                access.can(ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, item.id))
    )
)
const filteredOrders = computed(() =>
    audience.value === 'ALL'
        ? orders.value
        : orders.value.filter((order) => order.audience === audience.value)
)
const headers = [
    { title: 'Order', key: 'orderId' },
    { title: 'Type', key: 'audience' },
    { title: 'Subscriber', key: 'subscriberName' },
    { title: 'Membership / Service', key: 'membershipName' },
    { title: 'Membership / Service group', key: 'membershipGroupName' },
    { title: 'Status', key: 'status' },
    { title: 'Charged', key: 'finalAmountCharged' },
    { title: 'Refunded', key: 'refundedAmount' },
    { title: 'Date', key: 'createdAt' },
    { title: 'Actions', key: 'actions', sortable: false },
]
const refresh = async (): Promise<void> => {
    if (!organisationId.value) return
    loading.value = true
    try {
        const results = await Promise.all([
            access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, organisationId.value)
                ? manager.getCustomerMembershipOrders(organisationId.value, requestedCustomerId)
                : Promise.resolve({ data: [] }),
            access.can(ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, organisationId.value)
                ? manager.getPlatformServiceOrders(organisationId.value)
                : Promise.resolve({ data: [] }),
        ])
        orders.value = [...(results[0].data ?? []), ...(results[1].data ?? [])].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    } catch (error) {
        errorFromError(error, 'Unable to load subscription orders.')
    } finally {
        loading.value = false
    }
}
const canRefund = (order: MembershipSubscriptionOrder): boolean =>
    ['PAID', 'PARTIALLY_REFUNDED'].includes(order.status) &&
    access.can(
        order.audience === 'CUSTOMER'
            ? CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.WRITE
            : ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.WRITE,
        order.organisationId
    )
const openTransactions = (order: MembershipSubscriptionOrder): void => {
    selected.value = order
    transactionsOpen.value = true
}
const openInvoice = (order: MembershipSubscriptionOrder): void => {
    selected.value = order
    invoiceOpen.value = true
}
const openRefund = (order: MembershipSubscriptionOrder): void => {
    selected.value = order
    refundOpen.value = true
}
onMounted(async () => {
    await access.ensureReady()
    organisationId.value =
        organisations.value.find((item) => item.id === requestedOrganisationId)?.id ??
        organisations.value.find((item) => item.id === access.actingOrganisationId)?.id ??
        organisations.value[0]?.id ??
        null
    await refresh()
})
</script>
