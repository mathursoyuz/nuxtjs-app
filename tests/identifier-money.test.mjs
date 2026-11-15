import assert from 'node:assert/strict'
import test from 'node:test'

const { apiIdSchema } = await import('../app/schemas/identifier.schema.ts')
const { minorUnitsToMajorString, majorStringToMinorUnits } =
    await import('../app/utils/money.util.ts')

test('API IDs preserve the full signed bigint range without number conversion', () => {
    const maximum = '9223372036854775807'
    assert.equal(apiIdSchema.parse(maximum), maximum)
    for (const invalid of ['0', '-1', '1.5', 'abc', '9223372036854775808']) {
        assert.equal(apiIdSchema.safeParse(invalid).success, false)
    }
})

test('money conversions preserve cents exactly for large and negative amounts', () => {
    assert.equal(minorUnitsToMajorString('9223372036854775807'), '92233720368547758.07')
    assert.equal(majorStringToMinorUnits('92233720368547758.07'), '9223372036854775807')
    assert.equal(minorUnitsToMajorString('-123'), '-1.23')
    assert.equal(majorStringToMinorUnits('-1.23'), '-123')
    assert.throws(() => majorStringToMinorUnits('1.234'), RangeError)
})
