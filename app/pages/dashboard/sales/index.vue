<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>Sales Dashboard</v-card-title>
                    <v-card-text>
                        <p>This page is accessible to sales managers and sales reps.</p>
                        <p v-if="authStore.user">Welcome, {{ authStore.user.firstName }} {{ authStore.user.lastName }}!</p>
                        <p>Your role: {{ authStore.userRole }}</p>

                        <!-- Component-level guard example -->
                        <RoleGuard :roles="['admin', 'sales_manager']">
                            <v-alert type="info" class="mt-4">
                                This content is only visible to admins and sales managers.
                            </v-alert>
                        </RoleGuard>

                        <RoleGuard roles="admin">
                            <v-alert type="warning" class="mt-4">
                                This content is only visible to admins.
                            </v-alert>
                        </RoleGuard>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';

// Route-level guard: Sales managers OR sales reps can access
definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['sales_manager', 'sales_rep'], // Multiple roles (ANY)
});
</script>
