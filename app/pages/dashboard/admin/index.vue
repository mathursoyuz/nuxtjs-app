<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>Admin Dashboard</v-card-title>
                    <v-card-text>
                        <p>This page is only accessible to administrators.</p>
                        <p v-if="authStore.user">Welcome, {{ authStore.user.firstName }} {{ authStore.user.lastName }}!</p>
                        <p>Your role: {{ authStore.userRole }}</p>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

// Route-level guard: Only admin can access
definePageMeta({
    middleware: ['auth', 'role'],
    roles: 'admin', // Single role
});
</script>
