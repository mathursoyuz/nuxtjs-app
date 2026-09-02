<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12">
                <h1 class="text-h4 mb-4">QuickBooks Authentication</h1>

                <v-card>
                    <v-card-text>
                        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
                        <v-alert v-if="success" type="success" class="mb-4">
                            Successfully connected to QuickBooks!
                        </v-alert>

                        <v-btn
                            color="primary"
                            prepend-icon="mdi-link"
                            :loading="loading"
                            @click="handleAuth"
                        >
                            Connect to QuickBooks
                        </v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuickbooks } from '~/composables/useQuickbooks';

definePageMeta({
    middleware: ['auth', 'role'],
    roles: ['admin', 'sales_manager'],
    public: true, // Allow access during OAuth flow
});

const route = useRoute();
const { handleAuthCallback, loading, error } = useQuickbooks();
const success = ref(false);

const handleAuth = () => {
    const { initiateAuth } = useQuickbooks();
    initiateAuth();
};

onMounted(async () => {
    const code = route.query.code as string;
    const realmId = route.query.realmId as string;

    if (code && realmId) {
        try {
            await handleAuthCallback(code, realmId);
            success.value = true;
            setTimeout(() => {
                navigateTo('/integrations/quickbooks');
            }, 2000);
        } catch (err) {
            console.error('Auth callback error:', err);
        }
    }
});
</script>
