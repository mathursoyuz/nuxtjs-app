<template>
    <v-container fluid class="fill-height">
        <v-row align="center" justify="center" class="fill-height">
            <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
                <v-icon size="128" color="error">mdi-alert-circle</v-icon>
                <h1 class="text-h4 mt-4 mb-2">Error</h1>
                <p class="text-body-1 mb-4">{{ errorMessage || 'An unexpected error occurred' }}</p>
                <v-btn color="primary" @click="goHome">Go to Home</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

definePageMeta({
    layout: 'default',
    public: true,
});

const route = useRoute();
const errorMessage = computed(() => route.query.message as string | undefined);

const goHome = () => {
    navigateTo('/');
};
</script>
