<template>
    <v-app-bar elevation="0" color="white" :height="64 + filterHeight" class="topbar">
        <div class="topbar-main">
            <v-btn icon variant="text" @click="$emit('toggle-drawer')" class="ml-2">
                <v-icon>{{ drawerOpen ? 'mdi-menu-open' : 'mdi-menu' }}</v-icon>
            </v-btn>

            <v-breadcrumbs :items="breadcrumbs" class="ml-2">
                <template v-slot:divider>
                    <v-icon size="small">mdi-chevron-right</v-icon>
                </template>
            </v-breadcrumbs>

            <v-spacer></v-spacer>

            <v-btn icon variant="text" class="mr-1">
                <v-icon>mdi-magnify</v-icon>
            </v-btn>

            <v-btn icon variant="text" class="mr-1">
                <v-badge dot color="error" offset-x="-2" offset-y="-2">
                    <v-icon>mdi-bell-outline</v-icon>
                </v-badge>
            </v-btn>

            <!-- Settings button - commented out until /settings route is created -->
            <!-- <v-btn icon variant="text" class="mr-1" @click="navigateTo('/settings')">
            <v-icon>mdi-cog-outline</v-icon>
        </v-btn> -->

            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-btn v-bind="props" variant="text" class="ml-2 mr-4">
                        <v-avatar size="32" class="mr-2">
                            <v-img v-if="user" :src="userAvatar" alt="User"></v-img>
                            <v-icon v-else>mdi-account</v-icon>
                        </v-avatar>
                        <span class="d-none d-md-inline">{{ userDisplayName }}</span>
                        <v-icon size="small" class="ml-1">mdi-chevron-down</v-icon>
                    </v-btn>
                </template>
                <v-list density="compact" min-width="200">
                    <v-list-item>
                        <v-list-item-title>{{ userDisplayName }}</v-list-item-title>
                        <v-list-item-subtitle v-if="user">{{ user.email }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-divider class="my-1"></v-divider>
                    <v-list-item
                        prepend-icon="mdi-account"
                        title="Profile"
                        @click="navigateTo('/profile')"
                    ></v-list-item>
                    <!-- Settings menu item - commented out until /settings route is created -->
                    <!-- <v-list-item prepend-icon="mdi-cog" title="Settings" @click="navigateTo('/settings')"></v-list-item> -->
                    <v-divider class="my-1"></v-divider>
                    <AuthLogoutMenuItems />
                </v-list>
            </v-menu>
        </div>
        <GlobalFilterBar @resize="filterHeight = $event" />
    </v-app-bar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth.store'
import AuthLogoutMenuItems from '~/components/auth/LogoutMenuItems.vue'
import GlobalFilterBar from '~/components/filters/GlobalFilterBar.vue'

defineProps<{
    drawerOpen: boolean
}>()

defineEmits<{
    'toggle-drawer': []
}>()

const route = useRoute()
const authStore = useAuthStore()
const filterHeight = ref(0)

const user = computed(() => authStore.user)

const userDisplayName = computed(() => {
    if (user.value) {
        return `${user.value.firstName} ${user.value.lastName}`
    }
    return 'Guest'
})

const userAvatar = computed(() => {
    // You can add user avatar URL from user object if available
    return 'https://i.pravatar.cc/150?img=12'
})

const breadcrumbs = computed(() => {
    const path = route.path
    const items: Array<{ title: string; disabled: boolean; to: string }> = [
        { title: 'Home', disabled: false, to: '/dashboard' },
    ]
    if (path !== '/dashboard' && path !== '/') {
        const segments = path.split('/').filter(Boolean)
        segments.forEach((segment, index) => {
            items.push({
                title: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
                disabled: index === segments.length - 1,
                to: '/' + segments.slice(0, index + 1).join('/'),
            })
        })
    }
    return items
})
</script>

<style scoped>
.topbar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08) !important;
}

.topbar :deep(.v-toolbar__content) {
    flex-direction: column;
}

.topbar-main {
    display: flex;
    align-items: center;
    flex: none;
    height: 64px;
    width: 100%;
    min-width: 0;
}

.topbar-main :deep(.v-breadcrumbs) {
    min-width: 0;
    overflow: hidden;
    flex-wrap: nowrap;
}
</style>
