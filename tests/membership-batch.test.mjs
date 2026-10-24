import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const sourcePath = new URL('../app/utils/membership-batch.util.ts', import.meta.url)
let source = readFileSync(sourcePath, 'utf8')
source = source
    .replace(/^import type .*$/gm, '')
    .replace(/^import \{ calculateMembershipProration \}.*$/m, '')
const transpiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText
const exports = {}
const calculateMembershipProration = (existing, next, start, end, now) => {
    const duration = new Date(end).getTime() - new Date(start).getTime()
    const remaining = Math.max(0, new Date(end).getTime() - now.getTime())
    const unusedCreditAmount = Math.round((existing * remaining) / duration)
    const creditDiscountApplied = Math.min(unusedCreditAmount, next)
    return {
        unusedCreditAmount,
        creditDiscountApplied,
        remainingCreditAmount: unusedCreditAmount - creditDiscountApplied,
        finalAmountCharged: next - creditDiscountApplied,
    }
}
new Function('exports', 'calculateMembershipProration', transpiled)(
    exports,
    calculateMembershipProration
)

const membership = (id, group, tier, price) => ({
    id,
    membershipTypeId: group,
    membershipGroupName: `Group ${group}`,
    tierRank: tier,
    priceAmount: price,
})
const subscription = {
    id: 7,
    membershipTypeId: 1,
    membershipId: 11,
    membershipName: 'Silver',
    membershipGroupName: 'Group 1',
    tierRank: 1,
    priceAmount: 1000,
    status: 'ACTIVE',
    currentPeriodStart: '2026-10-01T00:00:00.000Z',
    currentPeriodEnd: '2026-11-01T00:00:00.000Z',
}

test('allows one independent selection in each membership group', () => {
    const groups = exports.groupMembershipOptions(
        [membership(11, 1, 1, 1000), membership(12, 1, 2, 2000), membership(21, 2, 1, 500)],
        [subscription]
    )
    assert.equal(groups.length, 2)
    assert.equal(
        exports.membershipBatchOperation(
            groups.find((group) => group.id === 1),
            12
        ),
        'UPGRADE'
    )
    assert.equal(
        exports.membershipBatchOperation(
            groups.find((group) => group.id === 2),
            21
        ),
        'JOIN'
    )
})

test('does not classify a cross-group membership as a tier change', () => {
    const group = exports.groupMembershipOptions([membership(11, 1, 1, 1000)], [subscription])[0]
    assert.equal(exports.membershipBatchOperation(group, 21), 'KEEP')
})

test('shows unused, applied, forfeited, and charged amounts for immediate downgrade', () => {
    const current = { ...subscription, membershipId: 12, tierRank: 2, priceAmount: 2000 }
    const group = exports.groupMembershipOptions(
        [membership(11, 1, 1, 400), membership(12, 1, 2, 2000)],
        [current]
    )[0]
    const result = exports.membershipBatchBreakdown(
        group,
        11,
        true,
        new Date('2026-10-16T12:00:00.000Z')
    )
    assert.equal(result.operation, 'DOWNGRADE')
    assert.ok(result.unusedCreditAmount > 0)
    assert.equal(result.creditDiscountApplied, 400)
    assert.equal(result.finalAmountCharged, 0)
    assert.ok(result.forfeitedCreditAmount > 0)
})
