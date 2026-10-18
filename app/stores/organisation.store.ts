import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Organisation } from '~/types/organisation.types'

export const useOrganisationStore = defineStore('organisation', () => {
    const organisations = ref<Organisation[]>([])
    const currentOrganisation = ref<Organisation | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const activeOrganisations = computed(() => organisations.value.filter((organisation) => organisation.isActive))
    const organisationById = computed(
        () => (id: number) => organisations.value.find((organisation) => organisation.id === id)
    )

    function setOrganisations(value: Organisation[]): void {
        organisations.value = value
    }

    function setCurrentOrganisation(value: Organisation | null): void {
        currentOrganisation.value = value
    }

    function addOrganisation(organisation: Organisation): void {
        organisations.value.push(organisation)
    }

    function updateOrganisation(organisation: Organisation): void {
        const index = organisations.value.findIndex((item) => item.id === organisation.id)
        if (index >= 0) organisations.value[index] = organisation
        if (currentOrganisation.value?.id === organisation.id) currentOrganisation.value = organisation
    }

    function removeOrganisation(id: number): void {
        organisations.value = organisations.value.filter((organisation) => organisation.id !== id)
        if (currentOrganisation.value?.id === id) currentOrganisation.value = null
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
        organisations,
        currentOrganisation,
        loading,
        error,
        activeOrganisations,
        organisationById,
        setOrganisations,
        setCurrentOrganisation,
        addOrganisation,
        updateOrganisation,
        removeOrganisation,
        setLoading,
        setError,
        clearError,
    }
})
