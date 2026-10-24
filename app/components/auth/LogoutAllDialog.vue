<template>
    <DialogsConfirmDialog
        v-model="isOpen"
        title="Log out everywhere?"
        message="This will end all your Winery Support sessions across browsers and devices."
        confirm-text="Log out everywhere"
        confirm-color="error"
        icon="mdi-logout-variant"
        icon-color="error"
        scope="Account"
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
