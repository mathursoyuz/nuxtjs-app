<template>
    <v-container fluid class="pa-6">
        <div class="d-flex flex-wrap justify-space-between align-start ga-3 mb-6">
            <div>
                <h1 class="text-h4 font-weight-bold">Roles & permissions</h1>
                <p class="text-body-2 text-medium-emphasis mt-1">{{ contextName }}</p>
            </div>
            <v-btn
                v-if="canCreateRole"
                color="primary"
                prepend-icon="mdi-plus"
                :disabled="access.loading || !organisationId"
                @click="editRole()"
            >
                Create role
            </v-btn>
        </div>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-4">{{ error }}</v-alert>
        <v-card variant="outlined" rounded="lg">
            <v-data-table
                :headers="roleHeaders"
                :items="roles"
                :loading="loading || access.loading"
            >
                <template #item.isSystem="{ item }">
                    <v-chip size="small">
                        {{ item.isSystem ? 'System · protected' : 'Custom' }}
                    </v-chip>
                </template>
                <template #item.permissions="{ item }">
                    {{ item.permissions.join(', ') || '—' }}
                </template>
                <template #item.actions="{ item }">
                    <v-btn
                        v-if="canUpdateRole && !item.isSystem"
                        icon="mdi-pencil"
                        variant="text"
                        size="small"
                        @click="editRole(item)"
                    />
                    <v-btn
                        v-if="canDeleteRole && !item.isSystem"
                        icon="mdi-delete"
                        variant="text"
                        size="small"
                        color="error"
                        @click="roleToDelete = item"
                    />
                </template>
            </v-data-table>
        </v-card>
        <v-dialog v-model="roleDialog" max-width="650">
            <v-card>
                <DialogsDialogHeader
                    :title="editingRoleId ? 'Edit role' : 'Create role'"
                    :organisation-name="access.isPlatformContext ? undefined : contextName"
                    :scope="access.isPlatformContext ? 'Platform' : undefined"
                    entity-label="Role"
                    :entity-name="roleForm.name || 'New role'"
                    :close-disabled="saving"
                    @close="roleDialog = false"
                />
                <v-card-text>
                    <v-text-field v-model="roleForm.name" label="Role name" />
                    <v-text-field
                        v-model="roleForm.code"
                        label="Code"
                        hint="Lowercase letters, numbers, hyphens or underscores."
                        persistent-hint
                    />
                    <v-switch v-model="roleForm.isActive" label="Active" color="primary" />
                    <v-checkbox
                        v-for="permission in catalogue"
                        :key="permission.code"
                        v-model="roleForm.permissions"
                        :value="permission.code"
                        :label="permission.name"
                        hide-details
                        density="compact"
                    />
                    <v-alert v-if="dialogError" type="error" class="mt-3">
                        {{ dialogError }}
                    </v-alert>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn @click="roleDialog = false">Cancel</v-btn>
                    <v-btn color="primary" :loading="saving" @click="saveRole">Save</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <ConfirmDialog
            :model-value="!!roleToDelete"
            title="Delete role"
            :message="`Delete ${roleToDelete?.name ?? 'this role'}?`"
            confirm-text="Delete"
            confirm-color="error"
            :loading="saving"
            @cancel="roleToDelete = null"
            @confirm="deleteRole"
        />
    </v-container>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { ROLE_PERMISSIONS } from '~/components/access/roles.permissions'
import { useAccessStore } from '~/stores/access.store'
import type { AccessApiService } from '~/services/api/wrappers/access.api'
import type { AccessRole, RoleInput } from '~/types/access.types'
import ConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: ROLE_PERMISSIONS.READ },
})
const access = useAccessStore()
const api = useNuxtApp().$accessApi as AccessApiService
const organisationId = computed(() => access.actingOrganisationId)
const canReadRoles = computed(() => access.can(ROLE_PERMISSIONS.READ))
const canCreateRole = computed(() => access.can(ROLE_PERMISSIONS.WRITE))
const canUpdateRole = computed(() => access.can(ROLE_PERMISSIONS.WRITE))
const canDeleteRole = computed(() => access.can(ROLE_PERMISSIONS.DELETE))
const contextName = computed(
    () =>
        access.organisations.find((organisation) => organisation.id === organisationId.value)
            ?.name ?? 'Platform'
)
const roles = ref<AccessRole[]>([])
const catalogue = ref<{ code: string; name: string }[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const dialogError = ref('')
const roleDialog = ref(false)
const editingRoleId = ref<number>()
const roleToDelete = ref<AccessRole | null>(null)
const roleForm = reactive<RoleInput>({ name: '', code: '', isActive: true, permissions: [] })
const roleHeaders = [
    { title: 'Name', key: 'name' },
    { title: 'Type', key: 'isSystem' },
    { title: 'Permissions', key: 'permissions' },
    { title: 'Actions', key: 'actions', sortable: false },
]
let request = 0
function clear() {
    request++
    roles.value = []
    catalogue.value = []
    error.value = ''
    dialogError.value = ''
    roleDialog.value = false
    roleToDelete.value = null
    loading.value = saving.value = false
}
function message(cause: unknown) {
    const response = cause as {
        response?: { data?: { message?: string | string[] } }
        message?: string
    }
    const text = response?.response?.data?.message
    return Array.isArray(text)
        ? text.join(' ')
        : text || response?.message || 'Unable to save role.'
}
async function load() {
    const current = ++request
    error.value = ''
    const targetOrganisationId = organisationId.value
    if (!targetOrganisationId || !canReadRoles.value) {
        error.value = 'You do not have permission to view roles in this organisation.'
        return
    }
    loading.value = true
    try {
        const [r, p] = await Promise.all([
            api.roles(targetOrganisationId),
            api.permissions(targetOrganisationId),
        ])
        if (current !== request) return
        roles.value = r.data ?? []
        catalogue.value = p.data ?? []
    } catch (cause) {
        if (current === request) error.value = message(cause)
    } finally {
        if (current === request) loading.value = false
    }
}
function editRole(role?: AccessRole) {
    if (role ? !canUpdateRole.value : !canCreateRole.value) return
    editingRoleId.value = role?.id
    Object.assign(roleForm, {
        name: role?.name ?? '',
        code: role?.code ?? '',
        isActive: role?.isActive ?? true,
        permissions: [...(role?.permissions ?? [])],
    })
    dialogError.value = ''
    roleDialog.value = true
}
async function saveRole() {
    if (
        !organisationId.value ||
        (editingRoleId.value ? !canUpdateRole.value : !canCreateRole.value) ||
        saving.value
    )
        return
    const current = request
    saving.value = true
    dialogError.value = ''
    try {
        await api.saveRole(
            organisationId.value,
            { ...roleForm, permissions: [...roleForm.permissions] },
            editingRoleId.value
        )
        if (current !== request) return
        roleDialog.value = false
        saving.value = false
        await load()
    } catch (cause) {
        if (current === request) dialogError.value = message(cause)
    } finally {
        if (current === request) saving.value = false
    }
}
async function deleteRole() {
    if (!organisationId.value || !canDeleteRole.value || !roleToDelete.value || saving.value) return
    const current = request
    saving.value = true
    try {
        await api.deleteRole(organisationId.value, roleToDelete.value.id)
        if (current !== request) return
        roleToDelete.value = null
        saving.value = false
        await load()
    } catch (cause) {
        if (current === request) {
            error.value = message(cause)
            roleToDelete.value = null
        }
    } finally {
        if (current === request) saving.value = false
    }
}
watch(
    organisationId,
    () => {
        clear()
        void load()
    },
    { flush: 'sync' }
)
onBeforeUnmount(clear)
await load()
</script>
