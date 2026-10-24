import type { PhoneCountryCode } from '~/services/api/wrappers/country.api'

export interface ParsedInternationalPhoneNumber {
    country: PhoneCountryCode
    nationalNumber: string
}

export function parseInternationalPhoneNumber(
    value: string,
    countries: PhoneCountryCode[]
): ParsedInternationalPhoneNumber | null {
    if (!value || countries.length === 0) return null

    const compact = value.trim().replace(/[\s().-]/g, '')
    const international = compact.startsWith('00') ? `+${compact.slice(2)}` : compact
    if (!/^\+\d+$/.test(international)) return null

    const country = [...countries]
        .sort((left, right) => right.dialCode.length - left.dialCode.length)
        .find((candidate) => international.startsWith(candidate.dialCode))
    if (!country) return null

    const nationalNumber = international.slice(country.dialCode.length)
    return nationalNumber ? { country, nationalNumber } : null
}

export function buildInternationalPhoneNumber(
    countryCode: string,
    nationalNumber: string,
    countries: PhoneCountryCode[]
): string {
    const digits = nationalNumber.replace(/\D/g, '')
    if (!digits) return ''

    const country = countries.find((candidate) => candidate.code === countryCode)
    return country ? `${country.dialCode}${digits}` : digits
}
