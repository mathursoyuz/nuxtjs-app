import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Location } from '~/types/location.types'

export const useLocationStore = defineStore('location', () => {
    const locations = ref<Location[]>([])
    const currentLocation = ref<Location | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeLocations = computed(() => locations.value.filter((location) => location.isActive))
    const locationsByClient = computed(
        () => (clientId: number) =>
            locations.value.filter((location) => location.clientId === clientId)
    )
    const locationById = computed(
        () => (id: number) => locations.value.find((location) => location.id === id)
    )

    function setLocations(value: Location[]): void {
        locations.value = value
    }

    function setCurrentLocation(value: Location | null): void {
        currentLocation.value = value
    }

    function addLocation(location: Location): void {
        locations.value.push(location)
    }

    function updateLocation(location: Location): void {
        const index = locations.value.findIndex((item) => item.id === location.id)
        if (index >= 0) locations.value[index] = location
        if (currentLocation.value?.id === location.id) currentLocation.value = location
    }

    function removeLocation(id: number): void {
        locations.value = locations.value.filter((location) => location.id !== id)
        if (currentLocation.value?.id === id) currentLocation.value = null
    }

    function setLoading(value: boolean): void {
        loading.value = value
    }

    function setError(value: string | null): void {
        error.value = value
    }

    function clearError(): void {
        error.value = null
    }

    return {
        locations,
        currentLocation,
        loading,
        error,
        activeLocations,
        locationsByClient,
        locationById,
        setLocations,
        setCurrentLocation,
        addLocation,
        updateLocation,
        removeLocation,
        setLoading,
        setError,
        clearError,
    }
})
