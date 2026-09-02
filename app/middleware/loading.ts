import { useLoadingStore } from '~/stores/loading.store';

/**
 * Loading middleware for page navigation
 * Shows spinner during page transitions and data loading
 */
export default defineNuxtRouteMiddleware((to, from) => {
    // Only run on client side
    if (process.server) return;

    const loadingStore = useLoadingStore();
    const taskId = `page-${to.path}`;

    // Start loading when navigation begins
    loadingStore.startTask(taskId, 'Loading page...');

    // Stop loading will be handled by the page component's onMounted
    // This ensures spinner shows during navigation and until page data loads
});
