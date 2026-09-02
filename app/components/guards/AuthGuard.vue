<template>
    <slot v-if="isAuthenticated" />
    <div v-else>
        <slot name="fallback">
            <v-alert type="warning" class="ma-4">Please login to access this content.</v-alert>
        </slot>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth.store'

const authStore = useAuthStore()

const { isAuthenticated } = storeToRefs(authStore)
</script>
