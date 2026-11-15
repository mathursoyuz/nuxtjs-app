<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between mb-4">
            <div>
                <h1 class="text-h4">Membership Manager</h1>
                <div class="text-body-2 text-medium-emphasis">
                    Manage customer membership groups, memberships, benefits, and discounts.
                </div>
            </div>
            <div class="d-flex ga-2">
                <v-btn
                    v-if="canReadCustomerSubscriptions"
                    variant="tonal"
                    prepend-icon="mdi-account-search"
                    @click="customerManagerOpen = true"
                >
                    Manage customer subscriptions
                </v-btn>
                <v-btn
                    v-if="canCreate"
                    variant="tonal"
                    prepend-icon="mdi-shape-plus"
                    @click="addGroupOpen = true"
                >
                    Add group
                </v-btn>
                <v-btn
                    v-if="canCreate"
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="addMembershipOpen = true"
                >
                    Add membership
                </v-btn>
            </div>
        </div>

        <v-card class="mb-4">
            <v-card-text>
                <v-select
                    v-model="selectedOrganisationId"
                    :items="organisationOptions"
                    item-title="name"
                    item-value="id"
                    label="Organisation"
                    :readonly="organisationLocked"
                    :disabled="organisationLocked || organisationOptions.length < 2"
                    hide-details
                    @update:model-value="refresh"
                />
                <div v-if="organisationLocked" class="text-caption text-medium-emphasis mt-2">
                    The organisation is fixed because this manager was opened for a selected
                    organisation.
                </div>
            </v-card-text>
        </v-card>

        <v-row v-if="selectedOrganisationId">
            <v-col cols="12" md="4">
                <v-card height="100%">
                    <v-card-title>Groups</v-card-title>
                    <v-card-subtitle>
                        Use groups to organise related membership tiers.
                    </v-card-subtitle>
                    <v-list :items="store.types" item-title="name" class="mt-2">
                        <template #append="{ item }">
                            <v-btn
                                v-if="canUpdate"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                title="Edit group"
                                @click="editGroup(item)"
                            />
                        </template>
                    </v-list>
                </v-card>
            </v-col>
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title>Memberships</v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="store.memberships"
                        :loading="store.loading"
                    >
                        <template #item.priceAmount="{ item }">
                            {{
                                item.isChargeable ? formatMembershipMoney(item.priceAmount) : 'Free'
                            }}
                        </template>
                        <template #item.actions="{ item }">
                            <v-btn
                                v-if="canReadCustomerSubscriptions"
                                icon="mdi-account-multiple"
                                size="small"
                                variant="text"
                                title="List members"
                                @click="listMembers(item)"
                            />
                            <v-btn
                                v-if="canUpdate"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                title="Edit membership"
                                @click="editMembership(item)"
                            />
                            <v-btn
                                v-if="canDelete"
                                icon="mdi-delete"
                                color="error"
                                size="small"
                                variant="text"
                                title="Delete membership"
                                @click="removeMembership(item)"
                            />
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
        <v-alert v-else type="info" variant="tonal">
            No organisation with membership access is available.
        </v-alert>

        <AddMembershipTypeDialog
            v-model="addGroupOpen"
            scope="ORGANISATION"
            :organisation-id="selectedOrganisationId ?? undefined"
            :organisation-name="selectedOrganisationName"
            @saved="refresh"
        />
        <EditMembershipTypeDialog
            v-model="editGroupOpen"
            scope="ORGANISATION"
            :organisation-id="selectedOrganisationId ?? undefined"
            :organisation-name="selectedOrganisationName"
            :membership-type="selectedGroup"
            @saved="refresh"
        />
        <AddOrganisationMembershipDialog
            v-if="selectedOrganisationId"
            v-model="addMembershipOpen"
            :organisation-id="selectedOrganisationId"
            :organisation-name="selectedOrganisationName"
            :types="store.types"
            :categories="categoryOptions"
            :products="productOptions"
            @saved="refresh"
        />
        <EditOrganisationMembershipDialog
            v-if="selectedOrganisationId"
            v-model="editMembershipOpen"
            :organisation-id="selectedOrganisationId"
            :organisation-name="selectedOrganisationName"
            :membership="selectedMembership"
            :types="store.types"
            :categories="categoryOptions"
            :products="productOptions"
            @saved="refresh"
        />
        <CustomerSubscriptionSearchDialog
            v-if="selectedOrganisationId"
            v-model="customerManagerOpen"
            :organisation-id="selectedOrganisationId"
            :organisation-name="selectedOrganisationName"
            :can-write="canWriteCustomerSubscriptions"
        />
        <MembershipSubscribersDialog
            v-model="membersOpen"
            audience="CUSTOMER"
            :organisation-id="selectedOrganisationId ?? undefined"
            :membership="selectedMembership"
        />
        <ConfirmDialog
            :model-value="membershipToDelete !== null"
            title="Delete Membership"
            :message="`Delete ${membershipToDelete?.name ?? 'this membership'}?`"
            confirm-text="Delete"
            cancel-text="Cancel"
            confirm-color="error"
            :loading="deleting"
            :organisation-name="selectedOrganisationName"
            entity-label="Membership"
            :entity-name="membershipToDelete?.name"
            @cancel="membershipToDelete = null"
            @confirm="confirmRemoveMembership"
        />
    </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AddMembershipTypeDialog from '~/components/memberships/AddMembershipTypeDialog.vue'
import EditMembershipTypeDialog from '~/components/memberships/EditMembershipTypeDialog.vue'
import AddOrganisationMembershipDialog from '~/components/memberships/AddOrganisationMembershipDialog.vue'
import EditOrganisationMembershipDialog from '~/components/memberships/EditOrganisationMembershipDialog.vue'
import CustomerSubscriptionSearchDialog from '~/components/memberships/CustomerSubscriptionSearchDialog.vue'
import MembershipSubscribersDialog from '~/components/memberships/MembershipSubscribersDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import {
    CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
    ORGANISATION_MEMBERSHIP_PERMISSIONS,
} from '~/components/memberships/membership.permissions'
import { SYSTEM_ROLE } from '~/constants/access.constants'
import { useAccessStore } from '~/stores/access.store'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipType } from '~/types/membership.types'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: ORGANISATION_MEMBERSHIP_PERMISSIONS.READ, allowAnyOrganisation: true },
})

const access = useAccessStore()
const route = useRoute()
const membershipManager = useMemberships()
const { store, loadOrganisation, loadOrganisationFormOptions, deleteOrganisationMembership } =
    membershipManager
const { successFromResponse, errorFromError } = useToast()

const requestedOrganisationId = (() => {
    const value = Array.isArray(route.query.organisationId)
        ? route.query.organisationId[0]
        : route.query.organisationId
    return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null
})()
const isPlatformUser = computed(
    () =>
        access.systemRole === SYSTEM_ROLE.PLATFORM_ADMIN ||
        access.systemRole === SYSTEM_ROLE.PLATFORM_USER
)
const organisationOptions = computed(() =>
    access.organisations.filter(
        (organisation) =>
            organisation.id !== access.platformOrganisationId &&
            access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.READ, organisation.id)
    )
)
const selectedOrganisationId = ref<number | null>(null)
const organisationLocked = computed(() => !isPlatformUser.value || requestedOrganisationId !== null)
const selectedOrganisationName = computed(
    () =>
        organisationOptions.value.find(
            (organisation) => organisation.id === selectedOrganisationId.value
        )?.name ?? ''
)
const canCreate = computed(
    () =>
        selectedOrganisationId.value !== null &&
        access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.CREATE, selectedOrganisationId.value)
)
const canUpdate = computed(
    () =>
        selectedOrganisationId.value !== null &&
        access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.UPDATE, selectedOrganisationId.value)
)
const canDelete = computed(
    () =>
        selectedOrganisationId.value !== null &&
        access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.DELETE, selectedOrganisationId.value)
)
const canReadCustomerSubscriptions = computed(
    () =>
        selectedOrganisationId.value !== null &&
        access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, selectedOrganisationId.value)
)
const canWriteCustomerSubscriptions = computed(
    () =>
        selectedOrganisationId.value !== null &&
        (access.can(
            CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.CREATE,
            selectedOrganisationId.value
        ) ||
            access.can(
                CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.UPDATE,
                selectedOrganisationId.value
            ))
)

const addGroupOpen = ref(false)
const editGroupOpen = ref(false)
const addMembershipOpen = ref(false)
const editMembershipOpen = ref(false)
const customerManagerOpen = ref(false)
const membersOpen = ref(false)
const selectedGroup = ref<MembershipType | null>(null)
const selectedMembership = ref<Membership | null>(null)
const membershipToDelete = ref<Membership | null>(null)
const deleting = ref(false)
const categoryOptions = ref<Array<{ title: string; value: number }>>([])
const productOptions = ref<Array<{ title: string; value: number }>>([])
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Group', key: 'membershipGroupName' },
    { title: 'Tier', key: 'tierRank' },
    { title: 'Price', key: 'priceAmount' },
    { title: 'Billing', key: 'billingInterval' },
    { title: 'Revision', key: 'pricingRevision' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const refresh = async (): Promise<void> => {
    if (!selectedOrganisationId.value) return
    try {
        await loadOrganisation(selectedOrganisationId.value)
        const options = await loadOrganisationFormOptions(selectedOrganisationId.value)
        categoryOptions.value = options.categories
        productOptions.value = options.products
    } catch (error) {
        errorFromError(error, 'Unable to load memberships for this organisation.')
    }
}
const editGroup = (item: MembershipType): void => {
    selectedGroup.value = item
    editGroupOpen.value = true
}
const editMembership = (item: Membership): void => {
    selectedMembership.value = item
    editMembershipOpen.value = true
}
const listMembers = (item: Membership): void => {
    selectedMembership.value = item
    membersOpen.value = true
}
const removeMembership = (item: Membership): void => {
    if (!selectedOrganisationId.value) return
    membershipToDelete.value = item
}
const confirmRemoveMembership = async (): Promise<void> => {
    if (!selectedOrganisationId.value || !membershipToDelete.value || deleting.value) return
    deleting.value = true
    try {
        const response = await deleteOrganisationMembership(
            selectedOrganisationId.value,
            membershipToDelete.value.id
        )
        successFromResponse(response, 'Membership deleted.')
        membershipToDelete.value = null
        await refresh()
    } catch (error) {
        errorFromError(error, 'Unable to delete membership.')
    } finally {
        deleting.value = false
    }
}

onMounted(async () => {
    await access.ensureReady()
    selectedOrganisationId.value =
        requestedOrganisationId &&
        organisationOptions.value.some(
            (organisation) => organisation.id === requestedOrganisationId
        )
            ? requestedOrganisationId
            : organisationOptions.value.some(
                    (organisation) => organisation.id === access.actingOrganisationId
                )
              ? access.actingOrganisationId
              : (organisationOptions.value[0]?.id ?? null)
    await refresh()
})
</script>
