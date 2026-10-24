import type { Membership, MembershipSubscription } from '~/types/membership.types'
import { calculateMembershipProration } from '~/utils/membership.util'

export type MembershipBatchOperation =
    | 'KEEP'
    | 'JOIN'
    | 'REJOIN'
    | 'UPGRADE'
    | 'DOWNGRADE'
    | 'CANCEL'

export interface MembershipBatchGroup {
    id: number
    name: string
    memberships: Membership[]
    subscription?: MembershipSubscription
}

export interface MembershipBatchBreakdown {
    operation: MembershipBatchOperation
    existingPriceAmount: number
    newPriceAmount: number
    unusedCreditAmount: number
    creditDiscountApplied: number
    forfeitedCreditAmount: number
    finalAmountCharged: number
    effectiveAt: string
}

export function groupMembershipOptions(
    memberships: Membership[],
    subscriptions: MembershipSubscription[]
): MembershipBatchGroup[] {
    const groups = new Map<number, MembershipBatchGroup>()
    for (const membership of memberships) {
        const group = groups.get(membership.membershipTypeId) ?? {
            id: membership.membershipTypeId,
            name: membership.membershipGroupName,
            memberships: [],
        }
        group.memberships.push(membership)
        groups.set(group.id, group)
    }
    for (const subscription of subscriptions) {
        const group = groups.get(subscription.membershipTypeId) ?? {
            id: subscription.membershipTypeId,
            name:
                subscription.membershipGroupName ||
                `Membership group ${subscription.membershipTypeId}`,
            memberships: [],
        }
        group.subscription = subscription
        groups.set(group.id, group)
    }
    return [...groups.values()]
        .map((group) => ({
            ...group,
            memberships: [...group.memberships].sort(
                (left, right) => left.tierRank - right.tierRank
            ),
        }))
        .sort((left, right) => left.name.localeCompare(right.name))
}

export function membershipBatchOperation(
    group: MembershipBatchGroup,
    selection: number | 'CANCEL' | undefined
): MembershipBatchOperation {
    const subscription = group.subscription
    if (selection === 'CANCEL') return subscription?.status === 'ACTIVE' ? 'CANCEL' : 'KEEP'
    if (!selection) return 'KEEP'
    const target = group.memberships.find((membership) => membership.id === selection)
    if (!target) return 'KEEP'
    if (!subscription) return 'JOIN'
    if (subscription.status === 'CANCELLED') return 'REJOIN'
    if (subscription.status !== 'ACTIVE' || target.id === subscription.membershipId) return 'KEEP'
    if (target.membershipTypeId !== subscription.membershipTypeId) return 'KEEP'
    if (target.tierRank > subscription.tierRank) return 'UPGRADE'
    if (target.tierRank < subscription.tierRank) return 'DOWNGRADE'
    return 'KEEP'
}

export function membershipBatchBreakdown(
    group: MembershipBatchGroup,
    selection: number | 'CANCEL' | undefined,
    downgradeImmediately: boolean,
    calculatedAt: Date = new Date()
): MembershipBatchBreakdown {
    const operation = membershipBatchOperation(group, selection)
    const current = group.subscription
    const target =
        typeof selection === 'number'
            ? group.memberships.find((membership) => membership.id === selection)
            : undefined
    const base: MembershipBatchBreakdown = {
        operation,
        existingPriceAmount: current?.priceAmount ?? 0,
        newPriceAmount: target?.priceAmount ?? 0,
        unusedCreditAmount: 0,
        creditDiscountApplied: 0,
        forfeitedCreditAmount: 0,
        finalAmountCharged: 0,
        effectiveAt: 'No change',
    }

    if (operation === 'JOIN' || operation === 'REJOIN') {
        return {
            ...base,
            finalAmountCharged: target?.priceAmount ?? 0,
            effectiveAt: 'Immediately',
        }
    }
    if (operation === 'CANCEL') {
        return { ...base, effectiveAt: current?.currentPeriodEnd ? 'At period end' : 'Immediately' }
    }
    if (operation === 'DOWNGRADE' && !downgradeImmediately) {
        return { ...base, effectiveAt: 'At next renewal' }
    }
    if (
        (operation === 'UPGRADE' || operation === 'DOWNGRADE') &&
        current?.currentPeriodEnd &&
        target
    ) {
        const proration = calculateMembershipProration(
            current.priceAmount,
            target.priceAmount,
            current.currentPeriodStart,
            current.currentPeriodEnd,
            calculatedAt
        )
        return {
            ...base,
            ...proration,
            forfeitedCreditAmount: operation === 'DOWNGRADE' ? proration.remainingCreditAmount : 0,
            effectiveAt: 'Immediately',
        }
    }
    return base
}
