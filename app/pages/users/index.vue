<template>
    <v-container fluid class="pa-6">
        <PageFilters>
            <v-select
                v-model="statusFilter"
                :items="statusOptions"
                label="User status"
                variant="outlined"
                density="compact"
                hide-details
                class="user-status-filter"
            />
        </PageFilters>
        <div class="d-flex flex-wrap align-start justify-space-between ga-4 mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold">User Management</h1>
                <p class="text-body-2 text-medium-emphasis mt-1">
                    {{ contextName }} · Manage staff accounts and access.
                </p>
            </div>
            <v-btn v-if="canCreate" color="primary" prepend-icon="mdi-plus" @click="createUser">
                Create user
            </v-btn>
        </div>
        <v-alert v-if="isOverview" type="info" variant="tonal" class="mb-4">
            This is a read-only overview. Use the sidebar switcher to manage a organisation’s users.
        </v-alert>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
        <v-card variant="outlined" rounded="lg">
            <v-card-text class="pb-0">
                <v-text-field
                    v-model="search"
                    label="Search users"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    clearable
                    hide-details
                    class="user-search mb-4"
                />
            </v-card-text>
            <v-data-table
                :headers="headers"
                :items="filteredUsers"
                :loading="loading || access.busy"
                :items-per-page="10"
            >
                <template #item.user="{ item }">
                    <div class="d-flex align-center ga-3 py-3">
                        <v-avatar size="36" color="grey-lighten-3">
                            <span class="text-caption font-weight-medium">
                                {{ initials(item) }}
                            </span>
                        </v-avatar>
                        <div>
                            <div class="font-weight-medium">
                                {{ item.firstName }} {{ item.lastName }}
                                <span
                                    v-if="item.id === auth.userId"
                                    class="text-caption text-medium-emphasis"
                                >
                                    (You)
                                </span>
                            </div>
                            <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
                        </div>
                    </div>
                </template>
                <template #item.systemRole="{ item }">
                    {{ SYSTEM_ROLE_LABELS[item.systemRole] }}
                </template>
                <template #item.organisationId="{ item }">
                    {{
                        access.organisations.find((organisation) => organisation.id === item.organisationId)?.name ??
                        'Organisation'
                    }}
                </template>
                <template #item.isActive="{ item }">
                    <v-chip
                        :color="item.isActive ? 'success' : 'grey'"
                        size="small"
                        variant="tonal"
                    >
                        {{ item.isActive ? 'Active' : 'Inactive' }}
                    </v-chip>
                </template>
                <template #item.actions="{ item }">
                    <div class="d-flex flex-wrap justify-end ga-1">
                        <v-btn
                            v-if="canUpdate && item.canEdit && item.id !== auth.userId"
                            variant="text"
                            size="small"
                            prepend-icon="mdi-pencil-outline"
                            @click="editUser(item)"
                        >
                            Edit
                        </v-btn>
                        <v-btn
                            v-if="
                                canChangeStatus && item.canChangeStatus && item.id !== auth.userId
                            "
                            variant="text"
                            size="small"
                            :color="item.isActive ? 'error' : 'success'"
                            :prepend-icon="
                                item.isActive ? 'mdi-lock-outline' : 'mdi-lock-open-outline'
                            "
                            @click="statusTarget = item"
                        >
                            {{ item.isActive ? 'Deactivate' : 'Activate' }}
                        </v-btn>
                        <v-btn
                            v-if="canChangeSystemRole && item.id !== auth.userId && item.isActive"
                            variant="text"
                            size="small"
                            prepend-icon="mdi-shield-account-outline"
                            @click="editSystemRole(item)"
                        >
                            System role
                        </v-btn>
                    </div>
                </template>
                <template #no-data>
                    <div class="pa-8 text-medium-emphasis">
                        No users found in this organisation.
                    </div>
                </template>
            </v-data-table>
        </v-card>

        <UserDialog
            v-if="organisationId && userDialog"
            :key="`${organisationId}:${editingUserId ?? 'new'}`"
            v-model="userDialog"
            :organisation-id="organisationId"
            :context-name="contextName"
            :user-id="editingUserId"
            @saved="reload"
        />
        <ConfirmDialog
            :model-value="!!statusTarget"
            :title="statusTarget?.isActive ? 'Deactivate user' : 'Activate user'"
            :message="`${statusTarget?.isActive ? 'Deactivate' : 'Activate'} ${statusTarget?.firstName ?? ''} ${statusTarget?.lastName ?? ''}?`"
            :details="
                statusTarget?.isActive
                    ? 'This user will no longer be able to sign in or use an existing session.'
                    : 'This user will be able to sign in again. Their existing roles and organisation assignments remain unchanged.'
            "
            :confirm-text="statusTarget?.isActive ? 'Deactivate' : 'Activate'"
            :confirm-color="statusTarget?.isActive ? 'error' : 'success'"
            :loading="saving"
            @confirm="changeStatus"
            @cancel="statusTarget = null"
        />
        <v-dialog
            :model-value="!!systemTarget"
            max-width="480"
            :persistent="saving"
            @update:model-value="systemTarget = null"
        >
            <v-card rounded="lg" title="Change system role">
                <v-card-text>
                    <p class="text-body-2 mb-4">
                        {{ systemTarget?.firstName }} {{ systemTarget?.lastName }}
                    </p>
                    <v-select
                        v-model="nextSystemRole"
                        :items="systemRoleOptions"
                        label="System role"
                        variant="outlined"
                        hide-details
                    />
                    <p class="text-caption text-medium-emphasis mt-3">
                        Assign a replacement before changing the last admin or organisation owner.
                    </p>
                    <v-alert v-if="dialogError" type="error" variant="tonal" class="mt-3">
                        {{ dialogError }}
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn :disabled="saving" @click="systemTarget = null">Cancel</v-btn>
                    <v-btn color="primary" :loading="saving" @click="changeSystemRole">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script setup lang="ts">
import { USER_PERMISSIONS } from '~/components/access/users.permissions'
import { SYSTEM_ROLE } from '~/constants/access.constants'

import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useAccessStore } from '~/stores/access.store'
import { useFilterStore } from '~/stores/filter.store'
import { useAuthStore } from '~/stores/auth.store'
import type { AccessApiService } from '~/services/api/wrappers/access.api'
import { SYSTEM_ROLE_LABELS } from '~/types/access.types'
import type { ManagedUser, SystemRole, UserManagementOptions } from '~/types/access.types'
import UserDialog from '~/components/access/UserDialog.vue'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import PageFilters from '~/components/filters/PageFilters.vue'

definePageMeta({
    middleware: ['auth', 'permission'],
    access: {
        permission: USER_PERMISSIONS.READ,
        allowCrossOrganisation: true,
        allowCurrentContext: true,
    },
    organisationFilter: { permission: USER_PERMISSIONS.READ, includePlatform: true },
})
const access = useAccessStore()
const filters = useFilterStore()
const auth = useAuthStore()
const api = useNuxtApp().$accessApi as AccessApiService
const toast = useToast()
const organisationId = computed(() => access.actingOrganisationId)
const filterOrganisationId = computed(() => (access.isPlatformContext ? filters.organisationId : null))
const isOverview = computed(
    () => access.isPlatformContext && filterOrganisationId.value !== access.platformOrganisationId
)
const contextName = computed(() =>
    isOverview.value
        ? filterOrganisationId.value
            ? (access.organisations.find((organisation) => organisation.id === filterOrganisationId.value)?.name ??
              'Selected organisation')
            : 'All accessible organisations'
        : organisationId.value === access.platformOrganisationId
          ? 'Platform users'
          : (access.actingContext?.organisationName ?? 'Organisation users')
)
const canCreate = computed(() => !isOverview.value && access.can(USER_PERMISSIONS.WRITE))
const canUpdate = computed(() => !isOverview.value && access.can(USER_PERMISSIONS.WRITE))
const canChangeStatus = computed(() => !isOverview.value && access.can(USER_PERMISSIONS.WRITE))
const canChangeSystemRole = computed(
    () =>
        !isOverview.value &&
        access.can(USER_PERMISSIONS.WRITE) &&
        (managementOptions.value?.systemRoles.length ?? 0) > 1
)
const managementOptions = ref<UserManagementOptions | null>(null)
const users = ref<(ManagedUser & { organisationId?: number })[]>([])
const search = ref('')
const statusFilter = ref<'all' | 'active' | 'inactive'>('all')
const statusOptions = [
    { title: 'All users', value: 'all' },
    { title: 'Active users', value: 'active' },
    { title: 'Inactive users', value: 'inactive' },
]
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogError = ref('')
const userDialog = ref(false)
const editingUserId = ref<number>()
const statusTarget = ref<ManagedUser | null>(null)
const systemTarget = ref<ManagedUser | null>(null)
const nextSystemRole = ref<SystemRole>(SYSTEM_ROLE.PLATFORM_USER)
let revision = 0
const headers = computed(() => [
    { title: 'User', key: 'user', sortable: false },
    ...(isOverview.value ? [{ title: 'Organisation', key: 'organisationId' }] : []),
    { title: 'System role', key: 'systemRole' },
    { title: 'Status', key: 'isActive' },
    { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
])
const filteredUsers = computed(() => {
    const term = (search.value ?? '').trim().toLowerCase()
    return users.value.filter((user) => {
        const matchesStatus =
            statusFilter.value === 'all' ||
            (statusFilter.value === 'active' ? user.isActive : !user.isActive)
        return (
            matchesStatus &&
            `${user.firstName} ${user.lastName} ${user.email} ${SYSTEM_ROLE_LABELS[user.systemRole]}`
                .toLowerCase()
                .includes(term)
        )
    })
})
const systemRoleOptions = computed(() => {
    const codes: SystemRole[] = systemTarget.value?.systemRole.startsWith('PLATFORM_')
        ? [SYSTEM_ROLE.PLATFORM_ADMIN, SYSTEM_ROLE.PLATFORM_USER]
        : [SYSTEM_ROLE.ORGANISATION_OWNER, SYSTEM_ROLE.ORGANISATION_TEAM_USER]
    return codes.map((value) => ({ title: SYSTEM_ROLE_LABELS[value], value }))
})
function initials(user: ManagedUser) {
    return `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
}
function message(cause: unknown) {
    const value = cause as {
        response?: { data?: { message?: string | string[] } }
        message?: string
    }
    const text = value?.response?.data?.message
    return Array.isArray(text)
        ? text.join(' ')
        : text || value?.message || 'Unable to complete this action.'
}
function clear() {
    revision++
    users.value = []
    error.value = ''
    dialogError.value = ''
    loading.value = saving.value = false
    userDialog.value = false
    statusTarget.value = systemTarget.value = null
    managementOptions.value = null
}
async function load() {
    const current = ++revision
    const id = organisationId.value
    users.value = []
    error.value = ''
    if (access.loading || !access.ready) return
    if (
        !id ||
        (isOverview.value
            ? !access.canAcrossOrganisations(USER_PERMISSIONS.READ)
            : !access.can(USER_PERMISSIONS.READ))
    ) {
        error.value = 'You do not have permission to view users in this organisation.'
        return
    }
    loading.value = true
    try {
        const [response, optionsResponse] = await Promise.all([
            isOverview.value
                ? api.managedUsersOverview(filterOrganisationId.value ?? undefined)
                : api.managedUsers(id),
            isOverview.value ? Promise.resolve(null) : api.userOptions(id),
        ])
        if (current === revision) {
            users.value = response.data ?? []
            managementOptions.value = optionsResponse?.data ?? null
        }
    } catch (cause) {
        if (current === revision) error.value = message(cause)
    } finally {
        if (current === revision) loading.value = false
    }
}
async function reload() {
    userDialog.value = false
    await access.refresh()
    await load()
}
function createUser() {
    editingUserId.value = undefined
    userDialog.value = true
}
function editUser(user: ManagedUser) {
    editingUserId.value = user.id
    userDialog.value = true
}
function editSystemRole(user: ManagedUser) {
    systemTarget.value = user
    nextSystemRole.value = user.systemRole
    dialogError.value = ''
}
async function changeStatus() {
    const user = statusTarget.value
    const id = organisationId.value
    if (
        !user ||
        !id ||
        saving.value ||
        !canChangeStatus.value ||
        !user.canChangeStatus ||
        user.id === auth.userId
    )
        return
    const current = revision
    saving.value = true
    try {
        const response = await api.setUserStatus(id, user.id, !user.isActive)
        if (current !== revision) return
        statusTarget.value = null
        toast.successFromResponse(response, user.isActive ? 'User deactivated.' : 'User activated.')
        await reload()
    } catch (cause) {
        if (current === revision) {
            statusTarget.value = null
            error.value = message(cause)
        }
    } finally {
        if (current === revision || !statusTarget.value) saving.value = false
    }
}
async function changeSystemRole() {
    const target = systemTarget.value
    if (!target || saving.value || !canChangeSystemRole.value || target.id === auth.userId) return
    const current = revision
    saving.value = true
    dialogError.value = ''
    try {
        await api.changeSystemRole(target.id, nextSystemRole.value)
        if (current !== revision) return
        systemTarget.value = null
        await reload()
    } catch (cause) {
        if (current === revision) dialogError.value = message(cause)
    } finally {
        if (current === revision || !systemTarget.value) saving.value = false
    }
}
let filterInitialized = false
watch(
    [() => access.ready, () => access.isPlatformContext],
    () => {
        if (filterInitialized || !access.ready || !access.isPlatformContext) return
        filterInitialized = true
        if (filters.organisationId === null && access.can(USER_PERMISSIONS.READ))
            filters.setOrganisationId(access.platformOrganisationId)
    },
    { immediate: true }
)
watch(
    [organisationId, filterOrganisationId, () => access.ready, () => access.loading],
    () => {
        clear()
        if (!access.loading && access.ready) void load()
    },
    { flush: 'sync' }
)
onBeforeUnmount(clear)
await load()
</script>

<style scoped>
.user-search {
    max-width: 440px;
}
.user-status-filter {
    flex: 0 1 190px;
    width: 190px;
}
</style>
