import type { CachedApiClient } from '../CachedApiClient'
import type { ApiResponse } from '~/types/api.types'
import type {
    Membership,
    MembershipActionDecision,
    MembershipActionLink,
    MembershipInput,
    MembershipProductBenefit,
    MembershipSubscription,
    MembershipSubscriptionOrder,
    MembershipSubscriber,
    MembershipRefundPreview,
    MembershipType,
    MembershipTypeInput,
    OrganisationMembershipInput,
    PublicMembershipAction,
} from '~/types/membership.types'

export class MembershipApiService {
    constructor(private readonly api: CachedApiClient) {}

    async getPlatformTypes(): Promise<ApiResponse<MembershipType[]>> {
        return await this.api.get(
            '/platform-membership-types',
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async checkPlatformGroupSlug(
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.api.get(
            '/platform-membership-types/slug-availability',
            { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
            undefined,
            undefined,
            true
        )
    }

    async checkPlatformMembershipSlug(
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.api.get(
            '/platform-memberships/slug-availability',
            { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
            undefined,
            undefined,
            true
        )
    }

    async createPlatformType(data: MembershipTypeInput): Promise<ApiResponse<MembershipType>> {
        return await this.api.post('/platform-membership-types', data, undefined, 'membership:.*')
    }

    async updatePlatformType(
        id: number,
        data: Partial<MembershipTypeInput>
    ): Promise<ApiResponse<MembershipType>> {
        return await this.api.put(
            `/platform-membership-types/${id}`,
            data,
            undefined,
            'membership:.*'
        )
    }

    async deletePlatformType(id: number): Promise<ApiResponse<void>> {
        return await this.api.delete(`/platform-membership-types/${id}`, undefined, 'membership:.*')
    }

    async getPlatformMemberships(): Promise<ApiResponse<Membership[]>> {
        return await this.api.get('/platform-memberships', undefined, undefined, undefined, true)
    }

    async getPlatformServiceSubscribers(
        membershipId: number
    ): Promise<ApiResponse<MembershipSubscriber[]>> {
        return await this.api.get(
            `/platform-memberships/${membershipId}/subscribers`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async createPlatformMembership(data: MembershipInput): Promise<ApiResponse<Membership>> {
        return await this.api.post('/platform-memberships', data, undefined, 'membership:.*')
    }

    async updatePlatformMembership(
        id: number,
        data: Partial<MembershipInput>
    ): Promise<ApiResponse<Membership>> {
        return await this.api.put(`/platform-memberships/${id}`, data, undefined, 'membership:.*')
    }

    async deletePlatformMembership(id: number): Promise<ApiResponse<void>> {
        return await this.api.delete(`/platform-memberships/${id}`, undefined, 'membership:.*')
    }

    async getOrganisationTypes(organisationId: number): Promise<ApiResponse<MembershipType[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/membership-types`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async checkOrganisationGroupSlug(
        organisationId: number,
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.api.get(
            `/organisations/${organisationId}/membership-types/slug-availability`,
            { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
            undefined,
            undefined,
            true
        )
    }

    async checkOrganisationMembershipSlug(
        organisationId: number,
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.api.get(
            `/organisations/${organisationId}/memberships/slug-availability`,
            { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
            undefined,
            undefined,
            true
        )
    }

    async createOrganisationType(
        organisationId: number,
        data: MembershipTypeInput
    ): Promise<ApiResponse<MembershipType>> {
        return await this.api.post(
            `/organisations/${organisationId}/membership-types`,
            data,
            undefined,
            'membership:.*'
        )
    }

    async updateOrganisationType(
        organisationId: number,
        id: number,
        data: Partial<MembershipTypeInput>
    ): Promise<ApiResponse<MembershipType>> {
        return await this.api.put(
            `/organisations/${organisationId}/membership-types/${id}`,
            data,
            undefined,
            'membership:.*'
        )
    }

    async deleteOrganisationType(organisationId: number, id: number): Promise<ApiResponse<void>> {
        return await this.api.delete(
            `/organisations/${organisationId}/membership-types/${id}`,
            undefined,
            'membership:.*'
        )
    }

    async getOrganisationMemberships(organisationId: number): Promise<ApiResponse<Membership[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/memberships`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async getMembershipProducts(
        organisationId: number,
        membershipId: number
    ): Promise<ApiResponse<MembershipProductBenefit[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/memberships/${membershipId}/products`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async createOrganisationMembership(
        organisationId: number,
        data: OrganisationMembershipInput
    ): Promise<ApiResponse<Membership>> {
        return await this.api.post(
            `/organisations/${organisationId}/memberships`,
            data,
            undefined,
            'membership:.*'
        )
    }

    async updateOrganisationMembership(
        organisationId: number,
        id: number,
        data: Partial<OrganisationMembershipInput>
    ): Promise<ApiResponse<Membership>> {
        return await this.api.put(
            `/organisations/${organisationId}/memberships/${id}`,
            data,
            undefined,
            'membership:.*'
        )
    }

    async deleteOrganisationMembership(
        organisationId: number,
        id: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.delete(
            `/organisations/${organisationId}/memberships/${id}`,
            undefined,
            'membership:.*'
        )
    }

    async getCustomerSubscriptions(
        organisationId: number,
        customerId?: number
    ): Promise<ApiResponse<MembershipSubscription[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/customer-membership-subscriptions`,
            {
                params: customerId ? { customerId } : undefined,
            },
            undefined,
            undefined,
            true
        )
    }

    async getMembershipMembers(
        organisationId: number,
        membershipId: number
    ): Promise<ApiResponse<MembershipSubscriber[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/memberships/${membershipId}/members`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async getCustomerMembershipOrders(
        organisationId: number,
        customerId?: number
    ): Promise<ApiResponse<MembershipSubscriptionOrder[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/customer-membership-orders`,
            { params: customerId ? { customerId } : undefined },
            undefined,
            undefined,
            true
        )
    }

    async getAvailablePlatformServices(organisationId: number): Promise<ApiResponse<Membership[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/platform-membership-subscriptions/services/available`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async getPlatformServiceOrders(
        organisationId: number
    ): Promise<ApiResponse<MembershipSubscriptionOrder[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/platform-membership-subscriptions/orders/list`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async previewSubscriptionRefund(
        audience: 'CUSTOMER' | 'ORGANISATION',
        organisationId: number,
        billingCycleId: number
    ): Promise<ApiResponse<MembershipRefundPreview>> {
        return await this.api.get(
            audience === 'CUSTOMER'
                ? `/organisations/${organisationId}/customer-membership-orders/${billingCycleId}/refund-preview`
                : `/organisations/${organisationId}/platform-membership-subscriptions/orders/${billingCycleId}/refund-preview`
        )
    }

    async refundSubscriptionOrder(
        audience: 'CUSTOMER' | 'ORGANISATION',
        organisationId: number,
        billingCycleId: number,
        refundType: 'FULL' | 'PARTIAL',
        amount?: number,
        reason?: string
    ): Promise<ApiResponse<MembershipSubscriptionOrder>> {
        const url =
            audience === 'CUSTOMER'
                ? `/organisations/${organisationId}/customer-membership-orders/${billingCycleId}/refund`
                : `/organisations/${organisationId}/platform-membership-subscriptions/orders/${billingCycleId}/refund`
        return await this.api.post(
            url,
            { refundType, amount, reason, idempotencyKey: crypto.randomUUID() },
            undefined,
            'membership:.*'
        )
    }

    async getCustomerSubscription(
        organisationId: number,
        id: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.get(
            `/organisations/${organisationId}/customer-membership-subscriptions/${id}`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async joinCustomerMembership(
        organisationId: number,
        customerId: number,
        membershipId: number,
        customerCreditCardId?: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.post(
            `/organisations/${organisationId}/customers/${customerId}/membership-subscriptions/join`,
            {
                membershipId,
                customerCreditCardId,
                idempotencyKey: crypto.randomUUID(),
            },
            undefined,
            'membership:.*'
        )
    }

    async upgradeCustomerMembership(
        organisationId: number,
        customerId: number,
        subscriptionId: number,
        membershipId: number,
        customerCreditCardId?: number,
        reason?: string
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.changeCustomerMembership(
            'upgrade',
            organisationId,
            customerId,
            subscriptionId,
            membershipId,
            customerCreditCardId,
            reason
        )
    }

    async downgradeCustomerMembership(
        organisationId: number,
        customerId: number,
        subscriptionId: number,
        membershipId: number,
        customerCreditCardId?: number,
        reason?: string,
        effectiveImmediately?: boolean,
        forfeitRemainingCredit?: boolean
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.changeCustomerMembership(
            'downgrade',
            organisationId,
            customerId,
            subscriptionId,
            membershipId,
            customerCreditCardId,
            reason,
            effectiveImmediately,
            forfeitRemainingCredit
        )
    }

    async rejoinCustomerMembership(
        organisationId: number,
        customerId: number,
        membershipId: number,
        customerCreditCardId?: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.post(
            `/organisations/${organisationId}/customers/${customerId}/membership-subscriptions/rejoin`,
            {
                membershipId,
                customerCreditCardId,
                idempotencyKey: crypto.randomUUID(),
            },
            undefined,
            'membership:.*'
        )
    }

    async cancelCustomerMembership(
        organisationId: number,
        subscriptionId: number,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.api.post(
            `/organisations/${organisationId}/customer-membership-subscriptions/${subscriptionId}/cancel`,
            { reason },
            undefined,
            'membership:.*'
        )
    }

    async resolveCustomerAction(
        organisationId: number,
        actionId: number,
        decision: MembershipActionDecision,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.api.post(
            `/organisations/${organisationId}/customer-membership-actions/${actionId}/resolve`,
            { decision, reason },
            undefined,
            'membership:.*'
        )
    }

    async createCustomerActionLink(
        organisationId: number,
        actionId: number
    ): Promise<ApiResponse<MembershipActionLink>> {
        return await this.api.post(
            `/organisations/${organisationId}/customer-membership-actions/${actionId}/link`
        )
    }

    async getOrganisationSubscriptions(
        organisationId: number
    ): Promise<ApiResponse<MembershipSubscription[]>> {
        return await this.api.get(
            `/organisations/${organisationId}/platform-membership-subscriptions`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async getOrganisationSubscription(
        organisationId: number,
        subscriptionId: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.get(
            `/organisations/${organisationId}/platform-membership-subscriptions/${subscriptionId}`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async joinOrganisationMembership(
        organisationId: number,
        membershipId: number,
        organisationCreditCardId?: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.post(
            `/organisations/${organisationId}/platform-membership-subscriptions/join`,
            {
                membershipId,
                organisationCreditCardId,
                idempotencyKey: crypto.randomUUID(),
            },
            undefined,
            'membership:.*'
        )
    }

    async upgradeOrganisationMembership(
        organisationId: number,
        subscriptionId: number,
        membershipId: number,
        organisationCreditCardId?: number,
        reason?: string
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.changeOrganisationMembership(
            'upgrade',
            organisationId,
            subscriptionId,
            membershipId,
            organisationCreditCardId,
            reason
        )
    }

    async downgradeOrganisationMembership(
        organisationId: number,
        subscriptionId: number,
        membershipId: number,
        organisationCreditCardId?: number,
        reason?: string,
        effectiveImmediately?: boolean,
        forfeitRemainingCredit?: boolean
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.changeOrganisationMembership(
            'downgrade',
            organisationId,
            subscriptionId,
            membershipId,
            organisationCreditCardId,
            reason,
            effectiveImmediately,
            forfeitRemainingCredit
        )
    }

    async rejoinOrganisationMembership(
        organisationId: number,
        membershipId: number,
        organisationCreditCardId?: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.post(
            `/organisations/${organisationId}/platform-membership-subscriptions/rejoin`,
            { membershipId, organisationCreditCardId, idempotencyKey: crypto.randomUUID() },
            undefined,
            'membership:.*'
        )
    }

    async cancelOrganisationMembership(
        organisationId: number,
        subscriptionId: number,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.api.post(
            `/organisations/${organisationId}/platform-membership-subscriptions/${subscriptionId}/cancel`,
            { reason },
            undefined,
            'membership:.*'
        )
    }

    async resolveOrganisationAction(
        organisationId: number,
        actionId: number,
        decision: MembershipActionDecision,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.api.post(
            `/organisations/${organisationId}/platform-membership-subscriptions/actions/${actionId}/resolve`,
            { decision, reason },
            undefined,
            'membership:.*'
        )
    }

    async createOrganisationActionLink(
        organisationId: number,
        actionId: number
    ): Promise<ApiResponse<MembershipActionLink>> {
        return await this.api.post(
            `/organisations/${organisationId}/organisation-membership-actions/${actionId}/link`
        )
    }

    async previewAction(token: string): Promise<ApiResponse<PublicMembershipAction>> {
        return await this.api.get(
            `/membership-actions/${encodeURIComponent(token)}`,
            undefined,
            undefined,
            undefined,
            true
        )
    }

    async resolvePublicAction(
        token: string,
        decision: MembershipActionDecision,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.api.post(`/membership-actions/${encodeURIComponent(token)}/resolve`, {
            decision,
            reason,
        })
    }

    private async changeCustomerMembership(
        action: 'upgrade' | 'downgrade',
        organisationId: number,
        customerId: number,
        subscriptionId: number,
        membershipId: number,
        customerCreditCardId?: number,
        reason?: string,
        effectiveImmediately?: boolean,
        forfeitRemainingCredit?: boolean
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.post(
            `/organisations/${organisationId}/customers/${customerId}/membership-subscriptions/${action}`,
            {
                subscriptionId,
                membershipId,
                customerCreditCardId,
                reason,
                effectiveImmediately,
                forfeitRemainingCredit,
                idempotencyKey: crypto.randomUUID(),
            },
            undefined,
            'membership:.*'
        )
    }

    private async changeOrganisationMembership(
        action: 'upgrade' | 'downgrade',
        organisationId: number,
        subscriptionId: number,
        membershipId: number,
        organisationCreditCardId?: number,
        reason?: string,
        effectiveImmediately?: boolean,
        forfeitRemainingCredit?: boolean
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.api.post(
            `/organisations/${organisationId}/platform-membership-subscriptions/${action}`,
            {
                subscriptionId,
                membershipId,
                organisationCreditCardId,
                reason,
                effectiveImmediately,
                forfeitRemainingCredit,
                idempotencyKey: crypto.randomUUID(),
            },
            undefined,
            'membership:.*'
        )
    }
}
