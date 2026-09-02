import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    timeout?: number
    timestamp: Date
}

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])
    const visibleToasts = computed(() => toasts.value.slice(-5).reverse())

    function addToast(message: string, type: Toast['type'], timeout = 5000): string {
        const toast: Toast = {
            id: generateId(),
            message,
            type,
            timeout,
            timestamp: new Date(),
        }
        toasts.value.push(toast)

        if (timeout > 0) {
            setTimeout(() => removeToast(toast.id), timeout)
        }

        return toast.id
    }

    function removeToast(id: string): void {
        const index = toasts.value.findIndex((toast) => toast.id === id)
        if (index >= 0) toasts.value.splice(index, 1)
    }

    function clearAll(): void {
        toasts.value = []
    }

    function success(message: string, timeout = 5000): string {
        return addToast(message, 'success', timeout)
    }

    function error(message: string, timeout = 5000): string {
        return addToast(message, 'error', timeout)
    }

    function warning(message: string, timeout = 5000): string {
        return addToast(message, 'warning', timeout)
    }

    function info(message: string, timeout = 5000): string {
        return addToast(message, 'info', timeout)
    }

    return {
        toasts,
        visibleToasts,
        addToast,
        removeToast,
        clearAll,
        success,
        error,
        warning,
        info,
    }
})
