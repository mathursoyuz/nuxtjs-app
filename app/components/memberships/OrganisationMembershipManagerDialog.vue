<template>
    <v-dialog
        :model-value="modelValue"
        max-width="1400"
        scrollable
        @update:model-value="emit('update:modelValue', $event)"
    >
        <v-card>
            <DialogsDialogHeader
                title="Membership Manager"
                :organisation-name="organisationName"
                entity-label="Organisation"
                :entity-name="organisationName"
                @close="close"
            />
            <v-divider />
            <v-card-text>
                <div class="d-flex justify-end ga-2 flex-wrap mb-4">
                    <v-btn
                        v-if="canReadCustomerSubscriptions"
                        variant="tonal"
                        prepend-icon="mdi-account-search"
                        @click="customerManagerOpen = true"
                    >
                        Manage customer subscriptions
                    </v-btn>
                    <v-btn
                        v-if="canWrite"
                        variant="tonal"
                        prepend-icon="mdi-shape-plus"
                        @click="addGroupOpen = true"
                    >
                        Add group
                    </v-btn>
                    <v-btn
                        v-if="canWrite"
                        color="primary"
                        prepend-icon="mdi-plus"
                        @click="addMembershipOpen = true"
                    >
                        Add membership
                    </v-btn>
                </div>

                <v-progress-linear v-if="store.loading" indeterminate class="mb-4" />
                <v-row>
                    <v-col cols="12" md="4">
                        <v-card height="100%" variant="outlined">
                            <v-card-title>Groups</v-card-title>
                            <v-card-subtitle>Organise related membership tiers.</v-card-subtitle>
                            <v-list class="mt-2">
                                <v-list-item v-for="group in store.types" :key="group.id">
                                    <v-list-item-title>{{ group.name }}</v-list-item-title>
                                    <v-list-item-subtitle>{{ group.slug }}</v-list-item-subtitle>
                                    <template #append>
                                        <v-btn
                                            v-if="canWrite"
                                            icon="mdi-pencil"
                                            size="small"
                                            variant="text"
                                            title="Edit group"
                                            @click="editGroup(group)"
                                        />
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-card>
                    </v-col>
                    <v-col cols="12" md="8">
                        <v-card variant="outlined">
                            <v-card-title>Memberships</v-card-title>
                            <v-data-table
                                :headers="headers"
                                :items="store.memberships"
                                :loading="store.loading"
                            >
                                <template #item.priceAmount="{ item }">
                                    {{
                                        item.isChargeable
                                            ? formatMembershipMoney(item.priceAmount)
                                            : 'Free'
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
                                        v-if="canWrite"
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
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn @click="close">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <AddMembershipTypeDialog
        v-model="addGroupOpen"
        scope="ORGANISATION"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        @saved="refresh"
    />
    <EditMembershipTypeDialog
        v-model="editGroupOpen"
        scope="ORGANISATION"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        :membership-type="selectedGroup"
        @saved="refresh"
    />
    <AddOrganisationMembershipDialog
        v-model="addMembershipOpen"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        :types="store.types"
        :categories="categoryOptions"
        :products="productOptions"
        @saved="refresh"
    />
    <EditOrganisationMembershipDialog
        v-model="editMembershipOpen"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        :membership="selectedMembership"
        :types="store.types"
        :categories="categoryOptions"
        :products="productOptions"
        @saved="refresh"
    />
    <CustomerSubscriptionSearchDialog
        v-model="customerManagerOpen"
        :organisation-id="organisationId"
        :organisation-name="organisationName"
        :can-write="canWriteCustomerSubscriptions"
        @subscriptions-updated="subscriberRefreshKey++"
    />
    <MembershipSubscribersDialog
        v-model="membersOpen"
        audience="CUSTOMER"
        :organisation-id="organisationId"
        :membership="selectedMembership"
        :refresh-key="subscriberRefreshKey"
    />
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AddMembershipTypeDialog from './AddMembershipTypeDialog.vue'
import AddOrganisationMembershipDialog from './AddOrganisationMembershipDialog.vue'
import CustomerSubscriptionSearchDialog from './CustomerSubscriptionSearchDialog.vue'
import EditMembershipTypeDialog from './EditMembershipTypeDialog.vue'
import EditOrganisationMembershipDialog from './EditOrganisationMembershipDialog.vue'
import MembershipSubscribersDialog from './MembershipSubscribersDialog.vue'
import {
    CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
    ORGANISATION_MEMBERSHIP_PERMISSIONS,
} from './membership.permissions'
import { useAccessStore } from '~/stores/access.store'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipType } from '~/types/membership.types'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    organisationName: string
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const access = useAccessStore()
const manager = useMemberships()
const { store, loadOrganisation, loadOrganisationFormOptions, deleteOrganisationMembership } =
    manager
const { successFromResponse, errorFromError } = useToast()

const canWrite = computed(() =>
    access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.WRITE, props.organisationId)
)
const canDelete = computed(() =>
    access.can(ORGANISATION_MEMBERSHIP_PERMISSIONS.DELETE, props.organisationId)
)
const canReadCustomerSubscriptions = computed(() =>
    access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ, props.organisationId)
)
const canWriteCustomerSubscriptions = computed(() =>
    access.can(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.WRITE, props.organisationId)
)
const addGroupOpen = ref(false)
const editGroupOpen = ref(false)
const addMembershipOpen = ref(false)
const editMembershipOpen = ref(false)
const customerManagerOpen = ref(false)
const membersOpen = ref(false)
const subscriberRefreshKey = ref(0)
const selectedGroup = ref<MembershipType | null>(null)
const selectedMembership = ref<Membership | null>(null)
const categoryOptions = ref<Array<{ title: string; value: number }>>([])
const productOptions = ref<Array<{ title: string; value: number }>>([])
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Group', key: 'membershipGroupName' },
    { title: 'Tier', key: 'tierRank' },
    { title: 'Price', key: 'priceAmount' },
    { title: 'Billing', key: 'billingInterval' },
    { title: 'Actions', key: 'actions', sortable: false },
]

const refresh = async (): Promise<void> => {
    if (!props.organisationId) return
    try {
        await loadOrganisation(props.organisationId)
        const options = await loadOrganisationFormOptions(props.organisationId)
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
const removeMembership = async (item: Membership): Promise<void> => {
    if (!confirm(`Delete ${item.name}?`)) return
    try {
        const response = await deleteOrganisationMembership(props.organisationId, item.id)
        successFromResponse(response, 'Membership deleted.')
        await refresh()
    } catch (error) {
        errorFromError(error, 'Unable to delete membership.')
    }
}
const close = (): void => emit('update:modelValue', false)

watch(
    () => [props.modelValue, props.organisationId] as const,
    ([open]) => {
        if (open) void refresh()
    },
    { immediate: true }
)
</script>
