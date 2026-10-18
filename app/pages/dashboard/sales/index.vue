<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <v-card>
                    <v-card-title>Sales Dashboard</v-card-title>
                    <v-card-text>
                        <p>This page is accessible to sales managers and sales reps.</p>
                        <p v-if="authStore.user">Welcome, {{ authStore.user.firstName }} {{ authStore.user.lastName }}!</p>
                        <p>Your role: {{ access.systemRole }}</p>

                        <!-- Component-level guard example -->
                        <div v-if="access.can(CUSTOMER_PERMISSIONS.READ)">
                            <v-alert type="info" class="mt-4">
                                This content is only visible to admins and sales managers.
                            </v-alert>
                        </div>

                        <div v-if="access.can(CUSTOMER_PERMISSIONS.WRITE)">
                            <v-alert type="warning" class="mt-4">
                                This content is only visible to admins.
                            </v-alert>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth.store';
import { useAccessStore } from '~/stores/access.store';
import { CUSTOMER_PERMISSIONS } from '~/components/customers/customer.permissions';

// Route-level guard: Sales managers OR sales reps can access
definePageMeta({
    middleware: ['auth', 'permission'],
    access: { permission: CUSTOMER_PERMISSIONS.READ, allowCrossOrganisation: true },
});

const authStore = useAuthStore();
const access = useAccessStore();
</script>
