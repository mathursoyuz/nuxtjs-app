import type { MembershipDiscountType } from '~/types/membership.types'

export const membershipMoneyToMinorUnits = (value: number): number => Math.round(value * 100)
export const membershipMoneyFromMinorUnits = (value: number): number => value / 100

export const membershipDiscountToStorage = (type: MembershipDiscountType, value: number): number =>
    type === 'PERCENTAGE' ? Math.round(value * 100) : membershipMoneyToMinorUnits(value)

export const membershipDiscountFromStorage = (
    type: MembershipDiscountType,
    value: number
): number => (type === 'PERCENTAGE' ? value / 100 : membershipMoneyFromMinorUnits(value))

export const formatMembershipMoney = (amount: number): string =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount / 100)

export interface MembershipProrationPreview {
    unusedCreditAmount: number
    creditDiscountApplied: number
    remainingCreditAmount: number
    finalAmountCharged: number
}

export function calculateMembershipProration(
    existingPriceAmount: number,
    newPriceAmount: number,
    periodStart: string,
    periodEnd: string,
    calculatedAt: Date = new Date()
): MembershipProrationPreview {
    const start = new Date(periodStart).getTime()
    const end = new Date(periodEnd).getTime()
    const duration = end - start
    if (duration <= 0) {
        return {
            unusedCreditAmount: 0,
            creditDiscountApplied: 0,
            remainingCreditAmount: 0,
            finalAmountCharged: newPriceAmount,
        }
    }

    const remainingDuration = Math.max(0, Math.min(end - calculatedAt.getTime(), duration))
    const unusedCreditAmount = Math.max(
        0,
        Math.min(
            existingPriceAmount,
            Math.round((existingPriceAmount * remainingDuration) / duration)
        )
    )
    const creditDiscountApplied = Math.min(unusedCreditAmount, newPriceAmount)
    return {
        unusedCreditAmount,
        creditDiscountApplied,
        remainingCreditAmount: unusedCreditAmount - creditDiscountApplied,
        finalAmountCharged: newPriceAmount - creditDiscountApplied,
    }
}
