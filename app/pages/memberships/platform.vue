<template>
    <v-container fluid>
        <div class="d-flex align-center justify-space-between mb-4">
            <div>
                <h1 class="text-h4">Platform Services</h1>
                <div class="text-body-2 text-medium-emphasis">
                    Manage services offered by the platform to organisations.
                </div>
            </div>
            <div class="d-flex ga-2">
                <v-btn
                    v-if="canCreate"
                    variant="tonal"
                    prepend-icon="mdi-shape-plus"
                    @click="addTypeOpen = true"
                >
                    Add group
                </v-btn>
                <v-btn
                    v-if="canCreate"
                    color="primary"
                    prepend-icon="mdi-plus"
                    @click="addMembershipOpen = true"
                >
                    Add service
                </v-btn>
            </div>
        </div>
        <v-row>
            <v-col cols="12" md="4">
                <v-card>
                    <v-card-title>Groups</v-card-title>
                    <v-list :items="store.types" item-title="name">
                        <template #append="{ item }">
                            <v-btn
                                v-if="canUpdate"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                @click="editType(item)"
                            />
                        </template>
                    </v-list>
                </v-card>
            </v-col>
            <v-col cols="12" md="8">
                <v-card>
                    <v-card-title>Service Manager</v-card-title>
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
                                icon="mdi-office-building-multiple"
                                size="small"
                                variant="text"
                                title="List subscribed organisations"
                                @click="listSubscribers(item)"
                            />
                            <v-btn
                                v-if="canUpdate"
                                icon="mdi-pencil"
                                size="small"
                                variant="text"
                                @click="editMembership(item)"
                            />
                            <v-btn
                                v-if="canDelete"
                                icon="mdi-delete"
                                color="error"
                                size="small"
                                variant="text"
                                @click="removeMembership(item)"
                            />
                        </template>
                    </v-data-table>
                </v-card>
            </v-col>
        </v-row>
        <AddMembershipTypeDialog v-model="addTypeOpen" scope="PLATFORM" @saved="refresh" />
        <EditMembershipTypeDialog
            v-model="editTypeOpen"
            scope="PLATFORM"
            :membership-type="selectedType"
            @saved="refresh"
        />
        <AddPlatformMembershipDialog
            v-model="addMembershipOpen"
            :types="store.types"
            @saved="refresh"
        />
        <EditPlatformMembershipDialog
            v-model="editMembershipOpen"
            :types="store.types"
            :membership="selectedMembership"
            @saved="refresh"
        />
        <MembershipSubscribersDialog
            v-model="subscribersOpen"
            audience="ORGANISATION"
            :membership="selectedMembership"
        />
        <ConfirmDialog
            :model-value="membershipToDelete !== null"
            title="Delete Platform Service"
            :message="`Delete ${membershipToDelete?.name ?? 'this Platform Service'}?`"
            confirm-text="Delete"
            cancel-text="Cancel"
            confirm-color="error"
            :loading="deleting"
            :organisation-name="platformOrganisationName"
            entity-label="Platform Service"
            :entity-name="membershipToDelete?.name"
            @cancel="membershipToDelete = null"
            @confirm="confirmRemoveMembership"
        />
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AddMembershipTypeDialog from '~/components/memberships/AddMembershipTypeDialog.vue'
import EditMembershipTypeDialog from '~/components/memberships/EditMembershipTypeDialog.vue'
import AddPlatformMembershipDialog from '~/components/memberships/AddPlatformMembershipDialog.vue'
import EditPlatformMembershipDialog from '~/components/memberships/EditPlatformMembershipDialog.vue'
import MembershipSubscribersDialog from '~/components/memberships/MembershipSubscribersDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import { PLATFORM_MEMBERSHIP_PERMISSIONS } from '~/components/memberships/membership.permissions'
import { useAccessStore } from '~/stores/access.store'
import { useMemberships } from '~/composables/useMemberships'
import { useToast } from '~/composables/useToast'
import { formatMembershipMoney } from '~/utils/membership.util'
import type { Membership, MembershipType } from '~/types/membership.types'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: PLATFORM_MEMBERSHIP_PERMISSIONS.READ },
})
const access = useAccessStore()
const { store, loadPlatform, deletePlatformMembership } = useMemberships()
const { successFromResponse, errorFromError } = useToast()
const canCreate = computed(() => access.can(PLATFORM_MEMBERSHIP_PERMISSIONS.CREATE))
const canUpdate = computed(() => access.can(PLATFORM_MEMBERSHIP_PERMISSIONS.UPDATE))
const canDelete = computed(() => access.can(PLATFORM_MEMBERSHIP_PERMISSIONS.DELETE))
const platformOrganisationName = computed(
    () =>
        access.organisations.find((item) => item.id === access.platformOrganisationId)?.name ??
        'Platform'
)
const addTypeOpen = ref(false)
const editTypeOpen = ref(false)
const addMembershipOpen = ref(false)
const editMembershipOpen = ref(false)
const subscribersOpen = ref(false)
const selectedType = ref<MembershipType | null>(null)
const selectedMembership = ref<Membership | null>(null)
const membershipToDelete = ref<Membership | null>(null)
const deleting = ref(false)
const headers = [
    { title: 'Name', key: 'name' },
    { title: 'Group', key: 'membershipGroupName' },
    { title: 'Tier', key: 'tierRank' },
    { title: 'Price', key: 'priceAmount' },
    { title: 'Billing', key: 'billingInterval' },
    { title: 'Actions', key: 'actions', sortable: false },
]
const refresh = async (): Promise<void> => {
    try {
        await loadPlatform()
    } catch (error) {
        errorFromError(error, 'Unable to load Platform Services.')
    }
}
const editType = (item: MembershipType): void => {
    selectedType.value = item
    editTypeOpen.value = true
}
const editMembership = (item: Membership): void => {
    selectedMembership.value = item
    editMembershipOpen.value = true
}
const listSubscribers = (item: Membership): void => {
    selectedMembership.value = item
    subscribersOpen.value = true
}
const removeMembership = (item: Membership): void => {
    membershipToDelete.value = item
}
const confirmRemoveMembership = async (): Promise<void> => {
    if (!membershipToDelete.value || deleting.value) return
    deleting.value = true
    try {
        const response = await deletePlatformMembership(membershipToDelete.value.id)
        successFromResponse(response, 'Platform Service deleted.')
        membershipToDelete.value = null
        await refresh()
    } catch (error) {
        errorFromError(error, 'Unable to delete Platform Service.')
    } finally {
        deleting.value = false
    }
}
onMounted(refresh)
</script>
