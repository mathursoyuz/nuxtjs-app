<template>
    <v-app>
        <LayoutSidebar v-model="drawer" />
        <LayoutTopbar :drawer-open="drawer" @toggle-drawer="drawer = !drawer" />

        <!-- Main Content -->
        <v-main class="main-content">
            <slot />
        </v-main>

        <!-- Toast Container -->
        <ToastContainer />
        <AuthLogoutAllDialog />
    </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LayoutSidebar from '~/components/layouts/LayoutSidebar.vue'
import LayoutTopbar from '~/components/layouts/LayoutTopbar.vue'
import ToastContainer from '~/components/notifications/ToastContainer.vue'
import AuthLogoutAllDialog from '~/components/auth/LogoutAllDialog.vue'

const drawer = ref(true)
</script>

<style scoped>
.main-content {
    background: #f8f9fa;
}
</style>
