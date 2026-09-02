<template>
    <Transition name="loading-fade">
        <div v-if="isActive" class="global-loading-overlay">
            <div class="loading-backdrop" @click.prevent></div>
            <div class="loading-content">
                <v-progress-circular
                    indeterminate
                    color="primary"
                    size="64"
                    width="6"
                    class="mb-4"
                />
                <div v-if="loadingMessage" class="loading-message text-h6">
                    {{ loadingMessage }}
                </div>
                <div v-else class="loading-message text-h6">
                    Loading...
                </div>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLoadingStore } from '~/stores/loading.store';

const loadingStore = useLoadingStore();

const isActive = computed(() => loadingStore.isActive);
const loadingMessage = computed(() => loadingStore.loadingMessage);
</script>

<style scoped>
.global-loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
}

.loading-content {
    position: relative;
    z-index: 10000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    min-width: 200px;
}

.loading-message {
    color: #9b2335;
    font-weight: 500;
    text-align: center;
}

/* Loading fade transition */
.loading-fade-enter-active,
.loading-fade-leave-active {
    transition: opacity 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
    opacity: 0;
}

.loading-fade-enter-active .loading-content,
.loading-fade-leave-active .loading-content {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.loading-fade-enter-from .loading-content,
.loading-fade-leave-to .loading-content {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
}
</style>
