<template>
    <v-navigation-drawer
        :model-value="modelValue"
        @update:model-value="$emit('update:modelValue', $event)"
        width="280"
        class="sidebar"
    >
        <!-- Logo Section: Logo with wine color background -->
        <div class="logo-section-2 d-flex align-center justify-center">
            <div class="logo-wine-bg">
                <img src="/assets/images/logo.png" alt="Logo" class="sidebar-logo" />
            </div>
        </div>

        <OrganisationSwitcher class="px-4 pt-4 pb-2" />

        <!-- Navigation Menu -->
        <v-list density="compact" nav class="px-2">
            <v-list-subheader class="nav-subheader">MAIN</v-list-subheader>

            <v-list-item
                v-for="item in mainMenu"
                :key="item.value"
                :prepend-icon="item.icon"
                :title="item.title"
                :value="item.value"
                :to="item.to"
                class="nav-item mb-1"
                rounded="lg"
            ></v-list-item>

            <v-list-item
                v-if="canManageUsers"
                to="/users"
                title="Users"
                prepend-icon="mdi-account-group-outline"
                class="nav-item mb-1"
                rounded="lg"
            />
            <v-list-item
                v-if="access.can(ROLE_PERMISSIONS.READ)"
                to="/access"
                title="Roles & permissions"
                prepend-icon="mdi-account-key"
                class="nav-item mb-1"
                rounded="lg"
            />
            <v-list-subheader class="nav-subheader mt-4">ECOMMERCE</v-list-subheader>

            <v-list-item
                v-if="productsSubmenu.some((item) => access.can(item.permission))"
                prepend-icon="mdi-shopping"
                title="Products"
                value="products"
                class="nav-item mb-1"
                rounded="lg"
                :active="isProductsActive"
                @click="productsExpanded = !productsExpanded"
            >
                <template v-slot:append>
                    <v-icon
                        size="small"
                        class="chevron-icon"
                        :class="{ rotated: productsExpanded }"
                    >
                        mdi-chevron-down
                    </v-icon>
                </template>
            </v-list-item>

            <v-expand-transition>
                <div v-show="productsExpanded" class="submenu-wrapper">
                    <v-list density="compact" class="submenu">
                        <v-list-item
                            v-for="item in productsSubmenu.filter((item) =>
                                access.can(item.permission)
                            )"
                            :key="item.value"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            :value="item.value"
                            :to="item.to"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        ></v-list-item>
                    </v-list>
                </div>
            </v-expand-transition>

            <v-list-item
                v-if="access.can(ORGANISATION_PERMISSIONS.READ)"
                prepend-icon="mdi-office-building"
                title="Organisations"
                value="organisations"
                class="nav-item mb-1"
                rounded="lg"
                :active="isOrganisationsActive"
                @click="organisationsExpanded = !organisationsExpanded"
            >
                <template v-slot:append>
                    <v-icon
                        size="small"
                        class="chevron-icon"
                        :class="{ rotated: organisationsExpanded }"
                    >
                        mdi-chevron-down
                    </v-icon>
                </template>
            </v-list-item>

            <v-expand-transition>
                <div v-show="organisationsExpanded" class="submenu-wrapper">
                    <v-list density="compact" class="submenu">
                        <v-list-item
                            v-for="item in organisationsSubmenu"
                            :key="item.value"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            :value="item.value"
                            :to="item.to"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        ></v-list-item>
                        <v-list-item
                            v-if="canReadOrganisationProducts"
                            to="/organisations/organisation-products"
                            title="Organisation products"
                            prepend-icon="mdi-circle-small"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        />
                    </v-list>
                </div>
            </v-expand-transition>

            <v-list-item
                v-if="canReadOrders"
                prepend-icon="mdi-cart"
                title="Orders"
                value="orders"
                to="/orders"
                class="nav-item mb-1"
                rounded="lg"
            ></v-list-item>
            <v-list-item
                v-if="canReadCustomers"
                prepend-icon="mdi-account-group"
                title="Customers"
                value="customers"
                to="/customers"
                class="nav-item mb-1"
                rounded="lg"
            ></v-list-item>
            <v-list-item
                v-if="canReadOrganisationMemberships"
                prepend-icon="mdi-card-account-details-star"
                title="Memberships"
                value="memberships"
                to="/memberships"
                class="nav-item mb-1"
                rounded="lg"
            />
            <v-list-item
                v-if="canReadPlatformMemberships"
                prepend-icon="mdi-shield-star"
                title="Platform Services"
                value="platform-memberships"
                to="/memberships/platform"
                class="nav-item mb-1"
                rounded="lg"
            />
            <v-list-item
                v-if="canReadOwnPlatformServices"
                prepend-icon="mdi-shield-check"
                title="My Platform Services"
                value="my-platform-services"
                to="/platform-services"
                class="nav-item mb-1"
                rounded="lg"
            />
            <v-list-item
                v-if="canReadCustomerSubscriptions"
                prepend-icon="mdi-account-star"
                title="Customer Subscriptions"
                value="customer-subscriptions"
                to="/subscriptions/customers"
                class="nav-item mb-1"
                rounded="lg"
            />
            <v-list-item
                v-if="canReadSubscriptionOrders"
                prepend-icon="mdi-receipt-text-clock"
                title="Subscription Orders"
                value="subscription-orders"
                to="/subscriptions/orders"
                class="nav-item mb-1"
                rounded="lg"
            />

            <v-list-subheader class="nav-subheader mt-4">SYSTEM</v-list-subheader>

            <v-list-item
                v-if="canReadLocations"
                prepend-icon="mdi-map-marker"
                title="Locations"
                value="locations"
                to="/locations"
                class="nav-item mb-1"
                rounded="lg"
            ></v-list-item>

            <v-list-subheader class="nav-subheader mt-4">INTEGRATIONS</v-list-subheader>

            <v-list-item
                prepend-icon="mdi-calculator"
                title="QuickBooks"
                value="quickbooks"
                class="nav-item mb-1"
                rounded="lg"
                :active="isQuickBooksActive"
                @click="quickbooksExpanded = !quickbooksExpanded"
            >
                <template v-slot:append>
                    <v-icon
                        size="small"
                        class="chevron-icon"
                        :class="{ rotated: quickbooksExpanded }"
                    >
                        mdi-chevron-down
                    </v-icon>
                </template>
            </v-list-item>

            <v-expand-transition>
                <div v-show="quickbooksExpanded" class="submenu-wrapper">
                    <v-list density="compact" class="submenu">
                        <v-list-item
                            v-for="item in quickbooksSubmenu"
                            :key="item.value"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            :value="item.value"
                            :to="item.to"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        ></v-list-item>
                    </v-list>
                </div>
            </v-expand-transition>

            <v-list-item
                prepend-icon="mdi-sync"
                title="Square Sync"
                value="square-sync"
                class="nav-item mb-1"
                rounded="lg"
                :active="isSquareSyncActive"
                @click="squareSyncExpanded = !squareSyncExpanded"
            >
                <template v-slot:append>
                    <v-icon
                        size="small"
                        class="chevron-icon"
                        :class="{ rotated: squareSyncExpanded }"
                    >
                        mdi-chevron-down
                    </v-icon>
                </template>
            </v-list-item>

            <v-expand-transition>
                <div v-show="squareSyncExpanded" class="submenu-wrapper">
                    <v-list density="compact" class="submenu">
                        <v-list-item
                            v-for="item in squareSyncSubmenu"
                            :key="item.value"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            :value="item.value"
                            :to="item.to"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        ></v-list-item>
                    </v-list>
                </div>
            </v-expand-transition>

            <v-list-item
                prepend-icon="mdi-truck"
                title="ShipStation"
                value="shipstation"
                to="/integrations/shipstation"
                class="nav-item mb-1"
                rounded="lg"
            ></v-list-item>

            <v-list-item
                prepend-icon="mdi-wine"
                title="Corksy"
                value="corksy"
                class="nav-item mb-1"
                rounded="lg"
                :active="isCorksyActive"
                @click="corksyExpanded = !corksyExpanded"
            >
                <template v-slot:append>
                    <v-icon size="small" class="chevron-icon" :class="{ rotated: corksyExpanded }">
                        mdi-chevron-down
                    </v-icon>
                </template>
            </v-list-item>

            <v-expand-transition>
                <div v-show="corksyExpanded" class="submenu-wrapper">
                    <v-list density="compact" class="submenu">
                        <v-list-item
                            v-for="item in corksySubmenu"
                            :key="item.value"
                            :prepend-icon="item.icon"
                            :title="item.title"
                            :value="item.value"
                            :to="item.to"
                            class="nav-item submenu-item mb-1"
                            rounded="lg"
                        ></v-list-item>
                    </v-list>
                </div>
            </v-expand-transition>

            <v-list-item
                prepend-icon="mdi-credit-card"
                title="Authorize.net"
                value="authorize-net"
                to="/integrations/authorize-net"
                class="nav-item mb-1"
                rounded="lg"
            ></v-list-item>
        </v-list>

        <!-- User Profile -->
        <template v-slot:append>
            <v-divider class="mx-4"></v-divider>
            <div class="pa-4 d-flex align-center user-profile">
                <v-avatar size="40" class="user-avatar">
                    <v-img v-if="user" :src="userAvatar" alt="User"></v-img>
                    <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
                <div class="ml-3 flex-grow-1">
                    <div class="text-body-2 font-weight-medium">{{ userDisplayName }}</div>
                    <div class="text-caption text-medium-emphasis">{{ userRoleDisplay }}</div>
                </div>
                <v-menu>
                    <template #activator="{ props }">
                        <v-btn
                            v-bind="props"
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
import { PRODUCT_PERMISSIONS } from '~/components/products/products.permissions'
import { USER_PERMISSIONS } from '~/components/access/users.permissions'
import { ROLE_PERMISSIONS } from '~/components/access/roles.permissions'
import { ORGANISATION_PRODUCT_PERMISSIONS } from '~/components/organisation-products/organisation-products.permissions'
import { CATEGORY_PERMISSIONS } from '~/components/categories/category.permissions'
import { ORGANISATION_PERMISSIONS } from '~/components/organisations/organisation.permissions'
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions'
import { LOCATION_PERMISSIONS } from '~/components/locations/location.permissions'
import {
    CUSTOMER_ORDER_PERMISSIONS,
    PROCUREMENT_ORDER_PERMISSIONS,
} from '~/components/orders/order.permissions'
import {
    CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
    ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS,
    ORGANISATION_MEMBERSHIP_PERMISSIONS,
    PLATFORM_MEMBERSHIP_PERMISSIONS,
} from '~/components/memberships/membership.permissions'

import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'
import { useAccessStore } from '~/stores/access.store'
import AuthLogoutMenuItems from '~/components/auth/LogoutMenuItems.vue'
import OrganisationSwitcher from '~/components/access/OrganisationSwitcher.vue'

interface Props {
    modelValue: boolean
}

defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
}>()

const route = useRoute()
const authStore = useAuthStore()
const access = useAccessStore()
const canManageUsers = computed(
    () =>
        access.can(USER_PERMISSIONS.READ) ||
        (access.isPlatformContext && access.canAcrossOrganisations(USER_PERMISSIONS.READ))
)
const canReadOrganisationProducts = computed(() =>
    access.isPlatformContext
        ? access.canAcrossOrganisations(ORGANISATION_PRODUCT_PERMISSIONS.READ)
        : access.can(ORGANISATION_PRODUCT_PERMISSIONS.READ)
)
const canRead = (permission: string) =>
    access.can(permission) ||
    (access.isPlatformContext && access.canAcrossOrganisations(permission))
const canReadCustomers = computed(() => canRead(CUSTOMER_PERMISSIONS.READ))
const canReadLocations = computed(() => canRead(LOCATION_PERMISSIONS.READ))
const canReadOrders = computed(
    () => canRead(CUSTOMER_ORDER_PERMISSIONS.READ) || canRead(PROCUREMENT_ORDER_PERMISSIONS.READ)
)
const canReadOrganisationMemberships = computed(() =>
    canRead(ORGANISATION_MEMBERSHIP_PERMISSIONS.READ)
)
const canReadPlatformMemberships = computed(() => access.can(PLATFORM_MEMBERSHIP_PERMISSIONS.READ))
const canReadCustomerSubscriptions = computed(() =>
    canRead(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ)
)
const canReadSubscriptionOrders = computed(
    () =>
        canRead(CUSTOMER_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ) ||
        canRead(ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ)
)
const canReadOwnPlatformServices = computed(
    () =>
        access.actingOrganisationId !== access.platformOrganisationId &&
        access.can(
            ORGANISATION_MEMBERSHIP_SUBSCRIPTION_PERMISSIONS.READ,
            access.actingOrganisationId
        )
)
const productsExpanded = ref(false)
const organisationsExpanded = ref(false)
const quickbooksExpanded = ref(false)
const squareExpanded = ref(false)
const squareSyncExpanded = ref(false)
const corksyExpanded = ref(false)

const user = computed(() => authStore.user)
const userDisplayName = computed(() => {
    if (user.value) {
        return `${user.value.firstName} ${user.value.lastName}`
    }
    return 'Guest'
})

const userRoleDisplay = computed(() => {
    if (access.identity?.role?.displayName) {
        return access.identity.role.displayName
    }
    if (access.identity?.role?.name) {
        return access.identity.role.name
            .replace('_', ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
    }
    return 'User'
})

const userAvatar = computed(() => {
    // You can add user avatar URL from user object if available
    return 'https://i.pravatar.cc/150?img=12'
})

const isProductsActive = computed(() => {
    // const productRoutes = ['/products', '/categories']
    return (
        route.path.startsWith('/products') ||
        route.path.startsWith('/categories') ||
        productsExpanded.value
    )
})

const isOrganisationsActive = computed(() => {
    // return route.path.startsWith('/organisations')
    return organisationsExpanded.value || route.path.startsWith('/organisations')
})

const isQuickBooksActive = computed(() => {
    return quickbooksExpanded.value || route.path.startsWith('/integrations/quickbooks')
})

const isSquareSyncActive = computed(() => {
    return squareSyncExpanded.value || route.path.startsWith('/integrations/square-import')
})

const isCorksyActive = computed(() => {
    return corksyExpanded.value || route.path.startsWith('/integrations/corksy')
})

const mainMenu = [
    { icon: 'mdi-view-dashboard', title: 'Dashboard', value: 'dashboard', to: '/dashboard' },
]

const productsSubmenu = [
    {
        icon: 'mdi-circle-small',
        title: 'Product List',
        value: 'product-list',
        to: '/products',
        permission: PRODUCT_PERMISSIONS.READ,
    },
    // Add Product is now handled via dialog, not a separate page
    {
        icon: 'mdi-circle-small',
        title: 'Categories',
        value: 'categories',
        to: '/categories',
        permission: CATEGORY_PERMISSIONS.READ,
    },
]

const organisationsSubmenu = [
    {
        icon: 'mdi-circle-small',
        title: 'Organisation List',
        value: 'organisation-list',
        to: '/organisations',
    },
]

const quickbooksSubmenu = [
    {
        icon: 'mdi-circle-small',
        title: 'Overview',
        value: 'qb-overview',
        to: '/integrations/quickbooks',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Customers',
        value: 'qb-customers',
        to: '/integrations/quickbooks/customers',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Products',
        value: 'qb-products',
        to: '/integrations/quickbooks/products',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Categories',
        value: 'qb-categories',
        to: '/integrations/quickbooks/categories',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Orders',
        value: 'qb-orders',
        to: '/integrations/quickbooks/orders',
    },
]

const squareSubmenu = [
    {
        icon: 'mdi-circle-small',
        title: 'Overview',
        value: 'square-overview',
        to: '/integrations/square',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Customers',
        value: 'square-customers',
        to: '/integrations/square/customers',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Products',
        value: 'square-products',
        to: '/integrations/square/products',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Categories',
        value: 'square-categories',
        to: '/integrations/square/categories',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Orders',
        value: 'square-orders',
        to: '/integrations/square/orders',
    },
]

const squareSyncSubmenu = [
    {
        icon: 'mdi-circle-small',
        title: 'Locations',
        value: 'square-sync-locations',
        to: '/integrations/square-import/locations',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Categories',
        value: 'square-sync-categories',
        to: '/integrations/square-import/categories',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Products',
        value: 'square-sync-products',
        to: '/integrations/square-import/products',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Customers (All)',
        value: 'square-sync-customers-all',
        to: '/integrations/square-import/customers',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Customers (Search)',
        value: 'square-sync-customers-search',
        to: '/integrations/square-import/customers/search',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Inventory',
        value: 'square-sync-inventory',
        to: '/integrations/square-import/inventory',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Transactions',
        value: 'square-sync-transactions',
        to: '/integrations/square-import/transactions',
    },
]

const corksySubmenu = [
    {
        icon: 'mdi-circle-small',
        title: 'Overview',
        value: 'corksy-overview',
        to: '/integrations/corksy',
    },
    {
        icon: 'mdi-circle-small',
        title: 'Orders',
        value: 'corksy-orders',
        to: '/integrations/corksy/orders',
    },
]
</script>

<style scoped>
.sidebar {
    border-right: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.sidebar-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
}

/* Logo Section: Logo with wine color background */
.logo-section-2 {
    background: linear-gradient(135deg, #9b2335 0%, #be3455 100%);
    padding: 12px !important;
    min-height: 80px;
}

.logo-wine-bg {
    display: flex;
    align-items: center;
    justify-content: center;
}

.logo-wine-bg .sidebar-logo {
    filter: brightness(0) invert(1);
}

.nav-subheader {
    color: rgba(0, 0, 0, 0.5) !important;
    font-size: 11px !important;
    font-weight: 600 !important;
    letter-spacing: 1px;
    padding-left: 16px !important;
}

.nav-item {
    color: rgba(0, 0, 0, 0.7) !important;
    margin-bottom: 2px;
    transition: color 0.2s ease;
}

:deep(.nav-item .v-list-item-title) {
    font-size: 15px !important;
    font-weight: 500;
}

/* Gap between icon and text */
:deep(.nav-item) {
    padding: 0 16px 0 24px !important;
    gap: 16px !important;
}

:deep(.nav-item .v-list-item__prepend) {
    width: auto !important;
    margin-inline-end: 0 !important;
}

:deep(.nav-item .v-list-item__spacer) {
    display: none !important;
}

:deep(.submenu .nav-item) {
    min-height: 38px !important;
    padding-left: 24px !important;
}

.nav-item:hover {
    background: transparent !important;
    color: #9b2335 !important;
}

:deep(.nav-item:hover .v-icon) {
    color: #9b2335 !important;
}

:deep(.nav-item.v-list-item--active) {
    background: linear-gradient(135deg, #9b2335 0%, #be3455 100%) !important;
    color: #fff !important;
}

:deep(.nav-item.v-list-item--active .v-icon) {
    color: #fff !important;
}

.chevron-icon {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: rgba(0, 0, 0, 0.5);
    will-change: transform;
}

.chevron-icon.rotated {
    transform: rotate(-180deg);
}

/* Smooth expand transition */
:deep(.v-expand-transition) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.v-expand-transition-enter-active),
:deep(.v-expand-transition-leave-active) {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    overflow: hidden;
}

:deep(.v-expand-transition-enter-from),
:deep(.v-expand-transition-leave-to) {
    opacity: 0;
    max-height: 0 !important;
}

:deep(.v-expand-transition-enter-to),
:deep(.v-expand-transition-leave-from) {
    opacity: 1;
    max-height: 500px !important;
}

.submenu-wrapper {
    overflow: hidden;
}

.submenu {
    overflow: visible;
}

.submenu-item {
    opacity: 0;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.submenu-item:nth-child(1) {
    animation-delay: 0.05s;
}

.submenu-item:nth-child(2) {
    animation-delay: 0.1s;
}

.submenu-item:nth-child(3) {
    animation-delay: 0.15s;
}

:deep(.submenu-item .v-list-item-title) {
    font-size: 14px !important;
    font-weight: 400;
}

:deep(.submenu-item .v-list-item__prepend) {
    width: 24px !important;
}

/* Submenu items - text color only, no background */
:deep(.submenu-item.v-list-item--active) {
    background: transparent !important;
    color: #9b2335 !important;
}

:deep(.submenu-item.v-list-item--active .v-icon) {
    color: #9b2335 !important;
}

.submenu-item:hover {
    background: transparent !important;
    color: #9b2335 !important;
}

:deep(.submenu-item:hover .v-icon) {
    color: #9b2335 !important;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.user-profile {
    cursor: pointer;
    transition: background 0.2s ease;
    border-radius: 12px;
    margin: 0 8px 8px 8px;
}

.user-profile:hover {
    background: rgba(155, 35, 53, 0.08);
}

.user-avatar {
    border: 2px solid rgba(155, 35, 53, 0.3);
}
</style>
