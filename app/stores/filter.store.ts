import { ref } from 'vue'
import { defineStore } from 'pinia'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useFilterStore = defineStore('filters', () => {
    const organisationId = ref<number | null>(null)

    const setOrganisationId = (value: number | null): void => {
        organisationId.value = value
    }

    const reset = (): void => {
        organisationId.value = null
    }

    registerOrganisationContextReset('filters', reset)

    return { organisationId, setOrganisationId, reset }
})
