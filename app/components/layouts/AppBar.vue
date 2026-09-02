<template>
    <v-app-bar color="primary" prominent>
        <v-app-bar-nav-icon @click="toggleDrawer" />
        <v-toolbar-title>Winery Support</v-toolbar-title>
        <v-spacer />
        <v-menu>
            <template #activator="{ props }">
                <v-btn icon="mdi-account-circle" v-bind="props" />
            </template>
            <v-list>
                <v-list-item>
                    <v-list-item-title>
                        {{ user?.firstName }} {{ user?.lastName }}
                    </v-list-item-title>
                    <v-list-item-subtitle>{{ user?.email }}</v-list-item-subtitle>
                </v-list-item>
                <v-divider />
                <v-list-item prepend-icon="mdi-account" @click="navigateTo('/profile')">
                    Profile
                </v-list-item>
                <AuthLogoutMenuItems />
            </v-list>
        </v-menu>
    </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth.store'
import AuthLogoutMenuItems from '~/components/auth/LogoutMenuItems.vue'

interface Props {
    modelValue: boolean
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()

const user = computed(() => authStore.user)

const toggleDrawer = () => {
    emit('update:modelValue', !props.modelValue)
}
</script>
