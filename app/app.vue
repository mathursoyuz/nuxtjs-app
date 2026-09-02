<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
    <GlobalLoadingOverlay />
</template>

<script setup lang="ts">
import GlobalLoadingOverlay from '~/components/globals/GlobalLoadingOverlay.vue';

// Suppress vee-validate-zod description warnings for nested array schemas
// These warnings are harmless and don't affect functionality - they occur because
// vee-validate-zod has trouble extracting descriptions from nested array schemas
if (process.client) {
    const originalWarn = console.warn;
    console.warn = (...args: unknown[]) => {
        const message = args[0];
        if (
            typeof message === 'string' &&
            message.includes('Failed to describe path') &&
            message.includes('variations[') &&
            message.includes('on the schema, returning a default description')
        ) {
            // Suppress these specific warnings
            return;
        }
        originalWarn.apply(console, args);
    };
}
</script>

<style>
/* Global Page Transitions */
.page-enter-active,
.page-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
    opacity: 0;
    transform: translateY(20px);
}

.page-leave-to {
    opacity: 0;
    transform: translateY(-20px);
}

/* Layout Transitions */
.layout-enter-active,
.layout-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.layout-enter-from,
.layout-leave-to {
    opacity: 0;
    filter: blur(4px);
}

/* Vuetify Dialog Animations */
.v-dialog {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.v-overlay--active .v-overlay__content {
    animation: dialogIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dialogIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

/* Dialog bottom transition (slide up) */
.dialog-bottom-transition-enter-active,
.dialog-bottom-transition-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-bottom-transition-enter-from {
    opacity: 0;
    transform: translateY(100px);
}

.dialog-bottom-transition-leave-to {
    opacity: 0;
    transform: translateY(50px);
}

/* Loading content blur effect */
.loading-content {
    filter: blur(2px);
    pointer-events: none;
    opacity: 0.6;
}

/* Menu/Dropdown Animations */
.v-menu > .v-overlay__content {
    animation: menuSlideIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    transform-origin: top center;
}

@keyframes menuSlideIn {
    from {
        opacity: 0;
        transform: scaleY(0.8) translateY(-8px);
    }
    to {
        opacity: 1;
        transform: scaleY(1) translateY(0);
    }
}

/* Snackbar/Toast Animations */
.v-snackbar__wrapper {
    animation: snackbarSlide 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes snackbarSlide {
    from {
        opacity: 0;
        transform: translateY(100%);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Card hover effect */
.v-card {
    transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

/* Button ripple enhancement */
.v-btn {
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
}

.v-btn:active {
    transform: scale(0.97);
}

/* List item hover animation */
.v-list-item {
    transition:
        background-color 0.2s ease,
        transform 0.15s ease;
}

/* Chip animations */
.v-chip {
    transition:
        transform 0.15s ease,
        box-shadow 0.15s ease;
}

.v-chip:hover {
    transform: translateY(-1px);
}

/* Smooth Scrolling */
html {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

* {
    scroll-behavior: smooth;
}

body {
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* Smooth scrollbar styling */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}

::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 4px;
}

::-webkit-scrollbar-thumb {
    background: rgba(155, 35, 53, 0.3);
    border-radius: 4px;
    transition: background 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
    background: rgba(155, 35, 53, 0.5);
}

/* Firefox scrollbar */
* {
    scrollbar-width: thin;
    scrollbar-color: rgba(155, 35, 53, 0.3) transparent;
}

/* Smooth scrolling for all scrollable elements */
.v-main,
.v-navigation-drawer,
.v-list,
.v-container,
.v-card {
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
}

/* Global Font */
body {
    font-family:
        'Inter',
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        sans-serif;
}

/* Focus ring styling - Wine */
*:focus-visible {
    outline: 2px solid rgba(155, 35, 53, 0.5);
    outline-offset: 2px;
}

/* Selection color - Wine */
::selection {
    background: rgba(155, 35, 53, 0.2);
}
</style>

