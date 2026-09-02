import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loading', () => {
    const activeTasks = ref(new Set<string>())
    const loadingMessage = ref('')

    const isActive = computed(() => activeTasks.value.size > 0)

    function startTask(taskId: string, message?: string): void {
        activeTasks.value.add(taskId)
        if (message) loadingMessage.value = message
    }

    function stopTask(taskId: string): void {
        activeTasks.value.delete(taskId)
        if (activeTasks.value.size === 0) loadingMessage.value = ''
    }

    function isTaskActive(taskId: string): boolean {
        return activeTasks.value.has(taskId)
    }

    function reset(): void {
        activeTasks.value.clear()
        loadingMessage.value = ''
    }

    return {
        activeTasks,
        loadingMessage,
        isActive,
        startTask,
        stopTask,
        isTaskActive,
        reset,
    }
})
