import HttpFactory from '@/repository/factory'
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

export class MembershipApiService extends HttpFactory {
    async getPlatformTypes(): Promise<ApiResponse<MembershipType[]>> {
        return await this.call<MembershipType[]>('GET', '/platform-membership-types', undefined, {
            skipCache: true,
        })
    }

    async checkPlatformGroupSlug(
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.call<{ available: boolean }>(
            'GET',
            '/platform-membership-types/slug-availability',
            undefined,
            {
                config: { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
                skipCache: true,
            }
        )
    }

    async checkPlatformMembershipSlug(
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.call<{ available: boolean }>(
            'GET',
            '/platform-memberships/slug-availability',
            undefined,
            {
                config: { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
                skipCache: true,
            }
        )
    }

    async createPlatformType(data: MembershipTypeInput): Promise<ApiResponse<MembershipType>> {
        return await this.call<MembershipType, MembershipTypeInput>(
            'POST',
            '/platform-membership-types',
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async updatePlatformType(
        id: number,
        data: Partial<MembershipTypeInput>
    ): Promise<ApiResponse<MembershipType>> {
        return await this.call<MembershipType, Partial<MembershipTypeInput>>(
            'PUT',
            `/platform-membership-types/${id}`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async deletePlatformType(id: number): Promise<ApiResponse<void>> {
        return await this.call<void>('DELETE', `/platform-membership-types/${id}`, undefined, {
            invalidatePattern: 'membership:.*',
        })
    }

    async getPlatformMemberships(): Promise<ApiResponse<Membership[]>> {
        return await this.call<Membership[]>('GET', '/platform-memberships', undefined, {
            skipCache: true,
        })
    }

    async getPlatformServiceSubscribers(
        membershipId: number
    ): Promise<ApiResponse<MembershipSubscriber[]>> {
        return await this.call<MembershipSubscriber[]>(
            'GET',
            `/platform-memberships/${membershipId}/subscribers`,
            undefined,
            { skipCache: true }
        )
    }

    async createPlatformMembership(data: MembershipInput): Promise<ApiResponse<Membership>> {
        return await this.call<Membership, MembershipInput>(
            'POST',
            '/platform-memberships',
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async updatePlatformMembership(
        id: number,
        data: Partial<MembershipInput>
    ): Promise<ApiResponse<Membership>> {
        return await this.call<Membership, Partial<MembershipInput>>(
            'PUT',
            `/platform-memberships/${id}`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async deletePlatformMembership(id: number): Promise<ApiResponse<void>> {
        return await this.call<void>('DELETE', `/platform-memberships/${id}`, undefined, {
            invalidatePattern: 'membership:.*',
        })
    }

    async getOrganisationTypes(organisationId: number): Promise<ApiResponse<MembershipType[]>> {
        return await this.call<MembershipType[]>(
            'GET',
            `/organisations/${organisationId}/membership-types`,
            undefined,
            { skipCache: true }
        )
    }

    async checkOrganisationGroupSlug(
        organisationId: number,
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.call<{ available: boolean }>(
            'GET',
            `/organisations/${organisationId}/membership-types/slug-availability`,
            undefined,
            {
                config: { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
                skipCache: true,
            }
        )
    }

    async checkOrganisationMembershipSlug(
        organisationId: number,
        slug: string,
        excludeId?: number
    ): Promise<ApiResponse<{ available: boolean }>> {
        return await this.call<{ available: boolean }>(
            'GET',
            `/organisations/${organisationId}/memberships/slug-availability`,
            undefined,
            {
                config: { params: { slug, ...(excludeId === undefined ? {} : { excludeId }) } },
                skipCache: true,
            }
        )
    }

    async createOrganisationType(
        organisationId: number,
        data: MembershipTypeInput
    ): Promise<ApiResponse<MembershipType>> {
        return await this.call<MembershipType, MembershipTypeInput>(
            'POST',
            `/organisations/${organisationId}/membership-types`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async updateOrganisationType(
        organisationId: number,
        id: number,
        data: Partial<MembershipTypeInput>
    ): Promise<ApiResponse<MembershipType>> {
        return await this.call<MembershipType, Partial<MembershipTypeInput>>(
            'PUT',
            `/organisations/${organisationId}/membership-types/${id}`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async deleteOrganisationType(organisationId: number, id: number): Promise<ApiResponse<void>> {
        return await this.call<void>(
            'DELETE',
            `/organisations/${organisationId}/membership-types/${id}`,
            undefined,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async getOrganisationMemberships(organisationId: number): Promise<ApiResponse<Membership[]>> {
        return await this.call<Membership[]>(
            'GET',
            `/organisations/${organisationId}/memberships`,
            undefined,
            { skipCache: true }
        )
    }

    async getMembershipProducts(
        organisationId: number,
        membershipId: number
    ): Promise<ApiResponse<MembershipProductBenefit[]>> {
        return await this.call<MembershipProductBenefit[]>(
            'GET',
            `/organisations/${organisationId}/memberships/${membershipId}/products`,
            undefined,
            { skipCache: true }
        )
    }

    async createOrganisationMembership(
        organisationId: number,
        data: OrganisationMembershipInput
    ): Promise<ApiResponse<Membership>> {
        return await this.call<Membership, OrganisationMembershipInput>(
            'POST',
            `/organisations/${organisationId}/memberships`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async updateOrganisationMembership(
        organisationId: number,
        id: number,
        data: Partial<OrganisationMembershipInput>
    ): Promise<ApiResponse<Membership>> {
        return await this.call<Membership, Partial<OrganisationMembershipInput>>(
            'PUT',
            `/organisations/${organisationId}/memberships/${id}`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async deleteOrganisationMembership(
        organisationId: number,
        id: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.call<MembershipSubscription>(
            'DELETE',
            `/organisations/${organisationId}/memberships/${id}`,
            undefined,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async getCustomerSubscriptions(
        organisationId: number,
        customerId?: number
    ): Promise<ApiResponse<MembershipSubscription[]>> {
        return await this.call<MembershipSubscription[]>(
            'GET',
            `/organisations/${organisationId}/customer-membership-subscriptions`,
            undefined,
            {
                config: { params: customerId ? { customerId } : undefined },
                skipCache: true,
            }
        )
    }

    async getMembershipMembers(
        organisationId: number,
        membershipId: number
    ): Promise<ApiResponse<MembershipSubscriber[]>> {
        return await this.call<MembershipSubscriber[]>(
            'GET',
            `/organisations/${organisationId}/memberships/${membershipId}/members`,
            undefined,
            { skipCache: true }
        )
    }

    async getCustomerMembershipOrders(
        organisationId: number,
        customerId?: number
    ): Promise<ApiResponse<MembershipSubscriptionOrder[]>> {
        return await this.call<MembershipSubscriptionOrder[]>(
            'GET',
            `/organisations/${organisationId}/customer-membership-orders`,
            undefined,
            {
                config: { params: customerId ? { customerId } : undefined },
                skipCache: true,
            }
        )
    }

    async getAvailablePlatformServices(organisationId: number): Promise<ApiResponse<Membership[]>> {
        return await this.call<Membership[]>(
            'GET',
            `/organisations/${organisationId}/platform-membership-subscriptions/services/available`,
            undefined,
            { skipCache: true }
        )
    }

    async getPlatformServiceOrders(
        organisationId: number
    ): Promise<ApiResponse<MembershipSubscriptionOrder[]>> {
        return await this.call<MembershipSubscriptionOrder[]>(
            'GET',
            `/organisations/${organisationId}/platform-membership-subscriptions/orders/list`,
            undefined,
            { skipCache: true }
        )
    }

    async previewSubscriptionRefund(
        audience: 'CUSTOMER' | 'ORGANISATION',
        organisationId: number,
        billingCycleId: number
    ): Promise<ApiResponse<MembershipRefundPreview>> {
        return await this.call<MembershipRefundPreview>(
            'GET',
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
        const data = { refundType, amount, reason, idempotencyKey: crypto.randomUUID() }
        return await this.call<MembershipSubscriptionOrder, typeof data>(
            'POST',
            url,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async getCustomerSubscription(
        organisationId: number,
        id: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.call<MembershipSubscription>(
            'GET',
            `/organisations/${organisationId}/customer-membership-subscriptions/${id}`,
            undefined,
            { skipCache: true }
        )
    }

    async joinCustomerMembership(
        organisationId: number,
        customerId: number,
        membershipId: number,
        customerCreditCardId?: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        const data = {
            membershipId,
            customerCreditCardId,
            idempotencyKey: crypto.randomUUID(),
        }
        return await this.call<MembershipSubscription, typeof data>(
            'POST',
            `/organisations/${organisationId}/customers/${customerId}/membership-subscriptions/join`,
            data,
            { invalidatePattern: 'membership:.*' }
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
        const data = {
            membershipId,
            customerCreditCardId,
            idempotencyKey: crypto.randomUUID(),
        }
        return await this.call<MembershipSubscription, typeof data>(
            'POST',
            `/organisations/${organisationId}/customers/${customerId}/membership-subscriptions/rejoin`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async cancelCustomerMembership(
        organisationId: number,
        subscriptionId: number,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void, { reason?: string }>(
            'POST',
            `/organisations/${organisationId}/customer-membership-subscriptions/${subscriptionId}/cancel`,
            { reason },
            { invalidatePattern: 'membership:.*' }
        )
    }

    async resolveCustomerAction(
        organisationId: number,
        actionId: number,
        decision: MembershipActionDecision,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void, { decision: MembershipActionDecision; reason?: string }>(
            'POST',
            `/organisations/${organisationId}/customer-membership-actions/${actionId}/resolve`,
            { decision, reason },
            { invalidatePattern: 'membership:.*' }
        )
    }

    async createCustomerActionLink(
        organisationId: number,
        actionId: number
    ): Promise<ApiResponse<MembershipActionLink>> {
        return await this.call<MembershipActionLink>(
            'POST',
            `/organisations/${organisationId}/customer-membership-actions/${actionId}/link`
        )
    }

    async getOrganisationSubscriptions(
        organisationId: number
    ): Promise<ApiResponse<MembershipSubscription[]>> {
        return await this.call<MembershipSubscription[]>(
            'GET',
            `/organisations/${organisationId}/platform-membership-subscriptions`,
            undefined,
            { skipCache: true }
        )
    }

    async getOrganisationSubscription(
        organisationId: number,
        subscriptionId: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        return await this.call<MembershipSubscription>(
            'GET',
            `/organisations/${organisationId}/platform-membership-subscriptions/${subscriptionId}`,
            undefined,
            { skipCache: true }
        )
    }

    async joinOrganisationMembership(
        organisationId: number,
        membershipId: number,
        organisationCreditCardId?: number
    ): Promise<ApiResponse<MembershipSubscription>> {
        const data = {
            membershipId,
            organisationCreditCardId,
            idempotencyKey: crypto.randomUUID(),
        }
        return await this.call<MembershipSubscription, typeof data>(
            'POST',
            `/organisations/${organisationId}/platform-membership-subscriptions/join`,
            data,
            { invalidatePattern: 'membership:.*' }
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
        const data = {
            membershipId,
            organisationCreditCardId,
            idempotencyKey: crypto.randomUUID(),
        }
        return await this.call<MembershipSubscription, typeof data>(
            'POST',
            `/organisations/${organisationId}/platform-membership-subscriptions/rejoin`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }

    async cancelOrganisationMembership(
        organisationId: number,
        subscriptionId: number,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void, { reason?: string }>(
            'POST',
            `/organisations/${organisationId}/platform-membership-subscriptions/${subscriptionId}/cancel`,
            { reason },
            { invalidatePattern: 'membership:.*' }
        )
    }

    async resolveOrganisationAction(
        organisationId: number,
        actionId: number,
        decision: MembershipActionDecision,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void, { decision: MembershipActionDecision; reason?: string }>(
            'POST',
            `/organisations/${organisationId}/platform-membership-subscriptions/actions/${actionId}/resolve`,
            { decision, reason },
            { invalidatePattern: 'membership:.*' }
        )
    }

    async createOrganisationActionLink(
        organisationId: number,
        actionId: number
    ): Promise<ApiResponse<MembershipActionLink>> {
        return await this.call<MembershipActionLink>(
            'POST',
            `/organisations/${organisationId}/organisation-membership-actions/${actionId}/link`
        )
    }

    async previewAction(token: string): Promise<ApiResponse<PublicMembershipAction>> {
        return await this.call<PublicMembershipAction>(
            'GET',
            `/membership-actions/${encodeURIComponent(token)}`,
            undefined,
            { skipCache: true }
        )
    }

    async resolvePublicAction(
        token: string,
        decision: MembershipActionDecision,
        reason?: string
    ): Promise<ApiResponse<void>> {
        return await this.call<void, { decision: MembershipActionDecision; reason?: string }>(
            'POST',
            `/membership-actions/${encodeURIComponent(token)}/resolve`,
            { decision, reason }
        )
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
        const data = {
            subscriptionId,
            membershipId,
            customerCreditCardId,
            reason,
            effectiveImmediately,
            forfeitRemainingCredit,
            idempotencyKey: crypto.randomUUID(),
        }
        return await this.call<MembershipSubscription, typeof data>(
            'POST',
            `/organisations/${organisationId}/customers/${customerId}/membership-subscriptions/${action}`,
            data,
            { invalidatePattern: 'membership:.*' }
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
        const data = {
            subscriptionId,
            membershipId,
            organisationCreditCardId,
            reason,
            effectiveImmediately,
            forfeitRemainingCredit,
            idempotencyKey: crypto.randomUUID(),
        }
        return await this.call<MembershipSubscription, typeof data>(
            'POST',
            `/organisations/${organisationId}/platform-membership-subscriptions/${action}`,
            data,
            { invalidatePattern: 'membership:.*' }
        )
    }
}

export default MembershipApiService
