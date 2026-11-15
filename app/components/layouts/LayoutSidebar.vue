<template>
    <v-navigation-drawer
        :model-value="modelValue"
        width="280"
        class="sidebar"
        @update:model-value="emit('update:modelValue', $event)"
    >
        <div class="logo-section d-flex align-center justify-center">
            <img src="/assets/images/logo.png" alt="Logo" class="sidebar-logo" />
        </div>

        <OrganisationSwitcher class="px-4 pt-4 pb-2" />

        <v-list nav density="compact" class="px-2" open-strategy="multiple">
            <template v-for="section in visibleSections" :key="section.key">
                <v-list-subheader class="nav-subheader mt-4">
                    {{ section.title }}
                </v-list-subheader>

                <template v-for="item in section.items" :key="item.key">
                    <v-list-group v-if="item.children?.length" :value="item.key">
                        <template #activator="{ props: activatorProps }">
                            <v-list-item
                                v-bind="activatorProps"
                                :prepend-icon="item.icon"
                                :title="item.title"
                                class="nav-item mb-1"
                                rounded="lg"
                            />
                        </template>

                        <v-list-item
                            v-for="child in item.children"
                            :key="child.key"
                            :prepend-icon="child.icon"
                            :title="child.title"
                            :to="child.to"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        />
                    </v-list-group>

                    <v-list-item
                        v-else
                        :prepend-icon="item.icon"
                        :title="item.title"
                        :to="item.to"
                        class="nav-item mb-1"
                        rounded="lg"
                    />
                </template>
            </template>
        </v-list>

        <template #append>
            <v-divider class="mx-4" />
            <div class="pa-4 d-flex align-center user-profile">
                <v-avatar size="40" class="user-avatar">
                    <v-img v-if="user" :src="userAvatar" alt="User" />
                    <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                    <div class="text-body-2 font-weight-medium">{{ userDisplayName }}</div>
                    <div class="text-caption text-medium-emphasis">{{ userRoleDisplay }}</div>
                </div>
                <v-menu>
                    <template #activator="{ props: activatorProps }">
                        <v-btn
                            v-bind="activatorProps"
                            icon
                            variant="text"
                            size="small"
                            aria-label="Logout options"
                        >
                            <v-icon size="small">mdi-logout</v-icon>
                        </v-btn>
                    </template>
                    <v-list density="compact" min-width="220">
                        <AuthLogoutMenuItems />
                    </v-list>
                </v-menu>
            </div>
        </template>
    </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import navigationConfig from '~/config/navigation.json'
import { useAccessStore } from '~/stores/access.store'
import { useAuthStore } from '~/stores/auth.store'
import AuthLogoutMenuItems from '~/components/auth/LogoutMenuItems.vue'
import OrganisationSwitcher from '~/components/access/OrganisationSwitcher.vue'

type PermissionMode = 'all' | 'any'
type NavigationContext = 'non-platform'

interface NavigationItem {
    key: string
    title: string
    icon: string
    to?: string
    permissions?: string[]
    permissionMode?: PermissionMode
    allowAcrossOrganisations?: boolean
    context?: NavigationContext
    children?: NavigationItem[]
}

interface NavigationSection {
    key: string
    title: string
    items: NavigationItem[]
}

interface NavigationConfiguration {
    sections: NavigationSection[]
}

interface Props {
    modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const configuration = navigationConfig as NavigationConfiguration
const authStore = useAuthStore()
const access = useAccessStore()

const user = computed(() => authStore.user)
const userDisplayName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : 'Guest'
)
const userRoleDisplay = computed(() => {
    const displayName = access.identity?.role?.displayName
    if (displayName) return displayName

    const roleName = access.identity?.role?.name
    return roleName
        ? roleName.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
        : 'User'
})
const userAvatar = computed(() => 'https://i.pravatar.cc/150?img=12')

const canAccessPermission = (permission: string, allowAcrossOrganisations: boolean): boolean =>
    access.can(permission) ||
    (allowAcrossOrganisations &&
        access.isPlatformContext &&
        access.canAcrossOrganisations(permission))

const isVisibleInContext = (context?: NavigationContext): boolean =>
    context !== 'non-platform' || !access.isPlatformContext

const hasRequiredPermissions = (item: NavigationItem): boolean => {
    if (!item.permissions?.length) return true

    const matches = item.permissions.map((permission) =>
        canAccessPermission(permission, item.allowAcrossOrganisations === true)
    )
    return item.permissionMode === 'any' ? matches.some(Boolean) : matches.every(Boolean)
}

const filterNavigationItem = (item: NavigationItem): NavigationItem | null => {
    if (!isVisibleInContext(item.context) || !hasRequiredPermissions(item)) return null

    if (!item.children?.length) return item

    const children = item.children
        .map(filterNavigationItem)
        .filter((child): child is NavigationItem => child !== null)
    return children.length ? { ...item, children } : null
}

const visibleSections = computed<NavigationSection[]>(() =>
    configuration.sections
        .map((section) => ({
            ...section,
            items: section.items
                .map(filterNavigationItem)
                .filter((item): item is NavigationItem => item !== null),
        }))
        .filter((section) => section.items.length > 0)
)
</script>

<style scoped>
.sidebar {
    border-right: 1px solid rgb(var(--v-theme-on-surface) / 0.08) !important;
}

.logo-section {
    min-height: 80px;
    padding: 12px;
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-accent)) 100%);
}

.sidebar-logo {
    width: auto;
    height: 40px;
    object-fit: contain;
    filter: brightness(0) invert(1);
}

.nav-subheader {
    padding-left: 16px !important;
    color: rgb(var(--v-theme-on-surface) / 0.5) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    letter-spacing: 1px;
}

.nav-item {
    margin-bottom: 2px;
    color: rgb(var(--v-theme-on-surface) / 0.7) !important;
    transition: color 0.2s ease;
}

:deep(.nav-item) {
    gap: 16px !important;
    padding: 0 16px 0 24px !important;
}

:deep(.nav-item .v-list-item-title) {
    font-size: 15px !important;
    font-weight: 500;
}

:deep(.nav-item .v-list-item__prepend) {
    width: auto !important;
    margin-inline-end: 0 !important;
}

:deep(.nav-item .v-list-item__spacer) {
    display: none !important;
}

.nav-item:hover,
:deep(.nav-item:hover .v-icon) {
    color: rgb(var(--v-theme-primary)) !important;
}

:deep(.nav-item.v-list-item--active) {
    color: rgb(var(--v-theme-on-primary)) !important;
    background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-accent)) 100%) !important;
}

:deep(.nav-item.v-list-item--active .v-icon) {
    color: rgb(var(--v-theme-on-primary)) !important;
}

:deep(.submenu-item) {
    min-height: 38px !important;
    padding-left: 24px !important;
}

:deep(.submenu-item .v-list-item-title) {
    font-size: 14px !important;
    font-weight: 400;
}

:deep(.submenu-item.v-list-item--active) {
    color: rgb(var(--v-theme-primary)) !important;
    background: transparent !important;
}

:deep(.submenu-item.v-list-item--active .v-icon) {
    color: rgb(var(--v-theme-primary)) !important;
}

.user-profile {
    margin: 0 8px 8px;
    border-radius: 12px;
    transition: background 0.2s ease;
}

.user-profile:hover {
    background: rgb(var(--v-theme-primary) / 0.08);
}

.user-avatar {
    border: 2px solid rgb(var(--v-theme-primary) / 0.3);
}
</style>
