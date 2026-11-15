export const minorUnitsToMajorString = (minorUnits: string): string => {
    if (!/^-?(0|[1-9][0-9]*)$/.test(minorUnits)) {
        throw new RangeError('Money amount must be an integer string in minor units')
    }
    const amount = BigInt(minorUnits)
    const absolute = amount < 0n ? -amount : amount
    const whole = absolute / 100n
    const fraction = (absolute % 100n).toString().padStart(2, '0')
    return `${amount < 0n ? '-' : ''}${whole}.${fraction}`
}

export const majorStringToMinorUnits = (major: string): string => {
    if (!/^-?(0|[1-9][0-9]*)(?:\.[0-9]{1,2})?$/.test(major)) {
        throw new RangeError('Money amount must have at most two decimal places')
    }
    const negative = major.startsWith('-')
    const [whole, fraction = ''] = (negative ? major.slice(1) : major).split('.')
    const minorUnits = BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, '0'))
    return (negative ? -minorUnits : minorUnits).toString()
}
