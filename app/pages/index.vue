<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" class="text-center">
                <h1>Welcome to Winery Support</h1>
                <v-btn color="primary" to="/login" class="mr-4">Login</v-btn>
                <v-btn color="secondary" to="/register">Register</v-btn>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
definePageMeta({
    layout: false,
    public: true, // Public route, no auth required
    middleware: ['guest'],
})
</script>
