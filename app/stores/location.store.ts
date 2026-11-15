import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Location } from '~/types/location.types'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useLocationStore = defineStore('location', () => {
    const locations = ref<Location[]>([])
    const currentLocation = ref<Location | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeLocations = computed(() => locations.value.filter((location) => location.isActive))
    const locationsByOrganisation = computed(
        () => (organisationId: number) =>
            locations.value.filter((location) => location.organisationId === organisationId)
    )
    const locationById = computed(
        () => (id: number) => locations.value.find((location) => location.id === id)
    )

    const setLocations = (value: Location[]): void => {
        locations.value = value
    }

    const setCurrentLocation = (value: Location | null): void => {
        currentLocation.value = value
    }

    const addLocation = (location: Location): void => {
        locations.value.push(location)
    }

    const updateLocation = (location: Location): void => {
        const index = locations.value.findIndex((item) => item.id === location.id)
        if (index >= 0) locations.value[index] = location
        if (currentLocation.value?.id === location.id) currentLocation.value = location
    }

    const removeLocation = (id: number): void => {
        locations.value = locations.value.filter((location) => location.id !== id)
        if (currentLocation.value?.id === id) currentLocation.value = null
    }

    const setLoading = (value: boolean): void => {
        loading.value = value
    }

    const setError = (value: string | null): void => {
        error.value = value
    }

    const clearError = (): void => {
        error.value = null
    }

    const resetForOrganisationContext = (): void => {
        locations.value = []
        currentLocation.value = null
        loading.value = false
        error.value = null
    }

    registerOrganisationContextReset('locations', resetForOrganisationContext)

    return {
        locations,
        currentLocation,
        loading,
        error,
        activeLocations,
        locationsByOrganisation,
        locationById,
        setLocations,
        setCurrentLocation,
        addLocation,
        updateLocation,
        removeLocation,
        setLoading,
        setError,
        clearError,
        resetForOrganisationContext,
    }
})
