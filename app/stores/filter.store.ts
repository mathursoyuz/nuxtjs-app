import { ref } from 'vue'
import { defineStore } from 'pinia'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useFilterStore = defineStore('filters', () => {
    const organisationId = ref<number | null>(null)

    function setOrganisationId(value: number | null) {
        organisationId.value = value
    }

    function reset() {
        organisationId.value = null
    }

    registerOrganisationContextReset('filters', reset)

    return { organisationId, setOrganisationId, reset }
})
