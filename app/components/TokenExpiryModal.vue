<template>
    <v-dialog v-model="showModal" persistent max-width="500">
        <v-card>
            <v-card-title class="d-flex align-center">
                <v-icon :color="isExpired ? 'error' : 'warning'" class="mr-2">
                    {{ isExpired ? 'mdi-alert-circle' : 'mdi-clock-alert' }}
                </v-icon>
                <span>{{ isExpired ? 'Session Expired' : 'Session Expiring Soon' }}</span>
            </v-card-title>

            <v-card-text>
                <p v-if="isExpired" class="text-body-1">
                    Your session has expired. Please log in again to continue.
                </p>
                <p v-else class="text-body-1">
                    Your session will expire soon. Please log in again to continue your work.
                </p>
            </v-card-text>

            <v-card-actions>
                <v-spacer />
                <v-btn v-if="!isExpired" variant="text" @click="dismissModal">Continue</v-btn>
                <v-btn color="primary" @click="handleReLogin">Login</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTokenExpiry } from '~/composables/useTokenExpiry';

const { showExpiryModal, isExpired, handleReLogin, dismissModal } = useTokenExpiry();

const showModal = computed(() => showExpiryModal.value);
</script>
