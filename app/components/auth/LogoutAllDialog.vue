<template>
    <DialogsConfirmDialog
        v-model="isOpen"
        title="Log out all tabs?"
        message="This will end your Winery Support session in every open tab in this browser."
        details="Sessions on other devices will not be affected."
        confirm-text="Log out all tabs"
        confirm-color="error"
        icon="mdi-logout-variant"
        icon-color="error"
        :loading="isLoggingOut"
        @confirm="confirmLogoutAll"
        @cancel="cancelLogoutAll"
    />
</template>

<script setup lang="ts">
import DialogsConfirmDialog from '~/components/dialogs/ConfirmDialog.vue'
import { useLogoutConfirmation } from '~/composables/useLogoutConfirmation'

const { isOpen, isLoggingOut, cancelLogoutAll, confirmLogoutAll } = useLogoutConfirmation()
</script>
