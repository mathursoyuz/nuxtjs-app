import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Location } from '~/types/location.types'
import type { InventorySnapshot } from '~/types/inventory.types'

export const useInventoryStore = defineStore('inventory', () => {
    const snapshots = ref<Record<string, InventorySnapshot>>({})
    const locationsByOwner = ref<Record<string, Location[]>>({})
    const loading = ref<Record<string, boolean>>({})
    const saving = ref<Record<string, boolean>>({})
    const errors = ref<Record<string, string | null>>({})

    function snapshotFor(key: string): InventorySnapshot {
        return snapshots.value[key] ?? { balances: [], movements: [], nextCursor: null }
    }

    function locationsFor(key: string): Location[] {
        return locationsByOwner.value[key] ?? []
    }

    function isLoading(key: string): boolean {
        return loading.value[key] ?? false
    }

    function isSaving(key: string): boolean {
        return saving.value[key] ?? false
    }

    function setSnapshot(key: string, snapshot: InventorySnapshot): void {
        snapshots.value = { ...snapshots.value, [key]: snapshot }
    }

    function setLocations(key: string, locations: Location[]): void {
        locationsByOwner.value = { ...locationsByOwner.value, [key]: locations }
    }

    function setLoading(key: string, value: boolean): void {
        loading.value = { ...loading.value, [key]: value }
    }

    function setSaving(key: string, value: boolean): void {
        saving.value = { ...saving.value, [key]: value }
    }

    function setError(key: string, value: string | null): void {
        errors.value = { ...errors.value, [key]: value }
    }

    return {
        snapshots,
        locationsByOwner,
        loading,
        saving,
        errors,
        snapshotFor,
        locationsFor,
        isLoading,
        isSaving,
        setSnapshot,
        setLocations,
        setLoading,
        setSaving,
        setError,
    }
})
