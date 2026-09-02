<template>
    <v-list-item prepend-icon="mdi-logout" title="Log out" @click="logoutCurrentTab" />
    <v-list-item
        prepend-icon="mdi-logout-variant"
        title="Log out all tabs"
        @click="requestLogoutAll"
    />
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store'
import { useLogoutConfirmation } from '~/composables/useLogoutConfirmation'

const authStore = useAuthStore()
const { requestLogoutAll } = useLogoutConfirmation()

const logoutCurrentTab = (): void => {
    void authStore.logout()
}
</script>
