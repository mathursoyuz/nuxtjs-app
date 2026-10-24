<template>
    <v-container fluid>
        <div class="mb-4">
            <h1 class="text-h4">Customer Subscriptions</h1>
            <div class="text-body-2 text-medium-emphasis">
                All customers and their current membership subscriptions.
            </div>
        </div>
        <v-card>
            <v-card-text>
                <div class="d-flex ga-4 mb-4 flex-wrap">
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
                    <v-text-field
                        v-model="search"
                        label="Search customers"
                        prepend-inner-icon="mdi-magnify"
                        clearable
                        style="max-width: 360px"
                        hide-details
                        @keyup.enter="refresh"
                    />
                    <v-btn prepend-icon="mdi-magnify" @click="refresh">Search</v-btn>
                </div>
                <v-data-table-server
                    :headers="headers"
                    :items="rows"
                    :items-length="total"
                    :loading="loading"
                    :page="page"
                    :items-per-page="limit"
                    @update:page="changePage"
                    @update:items-per-page="changeLimit"
                >
                    <template #item.customer="{ item }">
                        <div class="font-weight-medium">
                            {{ item.firstName }} {{ item.lastName }}
                        </div>
                        <div class="text-caption">{{ item.email }}</div>
                    </template>
                    <template #item.subscriptions="{ item }">
                        <div class="d-flex ga-1 flex-wrap">
                            <v-chip
                                v-for="subscription in subscriptionsFor(item.id)"
                                :key="subscription.id"
                                size="small"
                                :color="subscription.status === 'ACTIVE' ? 'success' : 'warning'"
                                variant="tonal"
                            >
                                {{ subscription.membershipName }} ·
                                {{ subscription.membershipGroupName || 'Ungrouped' }} ·
                                {{ subscription.status }}
                            </v-chip>
                            <span
                                v-if="!subscriptionsFor(item.id).length"
                                class="text-medium-emphasis"
                            >
                                None
                            </span>
                        </div>
                    </template>
                    <template #item.actions="{ item }">
                        <div class="d-flex ga-1 flex-wrap" style="min-width: 270px">
                            <v-btn
                                icon="mdi-card-account-details-star"
                                size="small"
                                variant="text"
                                title="Manage subscriptions"
                                @click="manage(item)"
                            />
                            <v-btn
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                title="Edit customer"
                                @click="edit(item)"
                            />
                            <v-btn
                                icon="mdi-credit-card"
                                size="small"
                                variant="text"
                                title="Manage credit cards"
                                @click="creditCards(item)"
                            />
                            <v-btn
                                icon="mdi-truck-delivery"
                                size="small"
                                variant="text"
                                title="Manage shipping"
                                @click="shipping(item)"
                            />
                            <v-btn
                                icon="mdi-receipt-text-clock"
                                size="small"
                                variant="text"
                                title="Subscription orders and transactions"
                                @click="ordersFor(item)"
                            />
                            <v-btn
                                icon="mdi-history"
                                size="small"
                                variant="text"
                                title="Subscription history"
                                @click="history(item)"
                            />
                        </div>
                    </template>
                </v-data-table-server>
            </v-card-text>
        </v-card>
        <CustomerMembershipsDialog
            v-if="selected"
            v-model="manageOpen"
            :organisation-id="selected.organisationId"
            :customer-id="selected.id"
            :customer-name="customerName(selected)"
            :can-write="canWrite"
            @update:model-value="dialogClosed"
        />
        <EditCustomerDialog
            v-if="selected"
            v-model="editOpen"
            :customer="selected"
            :organisations="organisations"
            :organisation-id="selected.organisationId"
            @submit="refresh"
        />
        <AddCreditCardDialog
            v-if="selected"
            v-model="cardsOpen"
            :customer="selected"
            :organisation-id="selected.organisationId"
            @submit="refresh"
        />
        <ManageShippingAddressesDialog
            v-if="selected"
            v-model="shippingOpen"
            :customer="selected"
            :organisation-id="selected.organisationId"
            @submit="refresh"
        />
        <CustomerSubscriptionHistoryDialog
            v-if="selected"
            v-model="historyOpen"
            :organisation-id="selected.organisationId"
            :customer-id="selected.id"
            :customer-name="customerName(selected)"
        />
        <CustomerSubscriptionOrdersDialog
            v-if="selected"
            v-model="ordersOpen"
            :organisation-id="selected.organisationId"
            :customer-id="selected.id"
            :customer-name="customerName(selected)"
            :can-refund="canWrite"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import CustomerMembershipsDialog from '~/components/memberships/CustomerMembershipsDialog.vue'
import CustomerSubscriptionHistoryDialog from '~/components/memberships/CustomerSubscriptionHistoryDialog.vue'
import CustomerSubscriptionOrdersDialog from '~/components/memberships/CustomerSubscriptionOrdersDialog.vue'
import EditCustomerDialog from '~/components/customers/EditCustomerDialog.vue'
import AddCreditCardDialog from '~/components/customers/AddCreditCardDialog.vue'
import ManageShippingAddressesDialog from '~/components/customers/ManageShippingAddressesDialog.vue'
import { CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS } from '~/components/memberships/membership.permissions'
import { useAccessStore } from '~/stores/access.store'
import { useMemberships } from '~/composables/useMemberships'
import { useOrganisation } from '~/composables/useOrganisation'
import { useToast } from '~/composables/useToast'
import type { Customer, CustomerApiService } from '~/services/api/wrappers/customer.api'
import type { MembershipSubscription } from '~/types/membership.types'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: {
        permission: CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ,
        allowAnyOrganisation: true,
    },
})
const access = useAccessStore()
const manager = useMemberships()
const customerApi = useNuxtApp().$customerApi as CustomerApiService
const { errorFromError } = useToast()
const { organisations: allOrganisations, fetchOrganisations } = useOrganisation()
const organisationId = ref<number | null>(null)
const rows = ref<Customer[]>([])
const subscriptions = ref<MembershipSubscription[]>([])
const total = ref(0)
const page = ref(1)
const limit = ref(25)
const search = ref('')
const loading = ref(false)
const selected = ref<Customer | null>(null)
const manageOpen = ref(false)
const editOpen = ref(false)
const cardsOpen = ref(false)
const shippingOpen = ref(false)
const historyOpen = ref(false)
const ordersOpen = ref(false)
const organisations = computed(() =>
    allOrganisations.value.filter(
        (item) =>
            item.id !== access.platformOrganisationId &&
            access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, item.id)
    )
)
const canWrite = computed(
    () =>
        organisationId.value !== null &&
        access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.WRITE, organisationId.value)
)
const headers = [
    { title: 'Customer', key: 'customer' },
    { title: 'Phone', key: 'phoneNumber' },
    { title: 'Subscriptions', key: 'subscriptions' },
    { title: 'Actions', key: 'actions', sortable: false },
]
const refresh = async (): Promise<void> => {
    if (!organisationId.value) return
    loading.value = true
    try {
        const [customerResult, subscriptionResult] = await Promise.all([
            customerApi.getAllCustomers(
                organisationId.value,
                page.value,
                limit.value,
                search.value
            ),
            manager.getCustomerSubscriptions(organisationId.value),
        ])
        rows.value = customerResult.data?.customers ?? []
        total.value = customerResult.data?.total ?? 0
        subscriptions.value = subscriptionResult.data ?? []
    } catch (error) {
        errorFromError(error, 'Unable to load customer subscriptions.')
    } finally {
        loading.value = false
    }
}
const subscriptionsFor = (customerId: number): MembershipSubscription[] =>
    subscriptions.value.filter((item) => item.customerId === customerId)
const customerName = (customer: Customer): string => `${customer.firstName} ${customer.lastName}`
const manage = (customer: Customer): void => {
    selected.value = customer
    manageOpen.value = true
}
const edit = (customer: Customer): void => {
    selected.value = customer
    editOpen.value = true
}
const creditCards = (customer: Customer): void => {
    selected.value = customer
    cardsOpen.value = true
}
const shipping = (customer: Customer): void => {
    selected.value = customer
    shippingOpen.value = true
}
const history = (customer: Customer): void => {
    selected.value = customer
    historyOpen.value = true
}
const ordersFor = (customer: Customer): void => {
    selected.value = customer
    ordersOpen.value = true
}
const dialogClosed = (open: boolean): void => {
    if (!open) void refresh()
}
const changePage = (value: number): void => {
    page.value = value
    void refresh()
}
const changeLimit = (value: number): void => {
    limit.value = value
    page.value = 1
    void refresh()
}
onMounted(async () => {
    await access.ensureReady()
    await fetchOrganisations()
    organisationId.value =
        organisations.value.find((item) => item.id === access.actingOrganisationId)?.id ??
        organisations.value[0]?.id ??
        null
    await refresh()
})
</script>
