<template>
    <div class="toast-container">
        <TransitionGroup name="toast" tag="div" class="toast-list">
            <v-card
                v-for="toast in toasts"
                :key="toast.id"
                :color="getToastColor(toast.type)"
                class="toast-item"
                elevation="4"
            >
                <v-card-text class="d-flex align-center justify-space-between pa-3">
                    <span class="toast-message">{{ toast.message }}</span>
                    <v-btn
                        icon="mdi-close"
                        variant="text"
                        size="small"
                        class="ml-2"
                        @click="handleClose(toast.id)"
                    />
                </v-card-text>
            </v-card>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useToast } from '~/composables/useToast';
import type { Toast } from '~/stores/toast.store';

const { toasts, remove } = useToast();

const handleClose = (id: string): void => {
    if (remove && typeof remove === 'function') {
        remove(id);
    }
};

const getToastColor = (type: Toast['type']): string => {
    const colorMap = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'info',
    };
    return colorMap[type] || 'info';
};

// Auto-dismiss is handled by the toast store, so we don't need to do anything here
// The store already sets up timeouts when adding toasts
</script>

<style scoped>
.toast-container {
    position: fixed;
    top: 80px;
    right: 16px;
    z-index: 9999;
    pointer-events: none;
    max-width: 400px;
    width: 100%;
}

.toast-list {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 12px;
}

.toast-item {
    pointer-events: auto;
    min-width: 300px;
    max-width: 400px;
    width: 100%;
}

.toast-message {
    flex: 1;
    color: white;
    font-size: 14px;
    line-height: 1.5;
}

/* Toast transition animations */
.toast-enter-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.toast-move {
    transition: transform 0.3s ease;
}
</style>
