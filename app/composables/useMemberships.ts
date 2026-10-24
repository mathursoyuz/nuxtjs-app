import type { MembershipApiService } from '~/services/api/wrappers/membership.api'
import { useMembershipStore } from '~/stores/membership.store'
import type {
    MembershipActionDecision,
    MembershipInput,
    MembershipTypeInput,
    OrganisationMembershipInput,
} from '~/types/membership.types'
import type { CategoryApiService } from '~/services/api/wrappers/category.api'
import type { OrganisationProductApiService } from '~/services/api/wrappers/organisation-product.api'
import type { OrganisationCreditCardApiService } from '~/services/api/wrappers/organisation-credit-card.api'
import type { CustomerCreditCardApiService } from '~/services/api/wrappers/customer-credit-card.api'

export function useMemberships() {
    const api = useNuxtApp().$membershipApi as MembershipApiService
    const categoryApi = useNuxtApp().$categoryApi as CategoryApiService
    const organisationProductApi = useNuxtApp()
        .$organisationProductApi as OrganisationProductApiService
    const organisationCreditCardApi = useNuxtApp()
        .$organisationCreditCardApi as OrganisationCreditCardApiService
    const customerCreditCardApi = useNuxtApp()
        .$customerCreditCardApi as CustomerCreditCardApiService
    const store = useMembershipStore()

    const run = async <T>(operation: () => Promise<T>): Promise<T> => {
        store.loading = true
        try {
            return await operation()
        } finally {
            store.loading = false
        }
    }

    const loadPlatform = async (): Promise<void> => {
        await run(async () => {
            const [types, memberships] = await Promise.all([
                api.getPlatformTypes(),
                api.getPlatformMemberships(),
            ])
            store.types = types.data ?? []
            store.memberships = memberships.data ?? []
        })
    }

    const loadOrganisation = async (organisationId: number): Promise<void> => {
        await run(async () => {
            const [types, memberships] = await Promise.all([
                api.getOrganisationTypes(organisationId),
                api.getOrganisationMemberships(organisationId),
            ])
            store.types = types.data ?? []
            store.memberships = memberships.data ?? []
        })
    }

    const loadCustomerSubscriptions = async (
        organisationId: number,
        customerId: number
    ): Promise<void> => {
        await run(async () => {
            store.subscriptions =
                (await api.getCustomerSubscriptions(organisationId, customerId)).data ?? []
        })
    }

    const loadOrganisationFormOptions = async (organisationId: number) => {
        const [categories, products] = await Promise.all([
            categoryApi.getAllCategories(),
            organisationProductApi.getAllOrganisationProducts(organisationId),
        ])
        return {
            categories: (categories.data ?? []).map((item) => ({
                title: item.name,
                value: item.id,
            })),
            products: (products.data ?? []).map((item) => ({ title: item.name, value: item.id })),
        }
    }

    const loadOrganisationSubscriptionOptions = async (organisationId: number) => {
        const [memberships, cards, subscriptions] = await Promise.all([
            api.getAvailablePlatformServices(organisationId),
            organisationCreditCardApi.getAllOrganisationCreditCards(organisationId),
            api.getOrganisationSubscriptions(organisationId),
        ])
        return {
            memberships: memberships.data ?? [],
            cards: cards.data ?? [],
            subscriptions: subscriptions.data ?? [],
        }
    }

    const loadCustomerMembershipOptions = async (organisationId: number, customerId: number) => {
        const [memberships, cards, subscriptions] = await Promise.all([
            api.getOrganisationMemberships(organisationId),
            customerCreditCardApi.getAllCustomerCreditCards(customerId),
            api.getCustomerSubscriptions(organisationId, customerId),
        ])
        return {
            memberships: memberships.data ?? [],
            cards: cards.data ?? [],
            subscriptions: subscriptions.data ?? [],
        }
    }

    return {
        store,
        loadPlatform,
        loadOrganisation,
        loadCustomerSubscriptions,
        loadOrganisationFormOptions,
        loadOrganisationSubscriptionOptions,
        loadCustomerMembershipOptions,
        createPlatformType: (data: MembershipTypeInput) => api.createPlatformType(data),
        updatePlatformType: (id: number, data: Partial<MembershipTypeInput>) =>
            api.updatePlatformType(id, data),
        deletePlatformType: (id: number) => api.deletePlatformType(id),
        createPlatformMembership: (data: MembershipInput) => api.createPlatformMembership(data),
        updatePlatformMembership: (id: number, data: Partial<MembershipInput>) =>
            api.updatePlatformMembership(id, data),
        deletePlatformMembership: (id: number) => api.deletePlatformMembership(id),
        createOrganisationType: (organisationId: number, data: MembershipTypeInput) =>
            api.createOrganisationType(organisationId, data),
        updateOrganisationType: (
            organisationId: number,
            id: number,
            data: Partial<MembershipTypeInput>
        ) => api.updateOrganisationType(organisationId, id, data),
        deleteOrganisationType: (organisationId: number, id: number) =>
            api.deleteOrganisationType(organisationId, id),
        createOrganisationMembership: (organisationId: number, data: OrganisationMembershipInput) =>
            api.createOrganisationMembership(organisationId, data),
        updateOrganisationMembership: (
            organisationId: number,
            id: number,
            data: Partial<OrganisationMembershipInput>
        ) => api.updateOrganisationMembership(organisationId, id, data),
        deleteOrganisationMembership: (organisationId: number, id: number) =>
            api.deleteOrganisationMembership(organisationId, id),
        joinCustomerMembership: (
            organisationId: number,
            customerId: number,
            membershipId: number,
            cardId?: number
        ) => api.joinCustomerMembership(organisationId, customerId, membershipId, cardId),
        upgradeCustomerMembership: (
            organisationId: number,
            customerId: number,
            subscriptionId: number,
            membershipId: number,
            cardId?: number,
            reason?: string
        ) =>
            api.upgradeCustomerMembership(
                organisationId,
                customerId,
                subscriptionId,
                membershipId,
                cardId,
                reason
            ),
        downgradeCustomerMembership: (
            organisationId: number,
            customerId: number,
            subscriptionId: number,
            membershipId: number,
            cardId?: number,
            reason?: string,
            effectiveImmediately?: boolean,
            forfeitRemainingCredit?: boolean
        ) =>
            api.downgradeCustomerMembership(
                organisationId,
                customerId,
                subscriptionId,
                membershipId,
                cardId,
                reason,
                effectiveImmediately,
                forfeitRemainingCredit
            ),
        rejoinCustomerMembership: (
            organisationId: number,
            customerId: number,
            membershipId: number,
            cardId?: number
        ) => api.rejoinCustomerMembership(organisationId, customerId, membershipId, cardId),
        cancelCustomerMembership: (
            organisationId: number,
            subscriptionId: number,
            reason?: string
        ) => api.cancelCustomerMembership(organisationId, subscriptionId, reason),
        resolveCustomerAction: (
            organisationId: number,
            actionId: number,
            decision: MembershipActionDecision,
            reason?: string
        ) => api.resolveCustomerAction(organisationId, actionId, decision, reason),
        createCustomerActionLink: (organisationId: number, actionId: number) =>
            api.createCustomerActionLink(organisationId, actionId),
        getCustomerSubscription: (organisationId: number, id: number) =>
            api.getCustomerSubscription(organisationId, id),
        getCustomerSubscriptions: (organisationId: number, customerId?: number) =>
            api.getCustomerSubscriptions(organisationId, customerId),
        getMembershipProducts: (organisationId: number, membershipId: number) =>
            api.getMembershipProducts(organisationId, membershipId),
        getMembershipMembers: (organisationId: number, membershipId: number) =>
            api.getMembershipMembers(organisationId, membershipId),
        getPlatformServiceSubscribers: (membershipId: number) =>
            api.getPlatformServiceSubscribers(membershipId),
        getCustomerMembershipOrders: (organisationId: number, customerId?: number) =>
            api.getCustomerMembershipOrders(organisationId, customerId),
        getPlatformServiceOrders: (organisationId: number) =>
            api.getPlatformServiceOrders(organisationId),
        previewSubscriptionRefund: (
            audience: 'CUSTOMER' | 'ORGANISATION',
            organisationId: number,
            billingCycleId: number
        ) => api.previewSubscriptionRefund(audience, organisationId, billingCycleId),
        refundSubscriptionOrder: (
            audience: 'CUSTOMER' | 'ORGANISATION',
            organisationId: number,
            billingCycleId: number,
            refundType: 'FULL' | 'PARTIAL',
            amount?: number,
            reason?: string
        ) =>
            api.refundSubscriptionOrder(
                audience,
                organisationId,
                billingCycleId,
                refundType,
                amount,
                reason
            ),
        getOrganisationSubscription: (organisationId: number, id: number) =>
            api.getOrganisationSubscription(organisationId, id),
        joinOrganisationMembership: (
            organisationId: number,
            membershipId: number,
            cardId?: number
        ) => api.joinOrganisationMembership(organisationId, membershipId, cardId),
        upgradeOrganisationMembership: (
            organisationId: number,
            subscriptionId: number,
            membershipId: number,
            cardId?: number,
            reason?: string
        ) =>
            api.upgradeOrganisationMembership(
                organisationId,
                subscriptionId,
                membershipId,
                cardId,
                reason
            ),
        downgradeOrganisationMembership: (
            organisationId: number,
            subscriptionId: number,
            membershipId: number,
            cardId?: number,
            reason?: string,
            effectiveImmediately?: boolean,
            forfeitRemainingCredit?: boolean
        ) =>
            api.downgradeOrganisationMembership(
                organisationId,
                subscriptionId,
                membershipId,
                cardId,
                reason,
                effectiveImmediately,
                forfeitRemainingCredit
            ),
        rejoinOrganisationMembership: (
            organisationId: number,
            membershipId: number,
            cardId?: number
        ) => api.rejoinOrganisationMembership(organisationId, membershipId, cardId),
        cancelOrganisationMembership: (
            organisationId: number,
            subscriptionId: number,
            reason?: string
        ) => api.cancelOrganisationMembership(organisationId, subscriptionId, reason),
        resolveOrganisationAction: (
            organisationId: number,
            actionId: number,
            decision: MembershipActionDecision,
            reason?: string
        ) => api.resolveOrganisationAction(organisationId, actionId, decision, reason),
        createOrganisationActionLink: (organisationId: number, actionId: number) =>
            api.createOrganisationActionLink(organisationId, actionId),
        previewAction: (token: string) => api.previewAction(token),
        resolvePublicAction: (token: string, decision: MembershipActionDecision, reason?: string) =>
            api.resolvePublicAction(token, decision, reason),
    }
}
