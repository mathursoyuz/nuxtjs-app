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
                    v-if="canWrite"
                    variant="tonal"
                    prepend-icon="mdi-shape-plus"
                    @click="addTypeOpen = true"
                >
                    Add group
                </v-btn>
                <v-btn
                    v-if="canWrite"
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
                                v-if="canWrite"
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
                                v-if="canWrite"
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
    </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AddMembershipTypeDialog from '~/components/memberships/AddMembershipTypeDialog.vue'
import EditMembershipTypeDialog from '~/components/memberships/EditMembershipTypeDialog.vue'
import AddPlatformMembershipDialog from '~/components/memberships/AddPlatformMembershipDialog.vue'
import EditPlatformMembershipDialog from '~/components/memberships/EditPlatformMembershipDialog.vue'
import MembershipSubscribersDialog from '~/components/memberships/MembershipSubscribersDialog.vue'
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
const canWrite = computed(() => access.can(PLATFORM_MEMBERSHIP_PERMISSIONS.WRITE))
const canDelete = computed(() => access.can(PLATFORM_MEMBERSHIP_PERMISSIONS.DELETE))
const addTypeOpen = ref(false)
const editTypeOpen = ref(false)
const addMembershipOpen = ref(false)
const editMembershipOpen = ref(false)
const subscribersOpen = ref(false)
const selectedType = ref<MembershipType | null>(null)
const selectedMembership = ref<Membership | null>(null)
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
const removeMembership = async (item: Membership): Promise<void> => {
    if (!confirm(`Delete ${item.name}?`)) return
    try {
        const response = await deletePlatformMembership(item.id)
        successFromResponse(response, 'Platform Service deleted.')
        await refresh()
    } catch (error) {
        errorFromError(error, 'Unable to delete Platform Service.')
    }
}
onMounted(refresh)
</script>
