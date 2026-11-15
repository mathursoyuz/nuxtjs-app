import { ref, customRef, type Ref } from 'vue'

/**
 * Debounce a reactive ref value
 */
export const useDebouncedRef = <T>(
    initialValue: T,
    delay: number = 300,
    immediate: boolean = false
): Ref<T> => {
    const state = ref(initialValue)

    return customRef<T>((track, trigger) => {
        let timeout: ReturnType<typeof setTimeout> | null = null

        return {
            get(): T {
                track()
                return state.value
            },
            set(newValue: T): void {
                if (immediate && !timeout) {
                    state.value = newValue
                    trigger()
                }
                if (timeout) clearTimeout(timeout)

                timeout = setTimeout(() => {
                    state.value = newValue
                    trigger()
                    timeout = null
                }, delay)
            },
        }
    })
}
