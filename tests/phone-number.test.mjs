import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
    buildInternationalPhoneNumber,
    parseInternationalPhoneNumber,
} from '../app/utils/phone-number.util.ts'

const countries = [
    { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
    { code: 'IN', dialCode: '+91', name: 'India', flag: '🇮🇳' },
]

test('a prefilled Indian number selects India and separates the national number', () => {
    const parsed = parseInternationalPhoneNumber('+919928920093', countries)

    assert.equal(parsed?.country.code, 'IN')
    assert.equal(parsed?.nationalNumber, '9928920093')
})

test('the selected country and national number rebuild the stored international number', () => {
    assert.equal(buildInternationalPhoneNumber('IN', '99289 20093', countries), '+919928920093')
})

test('a local number is not mistaken for an international country code', () => {
    assert.equal(parseInternationalPhoneNumber('9928920093', countries), null)
})
