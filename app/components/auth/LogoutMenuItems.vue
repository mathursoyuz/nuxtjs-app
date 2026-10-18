<template>
    <v-list-item prepend-icon="mdi-logout" title="Log out" @click="logoutCurrentTab" />
    <v-list-item
        prepend-icon="mdi-logout-variant"
        title="Log out everywhere"
        @click="requestLogoutAll"
    />
</template>

<script setup lang="ts">
import { useSessionStore } from '~/stores/session.store'
import { useLogoutConfirmation } from '~/composables/useLogoutConfirmation'

const session = useSessionStore()
const { requestLogoutAll } = useLogoutConfirmation()

const logoutCurrentTab = (): void => {
    void session.logout()
}
</script>
