import assert from 'node:assert/strict'
import test from 'node:test'
import { registerHooks } from 'node:module'

const appRoot = new URL('../app/', import.meta.url)
registerHooks({
    resolve(specifier, context, next) {
        if (specifier.startsWith('~/')) {
            return next(new URL(specifier.slice(2) + '.ts', appRoot).href, context)
        }
        return next(specifier, context)
    },
})

const { createLocationSchema } = await import('../app/schemas/location.schema.ts')
const location = { organisationId: 1, name: 'Warehouse' }

test('location coordinates accept the database range and scale', () => {
    assert.equal(
        createLocationSchema.safeParse({ ...location, lat: '-90', long: '180.00000000' }).success,
        true
    )
})

test('location coordinates reject invalid ranges, precision and text', () => {
    for (const coordinates of [
        { lat: '90.00000001' },
        { lat: '91' },
        { long: '-181' },
        { long: '1.123456789' },
        { lat: 'NaN' },
    ]) {
        assert.equal(createLocationSchema.safeParse({ ...location, ...coordinates }).success, false)
    }
})
