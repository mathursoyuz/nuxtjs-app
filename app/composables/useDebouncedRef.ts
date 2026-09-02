import { ref, customRef, type Ref } from 'vue';

/**
 * Debounce a reactive ref value
 */
export function useDebouncedRef<T>(initialValue: T, delay = 300, immediate = false): Ref<T> {
    const state = ref(initialValue);

    return customRef<T>((track, trigger) => {
        let timeout: ReturnType<typeof setTimeout> | null = null;

        return {
            get() {
                track();
                return state.value;
            },
            set(newValue: T) {
                if (immediate && !timeout) {
                    state.value = newValue;
                    trigger();
                }
                if (timeout) clearTimeout(timeout);

                timeout = setTimeout(() => {
                    state.value = newValue;
                    trigger();
                    timeout = null;
                }, delay);
            },
        };
    });
}
