import type { MembershipApiService } from '~/services/api/wrappers/membership.api'
import { useMembershipStore } from '~/stores/membership.store'
import type {
    Membership,
    MembershipActionDecision,
    MembershipInput,
    MembershipSubscription,
    MembershipTypeInput,
    OrganisationMembershipInput,
} from '~/types/membership.types'
import type { CategoryApiService } from '~/services/api/wrappers/category.api'
import type { OrganisationProductApiService } from '~/services/api/wrappers/organisation-product.api'
import type { OrganisationCreditCardApiService } from '~/services/api/wrappers/organisation-credit-card.api'
import type { CustomerCreditCardApiService } from '~/services/api/wrappers/customer-credit-card.api'
import type { CustomerCreditCard } from '~/services/api/wrappers/customer-credit-card.api'
import type { OrganisationCreditCard } from '~/types/organisation-credit-card.types'

type MembershipApiActions = Omit<
    MembershipApiService,
    | 'getPlatformTypes'
    | 'checkPlatformGroupSlug'
    | 'checkPlatformMembershipSlug'
    | 'getPlatformMemberships'
    | 'getOrganisationTypes'
    | 'checkOrganisationGroupSlug'
    | 'checkOrganisationMembershipSlug'
    | 'getOrganisationMemberships'
    | 'getAvailablePlatformServices'
    | 'getOrganisationSubscriptions'
    | 'changeCustomerMembership'
    | 'changeOrganisationMembership'
>

interface MembershipsComposable extends MembershipApiActions {
    store: ReturnType<typeof useMembershipStore>
    loadPlatform: () => Promise<void>
    loadOrganisation: (organisationId: number) => Promise<void>
    loadCustomerSubscriptions: (organisationId: number, customerId: number) => Promise<void>
    loadOrganisationFormOptions: (organisationId: number) => Promise<{
        categories: Array<{ title: string; value: number }>
        products: Array<{ title: string; value: number }>
    }>
    loadOrganisationSubscriptionOptions: (organisationId: number) => Promise<{
        memberships: Membership[]
        cards: OrganisationCreditCard[]
        subscriptions: MembershipSubscription[]
    }>
    loadCustomerMembershipOptions: (
        organisationId: number,
        customerId: number
    ) => Promise<{
        memberships: Membership[]
        cards: CustomerCreditCard[]
        subscriptions: MembershipSubscription[]
    }>
    checkMembershipSlugAvailability: (options: {
        scope: 'PLATFORM' | 'ORGANISATION'
        entity: 'GROUP' | 'MEMBERSHIP'
        slug: string
        organisationId?: number
        excludeId?: number
    }) => Promise<boolean>
}

export const useMemberships = (): MembershipsComposable => {
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

    const loadOrganisationFormOptions = async (
        organisationId: number
    ): Promise<{
        categories: { title: string; value: number }[]
        products: { title: string; value: number }[]
    }> => {
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

    const loadOrganisationSubscriptionOptions = async (
        organisationId: number
    ): Promise<{
        memberships: import('~/types/membership.types').Membership[]
        cards: import('~/types/organisation-credit-card.types').OrganisationCreditCard[]
        subscriptions: import('~/types/membership.types').MembershipSubscription[]
    }> => {
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

    const loadCustomerMembershipOptions = async (
        organisationId: number,
        customerId: number
    ): Promise<{
        memberships: import('~/types/membership.types').Membership[]
        cards: import('~/services/api/wrappers/customer-credit-card.api').CustomerCreditCard[]
        subscriptions: import('~/types/membership.types').MembershipSubscription[]
    }> => {
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

    const checkMembershipSlugAvailability = async (options: {
        scope: 'PLATFORM' | 'ORGANISATION'
        entity: 'GROUP' | 'MEMBERSHIP'
        slug: string
        organisationId?: number
        excludeId?: number
    }): Promise<boolean> => {
        const { scope, entity, slug, organisationId, excludeId } = options
        if (scope === 'ORGANISATION' && organisationId === undefined) {
            throw new Error('Organisation is required to check membership slug availability')
        }

        const response =
            scope === 'PLATFORM'
                ? entity === 'GROUP'
                    ? await api.checkPlatformGroupSlug(slug, excludeId)
                    : await api.checkPlatformMembershipSlug(slug, excludeId)
                : entity === 'GROUP'
                  ? await api.checkOrganisationGroupSlug(organisationId!, slug, excludeId)
                  : await api.checkOrganisationMembershipSlug(organisationId!, slug, excludeId)

        return response.data?.available ?? false
    }

    return {
        store,
        loadPlatform,
        loadOrganisation,
        loadCustomerSubscriptions,
        loadOrganisationFormOptions,
        loadOrganisationSubscriptionOptions,
        loadCustomerMembershipOptions,
        checkMembershipSlugAvailability,
        createPlatformType: (
            data: MembershipTypeInput
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipType
            >
        > => api.createPlatformType(data),
        updatePlatformType: (
            id: number,
            data: Partial<MembershipTypeInput>
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipType
            >
        > => api.updatePlatformType(id, data),
        deletePlatformType: (id: number): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.deletePlatformType(id),
        createPlatformMembership: (
            data: MembershipInput
        ): Promise<
            import('@/types/api.types').ApiResponse<import('@/types/membership.types').Membership>
        > => api.createPlatformMembership(data),
        updatePlatformMembership: (
            id: number,
            data: Partial<MembershipInput>
        ): Promise<
            import('@/types/api.types').ApiResponse<import('@/types/membership.types').Membership>
        > => api.updatePlatformMembership(id, data),
        deletePlatformMembership: (
            id: number
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.deletePlatformMembership(id),
        createOrganisationType: (
            organisationId: number,
            data: MembershipTypeInput
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipType
            >
        > => api.createOrganisationType(organisationId, data),
        updateOrganisationType: (
            organisationId: number,
            id: number,
            data: Partial<MembershipTypeInput>
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipType
            >
        > => api.updateOrganisationType(organisationId, id, data),
        deleteOrganisationType: (
            organisationId: number,
            id: number
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.deleteOrganisationType(organisationId, id),
        createOrganisationMembership: (
            organisationId: number,
            data: OrganisationMembershipInput
        ): Promise<
            import('@/types/api.types').ApiResponse<import('@/types/membership.types').Membership>
        > => api.createOrganisationMembership(organisationId, data),
        updateOrganisationMembership: (
            organisationId: number,
            id: number,
            data: Partial<OrganisationMembershipInput>
        ): Promise<
            import('@/types/api.types').ApiResponse<import('@/types/membership.types').Membership>
        > => api.updateOrganisationMembership(organisationId, id, data),
        deleteOrganisationMembership: (
            organisationId: number,
            id: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.deleteOrganisationMembership(organisationId, id),
        joinCustomerMembership: (
            organisationId: number,
            customerId: number,
            membershipId: number,
            cardId?: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.joinCustomerMembership(organisationId, customerId, membershipId, cardId),
        upgradeCustomerMembership: (
            organisationId: number,
            customerId: number,
            subscriptionId: number,
            membershipId: number,
            cardId?: number,
            reason?: string
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > =>
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
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > =>
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
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.rejoinCustomerMembership(organisationId, customerId, membershipId, cardId),
        cancelCustomerMembership: (
            organisationId: number,
            subscriptionId: number,
            reason?: string
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.cancelCustomerMembership(organisationId, subscriptionId, reason),
        resolveCustomerAction: (
            organisationId: number,
            actionId: number,
            decision: MembershipActionDecision,
            reason?: string
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.resolveCustomerAction(organisationId, actionId, decision, reason),
        createCustomerActionLink: (
            organisationId: number,
            actionId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipActionLink
            >
        > => api.createCustomerActionLink(organisationId, actionId),
        getCustomerSubscription: (
            organisationId: number,
            id: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.getCustomerSubscription(organisationId, id),
        getCustomerSubscriptions: (
            organisationId: number,
            customerId?: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription[]
            >
        > => api.getCustomerSubscriptions(organisationId, customerId),
        getMembershipProducts: (
            organisationId: number,
            membershipId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipProductBenefit[]
            >
        > => api.getMembershipProducts(organisationId, membershipId),
        getMembershipMembers: (
            organisationId: number,
            membershipId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscriber[]
            >
        > => api.getMembershipMembers(organisationId, membershipId),
        getPlatformServiceSubscribers: (
            membershipId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscriber[]
            >
        > => api.getPlatformServiceSubscribers(membershipId),
        getCustomerMembershipOrders: (
            organisationId: number,
            customerId?: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscriptionOrder[]
            >
        > => api.getCustomerMembershipOrders(organisationId, customerId),
        getPlatformServiceOrders: (
            organisationId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscriptionOrder[]
            >
        > => api.getPlatformServiceOrders(organisationId),
        previewSubscriptionRefund: (
            audience: 'CUSTOMER' | 'ORGANISATION',
            organisationId: number,
            billingCycleId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipRefundPreview
            >
        > => api.previewSubscriptionRefund(audience, organisationId, billingCycleId),
        refundSubscriptionOrder: (
            audience: 'CUSTOMER' | 'ORGANISATION',
            organisationId: number,
            billingCycleId: number,
            refundType: 'FULL' | 'PARTIAL',
            amount?: number,
            reason?: string
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscriptionOrder
            >
        > =>
            api.refundSubscriptionOrder(
                audience,
                organisationId,
                billingCycleId,
                refundType,
                amount,
                reason
            ),
        getOrganisationSubscription: (
            organisationId: number,
            id: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.getOrganisationSubscription(organisationId, id),
        joinOrganisationMembership: (
            organisationId: number,
            membershipId: number,
            cardId?: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.joinOrganisationMembership(organisationId, membershipId, cardId),
        upgradeOrganisationMembership: (
            organisationId: number,
            subscriptionId: number,
            membershipId: number,
            cardId?: number,
            reason?: string
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > =>
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
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > =>
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
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipSubscription
            >
        > => api.rejoinOrganisationMembership(organisationId, membershipId, cardId),
        cancelOrganisationMembership: (
            organisationId: number,
            subscriptionId: number,
            reason?: string
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.cancelOrganisationMembership(organisationId, subscriptionId, reason),
        resolveOrganisationAction: (
            organisationId: number,
            actionId: number,
            decision: MembershipActionDecision,
            reason?: string
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.resolveOrganisationAction(organisationId, actionId, decision, reason),
        createOrganisationActionLink: (
            organisationId: number,
            actionId: number
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').MembershipActionLink
            >
        > => api.createOrganisationActionLink(organisationId, actionId),
        previewAction: (
            token: string
        ): Promise<
            import('@/types/api.types').ApiResponse<
                import('@/types/membership.types').PublicMembershipAction
            >
        > => api.previewAction(token),
        resolvePublicAction: (
            token: string,
            decision: MembershipActionDecision,
            reason?: string
        ): Promise<import('@/types/api.types').ApiResponse<void>> =>
            api.resolvePublicAction(token, decision, reason),
    }
}
