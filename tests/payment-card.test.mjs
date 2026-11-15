import assert from 'node:assert/strict'
import test from 'node:test'
import { registerHooks } from 'node:module'

const appRoot = new URL('../app/', import.meta.url)
registerHooks({
    resolve(specifier, context, next) {
        if (specifier.startsWith('~/'))
            return next(new URL(specifier.slice(2) + '.ts', appRoot).href, context)
        return next(specifier, context)
    },
})

const { paymentCardDetailsSchema } = await import('../app/schemas/payment-card.schema.ts')
const { organisationBillingSchema, organisationPaymentCardSchema } =
    await import('../app/schemas/organisation.schema.ts')

const validCard = (overrides = {}) => ({
    cardNumber: '4111111111111111',
    expMonth: '12',
    expYear: String(new Date().getFullYear() + 1),
    cvc: '123',
    ...overrides,
})

test('accepts a Luhn-valid card with a future expiry date', () => {
    assert.equal(paymentCardDetailsSchema.safeParse(validCard()).success, true)
})

test('rejects a card number that fails the Luhn check', () => {
    assert.equal(
        paymentCardDetailsSchema.safeParse(validCard({ cardNumber: '4111111111111112' })).success,
        false
    )
})

test('rejects an expired payment card', () => {
    assert.equal(
        paymentCardDetailsSchema.safeParse(
            validCard({ expMonth: '01', expYear: String(new Date().getFullYear() - 1) })
        ).success,
        false
    )
})

test('rejects invalid month and CVC formats', () => {
    assert.equal(paymentCardDetailsSchema.safeParse(validCard({ expMonth: '13' })).success, false)
    assert.equal(paymentCardDetailsSchema.safeParse(validCard({ cvc: '12' })).success, false)
})

test('organisation billing can be updated without adding a new card', () => {
    const billing = {
        billingFirstName: 'Ada',
        billingLastName: 'Lovelace',
        billingCompany: 'Winery',
        billingAddress: '1 Main Street',
        billingCity: 'London',
        billingStateCode: 'LN',
        billingPostalCode: '12345',
        billingCountryCode: 'GB',
        billingPhone: '1234567890',
    }

    assert.equal(organisationBillingSchema.safeParse(billing).success, true)
    assert.equal(organisationPaymentCardSchema.safeParse(billing).success, false)
    assert.equal(
        organisationPaymentCardSchema.safeParse({ ...billing, ...validCard(), isActive: true })
            .success,
        true
    )
})
