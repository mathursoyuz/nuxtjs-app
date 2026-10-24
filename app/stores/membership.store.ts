import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Membership, MembershipSubscription, MembershipType } from '~/types/membership.types'
import { registerOrganisationContextReset } from '~/services/context/organisation-context-reset.registry'

export const useMembershipStore = defineStore('memberships', () => {
    const types = ref<MembershipType[]>([])
    const memberships = ref<Membership[]>([])
    const subscriptions = ref<MembershipSubscription[]>([])
    const loading = ref(false)

    const clear = (): void => {
        types.value = []
        memberships.value = []
        subscriptions.value = []
    }

    registerOrganisationContextReset('memberships', clear)

    return { types, memberships, subscriptions, loading, clear }
})
