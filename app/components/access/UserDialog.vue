<template>
    <v-dialog
        :model-value="modelValue"
        max-width="720"
        scrollable
        :persistent="saving"
        @update:model-value="close"
    >
        <v-card rounded="lg">
            <v-card-title class="d-flex align-center justify-space-between px-6 pt-5 pb-2">
                <span class="text-h6">{{ userId ? 'Edit user' : 'Create user' }}</span>
                <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    aria-label="Close user form"
                    :disabled="saving"
                    @click="close"
                />
            </v-card-title>
            <v-card-text class="px-6 pt-3 pb-2">
                <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />
                <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">
                    {{ error }}
                </v-alert>
                <v-form
                    v-if="options && !loading"
                    id="managed-user-form"
                    ref="formRef"
                    :disabled="saving"
                    @submit.prevent="save"
                >
                    <v-row dense>
                        <v-col cols="12" sm="6" class="pb-3">
                            <label for="user-first-name" class="field-label">First name</label>
                            <v-text-field
                                id="user-first-name"
                                v-model="form.firstName"
                                autocomplete="given-name"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="[required]"
                                maxlength="50"
                            />
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-3">
                            <label for="user-last-name" class="field-label">Last name</label>
                            <v-text-field
                                id="user-last-name"
                                v-model="form.lastName"
                                autocomplete="family-name"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="[required]"
                                maxlength="50"
                            />
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-3">
                            <label for="user-email" class="field-label">Email</label>
                            <v-text-field
                                id="user-email"
                                v-model="form.email"
                                type="email"
                                autocomplete="email"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="[required, emailRule]"
                                maxlength="100"
                            />
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-3">
                            <label for="user-phone" class="field-label">Phone number</label>
                            <v-text-field
                                id="user-phone"
                                v-model="form.phoneNumber"
                                type="tel"
                                autocomplete="tel"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="[required]"
                                maxlength="15"
                            />
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-3">
                            <label for="user-password" class="field-label">Password</label>
                            <v-text-field
                                id="user-password"
                                v-model="form.password"
                                type="password"
                                autocomplete="new-password"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="[passwordRule]"
                                :hint="
                                    userId
                                        ? 'Leave blank to keep the current password.'
                                        : 'At least 8 characters.'
                                "
                                persistent-hint
                            />
                        </v-col>
                        <v-col cols="12" sm="6" class="pb-3">
                            <label for="user-confirm-password" class="field-label">
                                Confirm password
                            </label>
                            <v-text-field
                                id="user-confirm-password"
                                v-model="form.confirmPassword"
                                type="password"
                                autocomplete="new-password"
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                                :rules="[confirmPasswordRule]"
                            />
                        </v-col>
                    </v-row>

                    <div v-if="userId" class="border rounded pa-3 mt-1 text-body-2">
                        System role:
                        <span class="font-weight-medium">
                            {{ SYSTEM_ROLE_LABELS[form.systemRole] }}
                        </span>
                    </div>
                    <v-select
                        v-else
                        v-model="form.systemRole"
                        :items="systemRoleOptions"
                        label="System role"
                        variant="outlined"
                        density="compact"
                        hide-details="auto"
                        class="mt-1"
                        :rules="[required]"
                    />

                    <section v-if="options.canAssignRoles && acceptsGrants" class="mt-5">
                        <v-switch
                            v-model="form.assignmentActive"
                            label="Access to this organisation"
                            density="compact"
                            color="primary"
                            hide-details
                            class="mb-3"
                        />
                        <h2 class="text-body-2 font-weight-medium">Custom roles</h2>
                        <p class="text-caption text-medium-emphasis mt-1 mb-2">
                            Roles give this user permissions in {{ contextName }}.
                        </p>
                        <div class="border rounded">
                            <div
                                v-for="role in customRoles"
                                :key="role.id"
                                class="role-option px-3 py-1"
                            >
                                <v-checkbox
                                    v-model="form.roleIds"
                                    :value="role.id"
                                    :label="role.name"
                                    :disabled="!role.isActive && !form.roleIds.includes(role.id)"
                                    density="compact"
                                    color="primary"
                                    hide-details
                                />
                                <p class="text-caption text-medium-emphasis role-description pb-2">
                                    {{
                                        role.isActive
                                            ? role.permissions.length + ' permissions'
                                            : 'Inactive role'
                                    }}
                                </p>
                            </div>
                            <p
                                v-if="!customRoles.length"
                                class="pa-3 text-body-2 text-medium-emphasis"
                            >
                                No custom roles have been created here yet.
                            </p>
                        </div>
                    </section>

                    <section
                        v-if="
                            options.canAssignOrganisations &&
                            form.systemRole === SYSTEM_ROLE.PLATFORM_USER
                        "
                        class="mt-5"
                    >
                        <h2 class="text-body-2 font-weight-medium">Assigned organisations</h2>
                        <p class="text-caption text-medium-emphasis mt-1 mb-2">
                            Select the organisations this user can open. Choose their permissions
                            separately for each organisation.
                        </p>
                        <div class="border rounded pa-2">
                            <v-row dense>
                                <v-col
                                    v-for="organisation in options.organisations"
                                    :key="organisation.id"
                                    cols="12"
                                    sm="6"
                                >
                                    <v-checkbox
                                        v-model="selectedOrganisationIds"
                                        :value="organisation.id"
                                        :label="organisation.name"
                                        density="compact"
                                        color="primary"
                                        hide-details
                                    />
                                </v-col>
                            </v-row>
                            <p
                                v-if="!options.organisations.length"
                                class="pa-2 text-body-2 text-medium-emphasis"
                            >
                                No organisations are available.
                            </p>
                        </div>
                        <div
                            v-for="organisation in selectedOrganisations"
                            :key="organisation.id"
                            class="border rounded pa-3 mt-3"
                        >
                            <div class="d-flex align-center justify-space-between ga-3 mb-2">
                                <h3 class="text-body-2 font-weight-medium">{{ organisation.name }}</h3>
                                <v-switch
                                    v-model="organisationGrants[organisation.id]!.isActive"
                                    label="Access active"
                                    density="compact"
                                    color="primary"
                                    hide-details
                                    class="flex-grow-0"
                                />
                            </div>
                            <v-select
                                v-model="organisationGrants[organisation.id]!.roleIds"
                                :items="organisation.roles.filter((role) => !role.isSystem)"
                                :item-props="
                                    (role) => ({
                                        disabled:
                                            !role.isActive &&
                                            !organisationGrants[organisation.id]!.roleIds.includes(role.id),
                                    })
                                "
                                item-title="name"
                                item-value="id"
                                label="Organisation roles"
                                multiple
                                chips
                                closable-chips
                                variant="outlined"
                                density="compact"
                                hide-details="auto"
                            />
                            <p
                                v-if="!organisationGrants[organisation.id]!.roleIds.length"
                                class="text-caption text-medium-emphasis mt-2"
                            >
                                Without a role, this user has no permissions in this organisation.
                            </p>
                        </div>
                    </section>
                </v-form>
            </v-card-text>
            <v-card-actions class="px-6 py-5 ga-2">
                <v-spacer />
                <v-btn
                    variant="outlined"
                    prepend-icon="mdi-close"
                    :disabled="saving"
                    @click="close"
                >
                    Cancel
                </v-btn>
                <v-btn
                    type="submit"
                    form="managed-user-form"
                    color="primary"
                    variant="flat"
                    prepend-icon="mdi-check"
                    :loading="saving"
                    :disabled="loading || !options"
                >
                    {{ userId ? 'Save' : 'Create user' }}
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { SYSTEM_ROLE } from '~/constants/access.constants'

import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { AccessApiService } from '~/services/api/wrappers/access.api'
import { SYSTEM_ROLE_LABELS } from '~/types/access.types'
import type {
    CreateManagedUser,
    SystemRole,
    UpdateManagedUser,
    UserOrganisationAssignment,
    UserManagementOptions,
} from '~/types/access.types'

const props = defineProps<{
    modelValue: boolean
    organisationId: number
    contextName: string
    userId?: number
}>()
const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    saved: []
}>()
const api = useNuxtApp().$accessApi as AccessApiService
const formRef = ref<{ validate: () => Promise<{ valid: boolean }>; resetValidation: () => void }>()
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const options = ref<UserManagementOptions | null>(null)
const selectedOrganisationIds = ref<number[]>([])
const organisationGrants = reactive<Record<number, UserOrganisationAssignment>>({})
const emptyForm = () => ({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    systemRole: SYSTEM_ROLE.PLATFORM_USER as SystemRole,
    assignmentActive: true,
    roleIds: [] as number[],
})
const form = reactive(emptyForm())
let revision = 0
const customRoles = computed(() => options.value?.roles.filter((role) => !role.isSystem) ?? [])
const selectedOrganisations = computed(
    () =>
        options.value?.organisations.filter((organisation) => selectedOrganisationIds.value.includes(organisation.id)) ?? []
)
const acceptsGrants = computed(
    () =>
        form.systemRole === SYSTEM_ROLE.PLATFORM_USER ||
        form.systemRole === SYSTEM_ROLE.ORGANISATION_TEAM_USER
)
const systemRoleOptions = computed(
    () =>
        options.value?.systemRoles.map((value) => ({ title: SYSTEM_ROLE_LABELS[value], value })) ??
        []
)
const required = (value: unknown) =>
    (typeof value === 'string' ? !!value.trim() : !!value) || 'This field is required.'
const emailRule = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Enter a valid email address.'
const passwordRule = (value: string) => {
    if (props.userId && !value) return true
    if (value.length < 8) return 'Use at least 8 characters.'
    return new TextEncoder().encode(value).length <= 72 || 'Use a password of at most 72 bytes.'
}
const confirmPasswordRule = (value: string) => value === form.password || 'Passwords do not match.'

function errorMessage(value: unknown) {
    const response = value as {
        response?: { data?: { message?: string | string[] } }
        message?: string
    }
    const message = response?.response?.data?.message
    return Array.isArray(message)
        ? message.join(' ')
        : message || response?.message || 'Unable to save user.'
}
function close() {
    if (!saving.value) emit('update:modelValue', false)
}
async function load() {
    const current = ++revision
    options.value = null
    error.value = ''
    saving.value = false
    loading.value = props.modelValue
    Object.assign(form, emptyForm())
    selectedOrganisationIds.value = []
    for (const key of Object.keys(organisationGrants)) delete organisationGrants[Number(key)]
    formRef.value?.resetValidation()
    if (!props.modelValue) return
    try {
        const [optionsResponse, userResponse] = await Promise.all([
            api.userOptions(props.organisationId),
            props.userId ? api.managedUser(props.organisationId, props.userId) : Promise.resolve(null),
        ])
        if (current !== revision) return
        if (!optionsResponse.data) throw new Error('User options could not be loaded.')
        const user = userResponse?.data
        if (props.userId && (!user || !user.canEdit))
            throw new Error('You no longer have permission to edit this user.')
        options.value = optionsResponse.data
        if (user) {
            Object.assign(form, {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                systemRole: user.systemRole,
                roleIds: [...user.roleIds],
                assignmentActive: user.assignmentActive,
            })
        } else {
            const preferred = options.value.systemRoles.find(
                (role) =>
                    role === SYSTEM_ROLE.PLATFORM_USER ||
                    role === SYSTEM_ROLE.ORGANISATION_TEAM_USER
            )
            form.systemRole = preferred ?? options.value.systemRoles[0] ?? SYSTEM_ROLE.PLATFORM_USER
        }
        for (const organisation of options.value.organisations) {
            const grant = user?.organisationAssignments.find((item) => item.organisationId === organisation.id)
            organisationGrants[organisation.id] = {
                organisationId: organisation.id,
                roleIds: grant ? [...grant.roleIds] : [],
                isActive: grant?.isActive ?? true,
            }
        }
        selectedOrganisationIds.value =
            user?.organisationAssignments
                .filter((grant) => !!organisationGrants[grant.organisationId])
                .map((grant) => grant.organisationId) ?? []
    } catch (value) {
        if (current === revision) {
            options.value = null
            error.value = errorMessage(value)
        }
    } finally {
        if (current === revision) loading.value = false
    }
}
async function save() {
    if (saving.value || loading.value || !options.value) return
    const current = revision
    const validation = await formRef.value?.validate()
    if (!validation?.valid || current !== revision) return
    const organisationId = props.organisationId
    const userId = props.userId
    saving.value = true
    error.value = ''
    const data: UpdateManagedUser = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
    }
    if (form.password) {
        data.password = form.password
        data.confirmPassword = form.confirmPassword
    }
    if (options.value.canAssignRoles && acceptsGrants.value) {
        data.roleIds = [...form.roleIds]
        data.assignmentActive = form.assignmentActive
    }
    if (options.value.canAssignOrganisations && form.systemRole === SYSTEM_ROLE.PLATFORM_USER) {
        data.organisationAssignments = selectedOrganisationIds.value.map((id) => ({
            ...organisationGrants[id]!,
            roleIds: [...organisationGrants[id]!.roleIds],
        }))
    }
    try {
        if (userId) await api.updateManagedUser(organisationId, userId, data)
        else
            await api.createManagedUser(organisationId, {
                ...data,
                password: form.password,
                confirmPassword: form.confirmPassword,
                systemRole: form.systemRole,
            } as CreateManagedUser)
        if (current !== revision) return
        emit('saved')
        emit('update:modelValue', false)
    } catch (value) {
        if (current === revision) error.value = errorMessage(value)
    } finally {
        if (current === revision) saving.value = false
    }
}
watch(() => [props.modelValue, props.organisationId, props.userId], load, { immediate: true })
onBeforeUnmount(() => {
    revision++
})
</script>

<style scoped>
.field-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 6px;
}
.role-option + .role-option {
    border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.role-description {
    padding-left: 40px;
}
</style>
