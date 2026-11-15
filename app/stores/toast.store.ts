import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    timeout?: number
    timestamp: Date
}

const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([])
    const visibleToasts = computed(() => toasts.value.slice(-5).reverse())

    const addToast = (message: string, type: Toast['type'], timeout: number = 5000): string => {
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

    const removeToast = (id: string): void => {
        const index = toasts.value.findIndex((toast) => toast.id === id)
        if (index >= 0) toasts.value.splice(index, 1)
    }

    const clearAll = (): void => {
        toasts.value = []
    }

    const success = (message: string, timeout: number = 5000): string => {
        return addToast(message, 'success', timeout)
    }

    const error = (message: string, timeout: number = 5000): string => {
        return addToast(message, 'error', timeout)
    }

    const warning = (message: string, timeout: number = 5000): string => {
        return addToast(message, 'warning', timeout)
    }

    const info = (message: string, timeout: number = 5000): string => {
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
