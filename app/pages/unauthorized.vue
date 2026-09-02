<template>
    <v-container fluid class="fill-height">
        <v-row align="center" justify="center" class="fill-height">
            <v-col cols="12" sm="8" md="6" class="text-center">
                <v-card>
                    <v-card-title class="text-h4 pa-6">Unauthorized</v-card-title>
                    <v-card-text>
                        <p class="text-h6 mb-4">You don't have permission to access this page.</p>
                        <v-btn color="primary" to="/dashboard">Go to Dashboard</v-btn>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
});
</script>
